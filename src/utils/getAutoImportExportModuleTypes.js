const fse = require('fs-extra');
const { exportModuleTypes, } = require('auto-import-module');

module.exports = function (dir) {
  const dirs = fse.readdirSync(dir);
  const exprotModule = {};
  dirs.forEach((dir => {
    const filename = dir.replace(/[\s\S]+\//, '');
    if (filename.match(/^[^.]+$/)) {
      exprotModule[`/${filename}$`] = exportModuleTypes.FILE_NAME_MODULE;
    }
  }))
  return exprotModule;
}
