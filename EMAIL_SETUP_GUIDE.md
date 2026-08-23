# 📧 Email Setup Guide for DeliverySync

## Current Status
- **Development**: Using Mailtrap (emails are captured for testing, not delivered to real inboxes)
- **Production**: Needs real email provider configuration

## Quick Setup Options

### 🎯 Option 1: Gmail (Easiest - Recommended for Getting Started)

**Perfect for**: Small to medium applications, quick setup

**Steps:**
1. Go to your Gmail account settings
2. Enable 2-Factor Authentication (required for app passwords)
3. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a 16-character password
4. Update your `.env` file:

```env
# Comment out the Mailtrap section and use this instead:
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-digit-app-password"
SMTP_FROM="DeliverySync <your-gmail@gmail.com>"
```

5. Restart the server
6. Test with: `POST /api/v1/auth/test-email` with `{"email": "test@example.com"}`

---

### 🚀 Option 2: SendGrid (Production - Recommended for High Volume)

**Perfect for**: Production applications, high email volume, professional delivery

**Steps:**
1. Create account at [SendGrid.com](https://sendgrid.com)
2. Verify your sender identity (email or domain)
3. Generate API Key:
   - Go to Settings → API Keys → Create API Key
   - Give it "Full Access" or "Mail Send" permissions
4. Update your `.env` file:

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="DeliverySync <noreply@yourdomain.com>"
```

**Pricing**: Free tier (100 emails/day), paid plans from $19.95/month

---

### 💼 Option 3: AWS SES (Enterprise - Cheapest for High Volume)

**Perfect for**: Large applications, cost-effective at scale

**Steps:**
1. Enable AWS SES in your AWS account
2. Verify your email/domain
3. Request production access (if needed)
4. Create SMTP credentials in SES console
5. Update your `.env` file:

```env
SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-aws-smtp-username"
SMTP_PASS="your-aws-smtp-password"
SMTP_FROM="DeliverySync <noreply@yourdomain.com>"
```

**Pricing**: $0.10 per 1,000 emails (incredibly cheap at scale)

---

### 📧 Option 4: Microsoft Outlook

**Perfect for**: Organizations already using Office 365

```env
SMTP_HOST="smtp.office365.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-outlook@outlook.com"
SMTP_PASS="your-outlook-password"
SMTP_FROM="DeliverySync <your-outlook@outlook.com>"
```

---

## Testing Your Email Configuration

### 1. Automatic Server Test
When you start the server, it will automatically test the email configuration and show status.

### 2. Manual API Test
Send a POST request to `/api/v1/auth/test-email`:

```bash
curl -X POST http://localhost:4000/api/v1/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### 3. Real Password Reset Test
1. Go to the forgot password page
2. Enter a real email address
3. Check your inbox for the reset email

---

## Troubleshooting

### ❌ "SMTP connection failed"
- **Gmail**: Make sure 2FA is enabled and you're using an app password, not your regular password
- **SendGrid**: Verify your API key has correct permissions
- **AWS SES**: Check your region and credentials
- **General**: Verify SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are correct

### ❌ "Authentication failed"
- Double-check your username and password
- For Gmail: Use app password, not account password
- For SendGrid: Username should be exactly "apikey"

### ❌ "Email sent but not received"
- Check spam/junk folder
- Verify the sender email is properly configured
- For AWS SES: Make sure you're not in sandbox mode

### ❌ "Connection timeout"
- Check if your firewall/hosting provider blocks SMTP ports
- Try different SMTP ports (25, 465, 587, 2525)

---

## Production Checklist

- [ ] Real email provider configured (not Mailtrap)
- [ ] Sender email address verified with the provider
- [ ] CLIENT_URL points to your production domain
- [ ] Test email endpoint works
- [ ] Full password reset flow tested
- [ ] Email delivery monitored and logged

---

## Security Notes

- **Never commit email credentials to version control**
- Use environment variables for all sensitive data
- Enable 2FA on your email provider account
- Monitor email sending for abuse
- Implement rate limiting for forgot-password requests
- Use proper sender reputation management

---

## Current Configuration Status

Check your server startup logs for configuration status:
- ✅ Green: Everything configured correctly
- ⚠️ Yellow: Using development configuration (Mailtrap)
- ❌ Red: Configuration issues need attention

Run the test endpoint to verify your setup works before deploying to production.