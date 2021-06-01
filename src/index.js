const path = require('path');
const chokidar = require('chokidar');
const { getFileContent } = require('./utils/cacheFile');
const { setModuleOptions } = require('./utils/moduleOptions');
const fileReplace = require('./core/fileReplace');
const fileReplaceDir = require('./core/fileReplaceDir');

const {
  setFileSyncOptions,
  addFileSync,
  changeFileSync,
  removeFileSync,
  addDirSync,
  removeDirSync,
} = require('object-file-sync')
const filterSync = require('./core/filterSync');

module.exports = function (options = {}) {
  options = Object.assign({
    // 同步目录共同的根目录。
    i18nRoot: '',
    // 保持并行同步的目录。可不配置，根据root自动生成
    i18nDirs: [],
    // 创建目录的默认入口index文件的后缀名
    defaultIndexExtension: options.defaultIndexExtension || '.js',
    // 自动引用目录模块
    autoImportModule: true,
    // 键映射配置
    i18nKeyMap: {
      'views': 'page',
    },
    // 设置key文件位置的分割符，为空表示不分离
    i18nSetKeyToFileSeperator: '.',
    // 修改配置key的回调
    changeI18nKeyHandle: (changeKeyList) => {
      return fileReplaceDir(path.join(process.cwd(), 'test/src'), changeKeyList);
    },
    // 替换目标字符串的根目录
    replaceDir: path.join(process.cwd(), 'test/src'),
    changeUseI18nReplace: {
      replaceTargetRegExp: /(\{\{\s*|="\s*)(\$t\(\s*['"])([\w-.]+)>([\w-.]+)('\s*\)\s*"|"\s*\)\s*}})/g,
      replacePropagationRegExpHandle: (all, $1, $2, $3, $4) => {
        return {
          regExp: new RegExp(`([\'\"])` + $3.replace(/\\./g, '\\.') + `([\'\"])`, 'g'),
          oldKey: $3,
          newKey: $4,
        }
      },
      replaceTargetHandle: (all, $1, $2, $3, $4, $5) => {
        return `${$1}${$2}${$4}${$5}`;
      },
      replacePropagationHandle: (replaceTargetMatches, all, $1, $2) => {
        return `${$1}${replaceTargetMatches[4]}${$2}`;
      }
    },
  }, options);

  setModuleOptions(options);

  setFileSyncOptions({
    root: options.i18nRoot,
    dirs: options.i18nDirs,
    defaultIndexExtension: options.defaultIndexExtension,
    autoImportModule: options.autoImportModule,
    changeKeyHandle: options.changeI18nKeyHandle,
    keyMap: options.i18nKeyMap,
    setKeyToFileSeperator: options.i18nSetKeyToFileSeperator
  });

  const watcher = chokidar.watch(options.replaceDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  const fileFilterSync = filterSync(options.replaceDir);

  watcher
    .on('add', path => {
      fileFilterSync(path)(addFileSync);
      getFileContent(path);
    })
    .on('change', path => {
      fileFilterSync(path)(changeFileSync);
      fileReplace(path);
    })
    .on('unlink', path => {
      fileFilterSync(path)(removeFileSync);
    })
    .on('addDir', path => {
      fileFilterSync(path)(addDirSync);
    })
    .on('unlinkDir', path => {
      fileFilterSync(path)(removeDirSync);
    });
}
