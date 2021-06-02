const path = require('path');
const { success } = require('console-log-cmd');
const { writeFiles } = require('../utils/cacheFile');

/**
 * 使用多个新旧值替换文件内容
 * @param replaceDir
 * @param changeKeyList
 * @returns {Promise<T>}
 */
module.exports = function (replaceDir, changeKeyList) {
  return writeFiles(replaceDir, (content, target) => {
    return replaceList(replaceDir, target, content, changeKeyList);
  });
}

/**
 * 按新旧值列表顺序替换内容
 * @param rootDir
 * @param target
 * @param content
 * @param changeKeysObject
 */
function replaceList(rootDir, target, content, changeKeysObject) {
  const replaceRegExpList = Object.keys(changeKeysObject).map((newKey) => {
    const oldKey = changeKeysObject[newKey];
    return [new RegExp(`(['"])${oldKey.replace(/\\./g, '\\.')}(['"])`, 'g'), oldKey, newKey];
  });
  debugger
  return replaceRegExpList.reduce((value, [replaceRegExp, oldKey, newKey]) => {
    return replaceContent(rootDir, target, content, replaceRegExp, oldKey, newKey);
  }, content)
}

/**
 * 使用新旧值替换内容
 * @param rootDir
 * @param target
 * @param content
 * @param replaceRegExp
 * @param newKey
 */
function replaceContent(rootDir, target, content, replaceRegExp, oldKey, newKey) {
  if (!content.replace) {
    debugger
  }
  const newContent = content.replace(replaceRegExp, (all, $1, $2) => {
    return `${$1}${newKey}${$2}`;
  });
  if (newContent !== content) {
    success(`[键值修改] 新值 ${newKey} 替换旧值 ${oldKey} 成功: ${target.replace(path.join(rootDir, '/'), '')}`);
  }
  return newContent;
}
