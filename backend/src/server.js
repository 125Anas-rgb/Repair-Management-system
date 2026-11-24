const app = require('./app');
const env = require('./config/env');

// 0.0.0.0 so phones on the same Wi-Fi can reach the API.
app.listen(env.port, '0.0.0.0', () => {
  console.log(`RepairTrack API running on http://localhost:${env.port}/api/v1/health`);
});
