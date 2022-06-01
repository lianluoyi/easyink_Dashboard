/*
 * @Author: broccoli
 * @LastEditors: broccoli
 */
const path = require('path');
module.exports = {
  // set your styleguidist configuration here
  title: '公共组件',
  // 公共组件路径
  components: 'src/components/**/*.vue',
  // components: ['src/components/*.vue', 'src/components/**/[A-Z]*.vue'],
  // defaultExample: true,
  // sections: [
  //   {
  //     name: 'First Section',
  //     components: 'src/components/**/[A-Z]*.vue'
  //   }
  // ],
  // webpackConfig: {
  //   // custom config goes here
  // },
  // 定义示例代码选项卡的初始状态
  exampleMode: 'expand',
  // 样式指南所需的模块
  require: [path.join(__dirname, 'styleguide/global.requires.js')],
  // 引入图标集样式
  template: {
    head: {
      links: [
        {
          rel: 'stylesheet',
          href:
            'https://at.alicdn.com/t/font_2736732_k2tffq46g2e.css'
        }
      ]
    }
  },
  // 修改示例预览的根组件，接收预览组件作为参数
  renderRootJsx: path.join(__dirname, 'styleguide/styleguide.root.js')
};
