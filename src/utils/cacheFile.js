const path = require('path');
const { readFile, writeFile } = require('cache-io-disk');

module.exports = {
  readFile,
  writeFile,
  writeDirFiles: writeFiles,
};
