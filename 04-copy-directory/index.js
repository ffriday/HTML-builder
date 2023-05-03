const path = require('node:path');
const fs = require('node:fs/promises');

async function copyDir(dirName) {
  const fullPath = path.join(__dirname, dirName);
  const newPath = path.join(__dirname, `${dirName}-copy`);
  const fileList = await fs.readdir(fullPath, { withFileTypes: true });
  await fs.mkdir(newPath, { recursive: true });
  fileList.forEach((value) => {
    fs.copyFile(path.join(fullPath, value.name), path.join(newPath, value.name));
  });
}

copyDir('files');
