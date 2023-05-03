const path = require('node:path');
const fs = require('node:fs');
const process = require('node:process');
// eslint-disable-next-line import/no-unresolved
const readline = require('node:readline/promises');

function writeText(fileName) {
  const fullPath = path.join(__dirname, fileName);
  const file = fs.createWriteStream(fullPath, { encoding: 'utf-8' });
  const rl = readline.createInterface(
    {
      input: process.stdin,
      output: process.stdout,
    },
  );
  rl.write('Hello! Write something please:\n');
  rl.on('line', (input) => {
    if (input === 'exit') {
      rl.write('Bye!');
      file.close();
      rl.close();
    } else {
      file.write(`${input}\n`);
    }
  });
  rl.on('SIGINT', () => {
    rl.write('Bye!');
    rl.close();
  });
}

writeText('text.txt');
