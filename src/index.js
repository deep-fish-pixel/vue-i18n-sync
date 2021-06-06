const path = require('path');
const chokidar = require('chokidar');
const { readFile } = require('cache-io-disk');
const { setModuleOptions } = require('./utils/moduleOptions');
const getAutoImportExportModuleTypes = require('./utils/getAutoImportExportModuleTypes');
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
    // 同步配置根目录
    i18nRoot: '',
    // 保持并行同步的目录。默认根据root自动生成
    i18nDirs: [],
    // 创建配置文件的后缀名 默认.js
    extension: options.extension || '.js',
    // 排除同步目录
    excludeSyncDirRegExp: null,
    // 自动import模块 默认true
    autoImportModule: true,
    // 键映射配置
    i18nKeyMap: {
      'views': 'page',
    },
    // 处理的文件类型
    fileExtensions: /\.(js|ts|jsx|html|vue)$/,
    // 设置key文件位置的分割符，为空表示不分离
    i18nSetKeyToFileSeperator: '.',
    // 自动导出方式配置
    autoImportExportModuleTypes: getAutoImportExportModuleTypes(options.i18nRoot),
    // 修改配置key的回调
    changeI18nKeyHandle: (changeKeyList) => {
      return fileReplaceDir(options.replaceDir, changeKeyList);
    },
    // 修改目标字符串的根目录
    replaceDir: '',
    changeUseI18nReplace: {
      replaceTargetRegExp: /(\{\{\s*|="\s*|\.)(\$t\(\s*['"])([\w-._]+)>([\w-_.]+)('\s*\)\s*["']|["']\s*\)\s*}}|["']\s*\)\s*[^\w-])/g,
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
    extension: options.extension,
    autoImportModule: options.autoImportModule,
    changeKeyHandle: options.changeI18nKeyHandle,
    keyMap: options.i18nKeyMap,
    setKeyToFileSeperator: options.i18nSetKeyToFileSeperator,
    autoImportExportModuleTypes: options.autoImportExportModuleTypes || {},
    fileExtensions: options.fileExtensions,
    excludeSyncDirRegExp: options.excludeSyncDirRegExp,
  });

  const watcher = chokidar.watch(options.replaceDir, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  const fileFilterSync = filterSync(options.i18nRoot);

  watcher
    .on('add', path => {
      if (path.match(options.fileExtensions)) {
        fileFilterSync(path)(addFileSync);
        readFile(path);
      }
    })
    .on('change', path => {
      if (path.match(options.fileExtensions)) {
        fileFilterSync(path)(changeFileSync);
        fileReplace(path);
      }
    })
    .on('unlink', path => {
      if (path.match(options.fileExtensions)) {
        fileFilterSync(path)(removeFileSync);
      }
    })
    .on('addDir', path => {
      fileFilterSync(path)(addDirSync);
    })
    .on('unlinkDir', path => {
      fileFilterSync(path)(removeDirSync);
    });
}
