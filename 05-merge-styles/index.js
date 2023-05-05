const path = require('node:path');
const fs = require('node:fs');

async function getFilePaths(dirName) {
  const fullPath = path.join(__dirname, dirName);
  const dir = await fs.promises.readdir(fullPath, { withFileTypes: true });
  const files = dir.filter((value) => !value.isDirectory());
  const result = await Promise.all(files.map((v) => (async (value) => {
    const { name, ext } = path.parse(value.name);
    return path.join(fullPath, `${name}${ext}`);
  })(v)));
  return result;
}

async function bundle(inputDir, outputDir, outputFileName, ext) {
  const outputPath = path.join(__dirname, outputDir, `${outputFileName}.${ext}`);
  const files = await getFilePaths(inputDir);
  const sourceFiles = files.filter((value) => value.split('.').pop() === ext);
  const writer = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
  sourceFiles.forEach((value) => {
    const reader = fs.createReadStream(value);
    reader.on('data', (chunk) => writer.write(chunk.toString()));
  });
}

bundle('styles', 'project-dist', 'bundle', 'css');
