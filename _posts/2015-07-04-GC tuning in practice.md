---
title: 'GC tuning in practice[译]'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720150704
tags:
    - translate
    - java
    - gc
---


本文由 [ImportNew](http://www.importnew.com) - [光光头去打酱油](http://www.importnew.com/author/zhongjianno1) 翻译自 [javacodegeeks](http://www.javacodegeeks.com/2015/06/gc-tuning-in-practice.html)。欢迎加入[翻译小组](http://group.jobbole.com/category/feedback/trans-team/)。转载请见文末要求。

Java 垃圾回收调优不同于任何其它性能优化活动。

首先你要确保自己足够了解整个应用的情况以及调优预期的结果，而不是单单满足于应用的某一部分调优。一般情况下，遵循以下过程比较容易：

1.  明确自己的性能目标。
2.  测试。
3.  测量调优结果。
4.  与目标进行比较。
5.  改变方法并再次测试。

性能调优目标要是可确定且可测量的，这非常重要。这些目标包括延迟、吞吐量和容量，想要了解更多，我推荐看看垃圾回收手册（[Garbage Collection Handbook](https://plumbr.eu/handbook/gc-tuning#tuning-for-latency)）中相应的章节。让我们看看在实践中如何设定并达到这样的调优目标。为了这个目的，让我们来看一个示例代码：

```
//imports skipped for brevity
public class Producer implements Runnable {

  private static ScheduledExecutorService executorService = Executors.newScheduledThreadPool(2);

  private Deque<byte[]> deque;
  private int objectSize;
  private int queueSize;

  public Producer(int objectSize, int ttl) {
    this.deque = new ArrayDeque<byte[]>();
    this.objectSize = objectSize;
    this.queueSize = ttl * 1000;
  }

  @Override
  public void run() {
    for (int i = 0; i < 100; i++) {
      deque.add(new byte[objectSize]);
      if (deque.size() > queueSize) {
        deque.poll();
      }
    }
  }

  public static void main(String[] args) throws InterruptedException {
    executorService.scheduleAtFixedRate(new Producer(200 * 1024 * 1024 / 1000, 5), 0, 100, TimeUnit.MILLISECONDS);
    executorService.scheduleAtFixedRate(new Producer(50 * 1024 * 1024 / 1000, 120), 0, 100, TimeUnit.MILLISECONDS);
    TimeUnit.MINUTES.sleep(10);
    executorService.shutdownNow();
  }
}
```

代码中提交了两个作业（job），且每 100ms 运行一次。每个作业模拟特定对象的生命周期：先创建对象，让它们“存活”一段时间，然后忘记它们，让 GC 回收内存。 运行这个示例时，开启 GC 日志并使用以下参数：

    -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps

我们立即在日志文件中看到 GC 的影响和下面这些相似：


    2015-06-04T13:34:16.119-0200: 1.723: [GC (Allocation Failure) [PSYoungGen: 114016K->73191K(234496K)] 421540K->421269K(745984K), 0.0858176 secs] [Times: user=0.04 sys=0.06, real=0.09 secs] 
    2015-06-04T13:34:16.738-0200: 2.342: [GC (Allocation Failure) [PSYoungGen: 234462K->93677K(254976K)] 582540K->593275K(766464K), 0.2357086 secs] [Times: user=0.11 sys=0.14, real=0.24 secs] 
    2015-06-04T13:34:16.974-0200: 2.578: [Full GC (Ergonomics) [PSYoungGen: 93677K->70109K(254976K)] [ParOldGen: 499597K->511230K(761856K)] 593275K->581339K(1016832K), [Metaspace: 2936K->2936K(1056768K)], 0.0713174 secs] [Times: user=0.21 sys=0.02, real=0.07 secs]


基于日志中的信息，我们可以开始改善性能。并请牢记三个不同的目标：

1.  确保 GC pause（垃圾回收暂停）的最坏情况不要超过预期的临界值。
2.  确保应用程序线程停滞时间不超过预先确定的阀值。
3.  降低基础架构成本，同时确保我们仍可以实现合理的延迟和吞吐量目标。

为此，以三个不同的配置各运行了10分钟，在下表中总结了三个差距较大的结果：

| 堆 | GC算法 | 有效工作 | 长暂停 |
| --- | --- | --- | --- |
| -Xmx12g | -XX:+UseConcMarkSweepGC | 89.8% | 560 ms |
| -Xmx12g | -XX:+UseParallelGC | 91.5% | 1,104 ms |
| -Xmx8g | -XX:+UseConcMarkSweepGC | 66.3% | 1,610 ms |

实验中，设置不同的 GC 算法和不同的堆大小，运行相同的代码，然后测量垃圾回收暂停的持续时间和吞吐量。实验细节和结果的解释都在我们的[垃圾回收手册](https://plumbr.eu/handbook/gc-tuning#tuning-for-latency)中。看看手册中的一些例子，修改一些简单的配置造成延迟、吞吐量等各方面的性能完全不同。

注意：为了保持示例尽可能简单，只有数量有限的输入参数被改变，例如没有对不同数量的核心（CPU core）或不同堆布局进行测试。

原文链接： [javacodegeeks](http://www.javacodegeeks.com/2015/06/gc-tuning-in-practice.html) 翻译： [ImportNew.com](http://www.importnew.com) - [光光头去打酱油](http://www.importnew.com/author/zhongjianno1)
译文链接： [http://www.importnew.com/16223.html](http://www.importnew.com/16223.html)
[ <span style="color:#ff0000">**转载请保留原文出处、译者和译文链接。**</span>]