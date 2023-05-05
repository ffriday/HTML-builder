const path = require('node:path');
const fs = require('node:fs');
// const { env } = require('node:process');

const ENV = {
  dist: 'project-dist',
  assets: 'assets',
  css: 'styles',
  cssName: 'style.css',
  template: 'template.html',
  components: 'components',
  index: 'index.html',
};

async function dirList(fullPath) {
  const dir = await fs.promises.readdir(fullPath, { withFileTypes: true });
  const result = await Promise.all(dir.map((v) => (async (value) => {
    const { name, ext } = path.parse(value.name);
    return {
      name,
      ext,
      isDirectory: value.isDirectory(),
    };
  })(v)));
  return result;
}

async function makeDir(dirPath, removeIfExist = true) {
  const dir = await fs.promises.readdir(__dirname, { withFileTypes: true });

  const dirExist = dir.filter((value) => value.isDirectory())
    .filter((value) => value.name === path.parse(dirPath).name).length;
  if (removeIfExist && dirExist) {
    await fs.promises.rm(dirPath, { recursive: true, force: true });
  }
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function copyFile(sourcePath, destPath) {
  fs.promises.copyFile(path.join(sourcePath), path.join(destPath));
}

async function copyDir(sourcePath, destinationPath) {
  const list = await dirList(sourcePath);
  if (list && list.length > 0) {
    list.forEach((value) => {
      if (value.isDirectory) {
        const p = path.join(destinationPath, value.name);
        makeDir(p)
          .then(() => copyDir(
            path.join(sourcePath, value.name),
            path.join(destinationPath, value.name),
          ));
      } else {
        copyFile(path.join(sourcePath, `${value.name}${value.ext}`), path.join(destinationPath, `${value.name}${value.ext}`));
      }
    });
  }
}

async function collectCss(inputDir, outputDir, outputFileName, ext = 'css') {
  const outputPath = path.join(__dirname, outputDir, outputFileName);
  let files = await dirList(path.join(__dirname, ENV.css));
  files = files.map((value) => path.join(__dirname, ENV.css, `${value.name}${value.ext}`));
  const sourceFiles = files.filter((value) => value.split('.').pop() === ext);
  const writer = fs.createWriteStream(outputPath, { encoding: 'utf-8' });
  sourceFiles.forEach((value) => {
    const reader = fs.createReadStream(value);
    reader.on('data', (chunk) => writer.write(chunk.toString()));
  });
}

async function collectHtml(templatePath, componentsPath, resultPath) {
  const templateReader = fs.createReadStream(templatePath);
  const indexWriter = fs.createWriteStream(resultPath);
  let content = '';
  await templateReader.on('data', (chunkTemplate) => {
    content = chunkTemplate.toString();
    const anchors = chunkTemplate.toString().match(/{{\w*}}/g)
      .map((value) => value.replace(/{|}/g, '')); // Get all anchor tags and transform to 'filename'
    if (anchors.length) {
      anchors.forEach((value) => {
        const reader = fs.createReadStream(path.join(componentsPath, `${value}.html`));
        reader.on('data', (chunkComp) => {
          content = content.replace(`{{${value}}}`, chunkComp.toString());
        });
      });
    }
  });
  templateReader.on('close', () => indexWriter.write(content));
}

async function bundle() {
  await makeDir(path.join(__dirname, ENV.dist));
  await copyDir(path.join(__dirname, ENV.assets), path.join(__dirname, ENV.dist, ENV.assets));
  await collectCss(ENV.css, ENV.dist, ENV.cssName);
  await collectHtml(
    path.join(__dirname, ENV.template),
    path.join(__dirname, ENV.components),
    path.join(__dirname, ENV.dist, ENV.index),
  );
}

bundle();
