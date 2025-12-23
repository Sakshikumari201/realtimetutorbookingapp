const fs = require('fs');
const path = require('path');

const content = [
  'MONGODB_URI=mongodb://127.0.0.1:27017/tutor_booking',
  'PORT=3001',
  'JWT_SECRET=super-secure-jwt-secret-key',
  'JWT_EXPIRES_IN=7d',
  'ADMIN_SECRET_KEY=your-admin-secret-key'
].join('\n');

fs.writeFileSync(path.join(__dirname, '.env'), content);
console.log('.env file written successfully');
