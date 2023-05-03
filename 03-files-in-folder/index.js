const path = require('node:path');
const fs = require('node:fs/promises');

async function fileInfo(dirName) {
  const fullPath = path.join(__dirname, dirName);
  const dir = await fs.readdir(fullPath, { withFileTypes: true });
  const files = dir.filter((value) => !value.isDirectory());
  const result = await Promise.all(files.map((v) => (async (value) => {
    const { name, ext } = path.parse(value.name);
    const { size } = await fs.stat(path.join(fullPath, value.name));
    return {
      name,
      ext,
      size,
    };
  })(v)));
  return result;
}

async function printFiles(dirName) {
  const info = await fileInfo(dirName);
  info.forEach((value) => {
    // eslint-disable-next-line no-console
    console.log(`${value.name} - ${value.ext.replace('.', '')} - ${value.size / 1000} kb`);
  });
}

printFiles('secret-folder');
