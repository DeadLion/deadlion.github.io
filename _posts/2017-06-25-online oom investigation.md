---
title: '一次线上 OutOfMemoryError 排查'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170625
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
