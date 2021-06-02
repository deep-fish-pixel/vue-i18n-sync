const path = require('path');
const { error } = require('console-log-cmd');
const fse = require('fs-extra');
const { getRelativeDir } = require('./moduleOptions');

const cacheFileMap = new Map();

/**
 * 获取文件内容并缓存
 * @param file
 * @param noCache
 * @returns {Promise<boolean|any>|Promise<T>}
 */
function getFileContent(file, noCache) {
  const content = noCache ? false : cacheFileMap.get(file);
  if (content) {
    return Promise.resolve(content);
  } else {
    return fse.readFile(file, 'utf8').then((content) => {
      // 缓存文件
      cacheFileMap.set(file, content);
      return content;
    }).catch((e) => {
      error(`[读取文件失败]不存在该文件: ${getRelativeDir(file)}`)
    });
  }
}

/**
 * 写入文件内容并缓存
 * @param file
 * @param content
 * @returns {Promise<T>}
 */
function writeFile(file, content) {
  return fse.writeFile(file, content).then(() => {
    // 缓存文件
    cacheFileMap.set(file, content);
    return true;
  }).catch((e) => {
    error(`[写入文件失败] ${getRelativeDir(file)} ${e.message}`)
    return false;
  })
}

/**
 * 指定父级目录，写入所有文件内容并缓存
 * @returns {Promise<T>}
 * @param dir
 * @param callback
 */
function writeFiles(dir, callback) {
  const dirEndFlag = path.join(dir, '/');
  cacheFileMap.forEach((content, filePath, map) => {
    if (filePath.indexOf(dirEndFlag) === 0) {
      const newContent = callback(content, filePath);
      if (newContent !== content) {
        writeFile(filePath, newContent);
      }
    }
  });
}

module.exports = {
  getFileContent,
  writeFile,
  writeFiles,
};
