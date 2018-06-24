# Sunbeam-front
Online Spreadsheet for Web

[![Build Status](https://travis-ci.org/iCloudWorkGroup/Sunbeam-front.svg?branch=master)](https://travis-ci.org/iCloudWorkGroup/Sunbeam-front)

## 使用方式：

``` javascript
var sbm = new Sunbeam('#app'.);
// 一段区域
// 从中间开始，到MAX
// D列
// 一个单元格
sbm.setCell('zhangsan',[['b5','c7'],['c8','max7'],'d','b5'])
```