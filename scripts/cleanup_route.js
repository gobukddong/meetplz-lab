const fs = require('fs');
const path = require('path');

const target = path.join('c:', 'Users', 'gobuk', 'Desktop', 'meetplz-lab', 'app', 'meetings', '%5Bid%5D');

if (fs.existsSync(target)) {
  console.log('Found:', target);
  fs.rmSync(target, { recursive: true, force: true });
  console.log('Deleted successfully');
} else {
  console.log('Not found:', target);
  // List all directories to see what we have
  const parent = path.dirname(target);
  if (fs.existsSync(parent)) {
    console.log('Parent contents:', fs.readdirSync(parent));
  }
}
