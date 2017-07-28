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

### 拿到 HeapDump 文件

#### JVM 参数 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/data/dumps

-XX:+HeapDumpOnOutOfMemoryError 该参数的作用就是当发生 OutOfMemoryError 的时候，会自动将当前堆内存转储到文件中。

-XX:HeapDumpPath=/data/dumps 这个参数也很好理解啦，就是指定转储文件的路径。文件名一般是 pid_xxxxx（pid_进程id）。

有了第一手错误现场的转储文件其实就能很快的分析出具体是哪些对象把堆内存耗完了。

### jmap 命令
我们还可以主动通过 jmap 命令来获取 HeapDump 文件。  
-dump:[live,]format=b,file=<filename> 我们主要使用这个命令

例如： jmap -dump:format=b,file=dumpfilename 3331

最后的数字是进程 id 。

在 Linux 服务器上可以用 top -c 命令来找找是哪个进程。

有可能 dump 文件很大，我的就有近 2G 的大小。可以用 tar 命令压缩下文件，大概可以压缩到几百兆的样子，然后拉到本地做分析。
[jmap 命令说明](http://docs.oracle.com/javase/7/docs/technotes/tools/share/jmap.html)

### jstat 命令
这个命令也很有用，主要是用来查看 gc 状态的。  
`jstat -gcutil 21891 2000 3`  
21891 是进程ID  
2000 是间隔时间，单位毫秒  
3 为次数  

输出结果如下：  

S0|     S1|     E |      O |     P |     YGC |   YGCT|    FGC  |  FGCT |    GCT|
---|
12.44|   0.00 | 27.20|   9.49|  96.70|    78|    0.176|     5   | 0.495 |   0.672
12.44 |  0.00 | 62.16 |  9.49  |96.70   | 78   | 0.176  |   5  |  0.495 |   0.672
12.44 |  0.00 | 83.97|   9.49  |96.70  |  78   | 0.176 |    5   | 0.495    |0.672

具体含义如下：  
S0	S0 区已使用空间 / S0 总容量   
S1	同上  
E	  同上  
O	同上  
P	同上   
YGC	年轻代 GC 次数  
YGCT	年轻代 GC 时间  
FGC	Full GC 次数  
FGCT	Full GC 时间    
GCT	 GC 总时间     

像我这次遇到的情况，会发现 FGC 数字一直在增长， CPU 使用率也异常升高很多，其实就是堆空间不足，导致不停的在 GC ，消耗 CPU 资源。

[jstat 命令说](http://docs.oracle.com/javase/1.5.0/docs/tooldocs/share/jstat.html)
### 分析 HeapDump
自带命令 jhat 可以分析，但是 HeapDump 文件很大的话， jhat 命令会卡住。所以不太推荐使用，这里我推荐款比较优秀的第三方分析软件。

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

然后找 GC Root，根据 GC 规则，如果能找到 GC Root ，那么这个类是不会被回收的。最终找到原因是因为 Netty 使用不当导致的。
![](/media/images/20170726183616.png)
