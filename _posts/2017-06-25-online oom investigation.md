---
title: 一次线上 OutOfMemoryError 排查
layout: post
guid: 'urn:uuid:b87da13a-a4dd-402f-b06a-cef720170625'
tags:
  - java
  - jvm

---

最近线上服务器经常出现 java.lang.OutOfMemoryError: Java heap space 错误。

这篇文章就记录下排查错误的过程。

### 0x00 拿到 HeapDump 文件

#### JVM 参数 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/data/dumps

-XX:+HeapDumpOnOutOfMemoryError 该参数的作用就是当发生 OutOfMemoryError 的时候，会自动将当前堆内存转储到文件中。

-XX:HeapDumpPath=/data/dumps 这个参数也很好理解啦，就是指定转储文件的路径。文件名一般是 pid_xxxxx（pid_进程id）。

有了第一手错误现场的转储文件其实就能很快的分析出具体是哪些对象把堆内存耗完了。

### jmap 命令

-dump:[live,]format=b,file=<filename> 我们主要使用这个命令

例如： jmap -dump:format=b,file=dumpfilename 3331

最后的数字是进程 id 。

在 Linux 服务器上可以用 top -c 命令来找找是哪个进程。

有可能 dump 文件很大，我的就有近 2G 的大小。可以用 tar 命令压缩下文件，大概可以压缩到几百兆的样子，然后拉到本地做分析。
[jmap 命令说明](http://docs.oracle.com/javase/7/docs/technotes/tools/share/jmap.html)

### 分析 HeapDump
自带命令 jhat 可以分析，但是 HeapDump 文件很大的话， jhat 命令会卡住。所以不太推荐使用，这里我推荐两款比较优秀的第三方分析软件。

#### [VisualVM](https://visualvm.github.io/download.html)
多平台：Microsoft Windows / Linux / Mac OS X / Oracle Solaris
多语言: English / 日本語 / 简体中文

公司用的是 windows 系统。  

File > load 文件类型选择 Heap Dumps > 选择你的文件

正确加载后应该如下图
![](/media/images/20170726181954.png)
看红框处会提示具体是执行到哪个线程抛出的 oom 异常。而且可以点进去查看更详细的信息。

接下来找出罪魁祸首
![](/media/images/20170726182225.png)
点击 Classes ，然后按照 size 排序。
会发现某一个类占用比特别高。右键这个类 Show in Instances View ，会跳转到  Instances 视图。

然后找 GC Root，根据 GC 规则，如果能找到 GC Root ，那么这个类是不会被回收的。
![](/media/images/20170726183616.png)
