const nodemailer = require('nodemailer');
const prisma = require('../utils/prisma');

let transporter;

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');

    // Warn if using the deprecated Mailtrap hostname — emails will be rejected
    if (host === 'smtp.mailtrap.io') {
      console.error('[Email] ⚠️  CRITICAL: SMTP_HOST is set to deprecated "smtp.mailtrap.io".');
      console.error('[Email] ⚠️  Mailtrap free tier now requires: host=sandbox.smtp.mailtrap.io port=2525');
      console.error('[Email] ⚠️  Update SMTP_HOST and SMTP_PORT in your Render environment variables.');
    }

    const config = {
      host,
      port,
      secure: process.env.SMTP_SECURE === 'true',
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      config.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      };
    }

    console.log(`[Email] Configuring SMTP with host: ${config.host}:${config.port}, secure: ${config.secure}`);
    
    transporter = nodemailer.createTransport(config);
    
    transporter.verify(function(error) {
      if (error) {
        console.error('[Email] ❌ SMTP connection verification failed:', error.message);
        console.error('[Email] ❌ Emails will NOT be delivered until SMTP config is fixed.');
        if (error.message && error.message.includes('535')) {
          console.error('[Email] ❌ Authentication failed — check SMTP_USER and SMTP_PASS.');
        }
        if (error.message && error.message.includes('ECONNREFUSED')) {
          console.error('[Email] ❌ Connection refused — check SMTP_HOST and SMTP_PORT.');
        }
        // Reset transporter so the next request retries
        transporter = null;
      } else {
        console.log('[Email] ✅ SMTP server is ready to take our messages');
      }
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
      <h2 style="color: #1d4ed8;">DeliverySync</h2>
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
        This is an automated notification from DeliverySync.
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

/**
 * Sends a password reset email with a secure token link.
 *
 * @param {string} email - recipient email address
 * @param {string} name - recipient name
 * @param {string} token - password reset token
 */
async function sendPasswordResetEmail(email, name, token) {
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    console.log(`[Email] Sending password reset email to: ${email}`);
    console.log(`[Email] Reset URL: ${resetUrl}`);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your DeliverySync Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; background-color: #f8f9fa;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%); border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      🔐 DeliverySync
                    </h1>
                    <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                      Password Reset Request
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                      Hi <strong>${name}</strong>,
                    </p>
                    <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                      You requested a password reset for your DeliverySync account. Click the button below to set a new password:
                    </p>
                    
                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center" style="padding: 30px 0;">
                          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4); transition: all 0.2s ease;">
                            Reset Your Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Security notice -->
                    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 500;">
                        ⚠️ <strong>Security Notice:</strong><br>
                        This link will expire in 1 hour for your security. If you didn't request this reset, you can safely ignore this email.
                      </p>
                    </div>
                    
                    <!-- Alternative link -->
                    <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      If the button doesn't work, copy and paste this link into your browser:<br>
                      <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      This is an automated message from DeliverySync.
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@deliverysync.com',
      to: email,
      subject: '🔐 Reset Your DeliverySync Password',
      html: htmlContent,
    };

    const result = await getTransporter().sendMail(mailOptions);
    console.log(`[Email] Password reset email sent successfully:`, result.messageId);
    return result;
    
  } catch (error) {
    console.error(`[Email] Failed to send password reset email:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * Test email configuration by sending a test email
 */
async function testEmailConfiguration() {
  try {
    console.log('[Email] Testing email configuration...');
    
    const transporter = getTransporter();
    const testResult = await transporter.verify();
    
    if (testResult) {
      console.log('[Email] ✅ Email configuration is valid and ready');
      return true;
    } else {
      console.log('[Email] ❌ Email configuration verification failed');
      return false;
    }
  } catch (error) {
    console.error('[Email] ❌ Email configuration test failed:', error.message);
    return false;
  }
}

/**
 * Check if email service is properly configured for production
 */
function checkEmailConfig() {
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`[Email] ⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('[Email] Password reset emails may not work properly');
    return false;
  }
  
  if (process.env.SMTP_HOST === 'smtp.mailtrap.io') {
    console.error('[Email] ❌ SMTP_HOST="smtp.mailtrap.io" is the DEPRECATED Mailtrap endpoint — emails will be rejected.');
    console.error('[Email] ❌ Fix on Render dashboard: set SMTP_HOST=sandbox.smtp.mailtrap.io and SMTP_PORT=2525');
    return false;
  }

  if (process.env.SMTP_HOST === 'sandbox.smtp.mailtrap.io') {
    console.log('[Email] ✅ Using Mailtrap sandbox — emails captured at https://mailtrap.io/inboxes');
  }
  
  return true;
}

module.exports = { sendStatusEmail, sendPasswordResetEmail, testEmailConfiguration, checkEmailConfig };
