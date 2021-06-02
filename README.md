# vue-i18n-sync
提供国际化配置的各种同步操作
* 支持配置中同步添加/修改/删除key
* 支持vue文件中同步添加key，需使用vscode安装插件auto-create-vue-i18n
* 支持vue文件中同步修改key
* 支持同步添加/修改/删除注释等等操作
* 支持根据配置名称自动移到指定文件
* 支持同名key自动校验并提示错误
* 支持同值自动校验并提示警告️

### Install
Install with npm:

`$ npm install --save-dev vue-i18n-sync`

### Uses：

```angular2html
// 最小化配置
vueI18nSync({
    // 同步配置根目录
    i18nRoot: path.join(process.cwd(), 'src/locales'),
    // 修改目标字符串的根目录 不配置
    replaceDir: path.join(process.cwd(), 'src')
});
```


```angular2html
// 全项配置介绍
vueI18nSync({
    // 同步配置根目录
    i18nRoot: path.join(process.cwd(), 'src/locales'),
    // 修改目标字符串的根目录
    replaceDir: path.join(process.cwd(), 'src')
    // 保持并行同步的目录。默认根据root自动生成
    i18nDirs: ['en-US', 'zh-CN', '...'],
    // 设置key查找文件位置的分割符，默认.
    i18nSetKeyToFileSeperator: '.',
    // 创建配置文件的后缀名 默认.js
    extension: '.js',
    // 自动import模块 默认true
    autoImportModule: true,
});
```
