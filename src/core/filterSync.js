const path = require('path');

function noop(callback) {}

/**
 * 根据是否属于根路径再执行
 * @param root
 * @returns {(function(*): (function(*): *))|*}
 */
module.exports = function (root){
  const i18nRoot = path.join(root, '/');
  return function (file) {
    if (file.indexOf(i18nRoot) === 0) {
      return function (callback) {
        return callback(file);
      }
    } else {
      return noop;
    }
  }
}
