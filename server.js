require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 ProTrackIt Server is LIVE on port ${PORT}`);
});

// Keep the event loop active for specific environment compatibility
setInterval(() => {}, 60000);
