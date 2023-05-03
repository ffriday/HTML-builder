const path = require('node:path');
const fs = require('node:fs');

function readText(fileName) {
  const fullPath = path.join(__dirname, fileName);
  const text = fs.createReadStream(fullPath);
  // eslint-disable-next-line no-console
  text.on('data', (chunk) => console.log(chunk.toString()));
}

readText('text.txt');
