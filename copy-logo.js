const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\fumam\\.gemini\\antigravity\\brain\\75a45aa1-51ae-40bd-a391-58d977b0ec59\\media__1779524828105.jpg';
const destPath = path.join(__dirname, 'public', 'autoland-logo.jpg');

try {
  fs.copyFileSync(srcPath, destPath);
  console.log('Logo copied successfully to ' + destPath);
} catch (error) {
  console.error('Error copying logo:', error);
}
