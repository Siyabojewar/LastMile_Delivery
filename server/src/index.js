require('dotenv').config();
const app = require('./app');
const { checkEmailConfig, testEmailConfiguration } = require('./services/notifications');

const PORT = process.env.PORT || 4000;

// Check email configuration on startup
console.log('[Server] Checking email configuration...');
checkEmailConfig();

app.listen(PORT, async () => {
  console.log(`DeliverySync API running on port ${PORT}`);
  
  // Test email configuration after server starts
  const emailReady = await testEmailConfiguration();
  if (emailReady) {
    console.log('[Server] ✅ All systems ready');
  } else {
    console.log('[Server] ⚠️  Server running but email system needs attention');
  }
});
