module.exports = {
  // 基本格式配置
  semi: true,                    // 语句末尾加分号
  trailingComma: 'es5',         // 在ES5中有效的尾随逗号（对象、数组等）
  singleQuote: true,            // 使用单引号而不是双引号
  quoteProps: 'as-needed',      // 仅在需要时给对象属性加引号
  
  // 缩进和空格
  tabWidth: 2,                  // 缩进宽度
  useTabs: false,               // 使用空格而不是Tab
  
  // 行宽和换行
  printWidth: 100,              // 每行最大字符数
  endOfLine: 'lf',              // 行结束符使用 LF
  
  // JSX 特定配置
  jsxSingleQuote: true,         // JSX中使用单引号
  bracketSameLine: false,       // JSX标签的>换行
  
  // 括号间距
  bracketSpacing: true,         // 对象字面量的大括号间加空格 { foo: bar }
  arrowParens: 'avoid',         // 箭头函数参数只有一个时省略括号
  
  // 其他
  insertPragma: false,          // 不在文件顶部插入 @format
  requirePragma: false,         // 不需要 @format 注释才格式化
  proseWrap: 'preserve',        // 保持 markdown 文本换行
  
  // HTML/Vue/Angular 相关
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  
  // 文件覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80,
        tabWidth: 2,
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      }
    }
  ]
}; 