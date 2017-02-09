---
title: 'install Fiddler for MacOS'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170201
tags:
    - macos
    - software
---

在 Windows 上比较好用的 http 调试代理工具是 Fiddler ，不过不知道 MacOS 上体验如何。  

最近换了 MBP，想装调试工具，下面就来安装体验下。

[官方安装教程](https://www.telerik.com/download/fiddler/fiddler-osx-beta)

### 1.安装 Mono framework
从 [http://www.mono-project.com/download/#download-mac](http://www.mono-project.com/download/#download-mac) 页面上下载安装 Mono，如果已经安装了最好更新到最新版本。（Mono是.NET Framework的一个开源的、跨平台的实现。）

### 2.更新根证书

在终端中输入 （记得修改对应的版本号，目前最新的是 4.6.2）

    /Library/Frameworks/Mono.framework/Versions/<Mono Version>/bin/mozroots --import --sync

我试的时候这条命令已经不行了，直接到 bin 目录下，然后使用命令

    ./mozroots --import --sync

可以使用，但是会有警告：    
WARNING: mozroots is deprecated, please move to cert-sync instead.（mozroots 已经过时了，请使用 cert-sync）

### 3.下载并解压 fiddler-mac.zip
[下载地址](https://www.telerik.com/docs/default-source/fiddler/fiddler-mac.zip?sfvrsn=2)

### 4.运行 fiddler.exe
下载解压完以后，从终端中 cd 到解压目录，然后输入命令 `mono Fiddler.exe ` 执行程序。  
第一次运行的时候需要等待一段时间才能启动。

![](/media/images/QQ20170201-030817@2x.png)

### 总结
还没有深度体验，但是已经感觉体验不佳！  
  * mac 版 fiddler 还处于 beta 版本，稳定性不行。  
  * 不支持 Retina 屏，字有点模糊。  
  * 安装麻烦，依赖 Mono，要下载 300+m 的安装包。
  * 启动麻烦，启动过程中因为 osascript 的原因需要输两次密码才能启动，关闭的时候也需要输入一次密码。
