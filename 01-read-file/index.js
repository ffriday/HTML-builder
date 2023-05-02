const path = require('node:path');
const fs = require('node:fs');

function readText(fileName) {
  const fullPath = path.join(__dirname, fileName);
  let text = fs.createReadStream(fullPath);
  text.on('data', (chunk) => console.log(chunk.toString()))
}

readText('text.txt');