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

[jmap 命令说明](http://docs.oracle.com/javase/7/docs/technotes/tools/share/jmap.html)
