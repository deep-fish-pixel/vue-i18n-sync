const path = require('path');
const { success, error } = require('console-log-cmd');
const { getFileContent, writeFile, writeFiles } = require('../utils/cacheFile');
const { getModuleOptions } = require('../utils/moduleOptions');

/**
 * 对修改键值的文件内容替换
 * @param target
 */
module.exports = function fileReplace(target) {
  Promise.all([getFileContent(target, true)])
    .then(([targetContent]) => {
      const {
        changeUseI18nReplace: {
          replaceTargetRegExp,
          replacePropagationRegExpHandle,
          replaceTargetHandle,
          replacePropagationHandle,
        },
        replaceDir,
      } = getModuleOptions();
      let replacePropagationRegExpObj;
      let replaceMatchArgs;
      const newTargetContent = targetContent.replace(replaceTargetRegExp, (...args) => {
        replaceMatchArgs = args;
        replacePropagationRegExpObj = replacePropagationRegExpHandle(...args);
        return replaceTargetHandle(...args);
      });
      if (newTargetContent != targetContent) {
        writeFile(target, newTargetContent).then((result) => {
          if (result) {
            success(`[键值修改] 新值 ${replacePropagationRegExpObj.newKey} 替换旧值 ${replacePropagationRegExpObj.oldKey} 成功: ${target.replace(path.join(replaceDir, '/'), '')}`);
          } else {
            error(`[键值修改] 新值 ${replacePropagationRegExpObj.newKey} 替换旧值 ${replacePropagationRegExpObj.oldKey} 失败: ${target.replace(path.join(replaceDir, '/'), '')}`);
          }
        });
      }
      if (replaceMatchArgs) {
        return writeFiles(replaceDir, (content, target) => {
          const newContent = content.replace(replacePropagationRegExpObj.regExp, (...args) => {
            return replacePropagationHandle(replaceMatchArgs, ...args);
          });
          if (newContent !== content) {
            success(`[键值修改] 新值 ${replacePropagationRegExpObj.newKey} 替换旧值 ${replacePropagationRegExpObj.oldKey} 成功: ${target.replace(path.join(replaceDir, '/'), '')}`);
          }
          return newContent;
        });
      }
    });
}
