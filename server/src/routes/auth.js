const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../utils/prisma');
const notifications = require('../services/notifications');

const router = express.Router();

// POST /api/v1/auth/register — customers only
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: 'customer', phone },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login — all roles
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration, but still log the attempt
    if (!user) {
      console.log(`[Auth] Password reset requested for non-existent email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    try {
      // Store the reset token
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      // Send reset email
      await notifications.sendPasswordResetEmail(user.email, user.name, token);
      
      console.log(`[Auth] Password reset email sent successfully to: ${email}`);
      res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      
    } catch (emailError) {
      console.error(`[Auth] Failed to send password reset email to ${email}:`, emailError);
      
      // Clean up the token if email failed
      try {
        await prisma.passwordResetToken.deleteMany({
          where: { userId: user.id, token }
        });
      } catch (cleanupError) {
        console.error('[Auth] Failed to cleanup token after email failure:', cleanupError);
      }
      
      // For security, we still return success message to prevent email enumeration,
      // but we log the actual error for debugging
      res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

  } catch (err) {
    console.error('[Auth] Forgot password error:', err);
    next(err);
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find and validate the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the user's password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    res.json({ message: 'Password has been successfully updated' });
  } catch (err) {
    next(err);
  }
});

// Test email configuration endpoint (for development/debugging)
router.post('/test-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    console.log(`[Auth] Testing email configuration by sending to: ${email}`);

    // Check email configuration
    const isConfigured = notifications.checkEmailConfig();
    if (!isConfigured) {
      return res.status(500).json({ 
        error: 'Email service is not properly configured',
        details: 'Check server logs and .env configuration'
      });
    }

    // Test email connection
    const connectionTest = await notifications.testEmailConfiguration();
    if (!connectionTest) {
      return res.status(500).json({ 
        error: 'Email service connection test failed',
        details: 'Check SMTP credentials and server connectivity'
      });
    }

    // Send a test password reset email
    await notifications.sendPasswordResetEmail(email, 'Test User', 'test-token-' + Date.now());
    
    res.json({ 
      message: 'Test email sent successfully!',
      details: 'Check the recipient inbox. If using Mailtrap, check your Mailtrap inbox.',
      configuration: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        isProduction: process.env.SMTP_HOST !== 'smtp.mailtrap.io'
      }
    });
    
  } catch (error) {
    console.error('[Auth] Test email failed:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

module.exports = router;
