const nodemailer = require('nodemailer');
const prisma = require('../utils/prisma');

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends an email notification for an order status change and logs the result.
 *
 * @param {object} order - order with customer relation populated
 * @param {string} status - the new status
 */
async function sendStatusEmail(order, status) {
  const recipient = order.customer?.email;
  if (!recipient) return;

  const subject = `Order #${order.id} — ${status}`;
  const body = buildEmailBody(order, status);

  let notifStatus = 'sent';
  try {
    const t = getTransporter();
    await t.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: recipient,
      subject,
      html: body,
    });
  } catch (err) {
    console.error(`[Notifications] Email failed for order ${order.id}:`, err.message);
    notifStatus = 'failed';
  }

  // Always log the attempt
  try {
    await prisma.notificationLog.create({
      data: {
        orderId: order.id,
        channel: 'email',
        recipient,
        subject,
        status: notifStatus,
      },
    });
  } catch (logErr) {
    console.error('[Notifications] Failed to write notification log:', logErr.message);
  }

  // SMS stub — log only
  stubSms(order, status);
}

function buildEmailBody(order, status) {
  const statusMessages = {
    Created: 'Your order has been created and is awaiting pickup.',
    PickedUp: 'Your package has been picked up and is on its way.',
    InTransit: 'Your package is in transit to the destination.',
    OutForDelivery: 'Your package is out for delivery today.',
    Delivered: 'Your package has been successfully delivered. Thank you!',
    Failed: 'Unfortunately, your delivery attempt was unsuccessful. You can reschedule via the portal.',
    Rescheduled: 'Your delivery has been rescheduled.',
  };

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1d4ed8;">Last-Mile Delivery Tracker</h2>
      <p>Hi ${order.customer?.name || 'Customer'},</p>
      <p>${statusMessages[status] || `Your order status has been updated to: <strong>${status}</strong>`}</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Order ID</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${order.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Status</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${status}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>From</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${order.pickupAddress}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>To</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${order.dropAddress}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Total Charge</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">₹${order.totalCharge}</td>
        </tr>
      </table>
      <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
        This is an automated notification from Last-Mile Delivery Tracker.
      </p>
    </div>
  `;
}

function stubSms(order, status) {
  // SMS stub: log-only. Wire a real provider (e.g. Twilio) here when needed.
  console.log(
    `[SMS-STUB] Would send SMS to customer ${order.customerId}: Order #${order.id} → ${status}`
  );
}

module.exports = { sendStatusEmail };
