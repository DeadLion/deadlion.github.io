---
title: 'Java 8的6个问题[译]'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef7aeee2d80
tags:
    - 翻译
	- Java
---


1. 并行Streams实际上可能会降低你的性能
------------------------

Java8带来了最让人期待的新特性之–并行。parallelStream() 方法在集合和流上实现了并行。它将它们分解成子问题，然后分配给不同的线程进行处理，这些任务可以分给不同的CPU核心处理，完成后再合并到一起。实现原理主要是使用了fork/join框架。好吧，听起来很酷对吧！那一定可以在多核环境下使得操作大数据集合速度加快咯，对吗？

不，如果使用不正确的话实际上会使得你的代码运行的更慢。我们进行了一些基准测试，发现要慢15%，甚至可能更糟糕。假设我们已经运行了多个线程，然后使用.parallelStream() 来增加更多的线程到线程池中，这很容易就超过多核心CPU处理的上限，从而增加了上下文切换次数，使得整体都变慢了。

基准测试将一个集合分成不同的组（主要/非主要的）：


    Map<Boolean, List<Integer>> groupByPrimary = numbers
    .parallelStream().collect(Collectors.groupingBy(s -> Utility.isPrime(s)));

使得性能降低也有可能是其他的原因。假如我们分成多个任务来处理，其中一个任务可能因为某些原因使得处理时间比其他的任务长很多。.parallelStream() 将任务分解处理，可能要比作为一个完整的任务处理要慢。来看看这篇文章， Lukas Krecan给出的一些例子和代码 。

提醒：并行带来了很多好处，但是同样也会有一些其他的问题需要考虑到。当你已经在多线程环境中运行了，记住这点，自己要熟悉背后的运行机制。

 

2. Lambda 表达式的缺点
----------------

lambda表达式。哦，lambda表达式。没有lambda表达式我们也能做到几乎一切事情，但是lambda是那么的优雅，摆脱了烦人的代码，所以很容易就爱上lambda。比如说早上起来我想遍历世界杯的球员名单并且知道具体的人数（有趣的事实：加起来有254个）。

    List lengths = new ArrayList();
    for (String countries : Arrays.asList(args)) {
        lengths.add(check(country));
    }

现在我们用一个漂亮的lambda表达式来实现同样的功能：


    Stream lengths = countries.stream().map(countries -< check(country));

哇塞!这真是超级厉害。增加一些像lambda表达式这样的新元素到Java当中，尽管看起来更像是一件好事，但是实际上却是偏离了Java原本的规范。字节码是完全面向对象的，伴随着lambda的加入 ，这使得实际的代码与运行时的字节码结构上差异变大。阅读更多关于lambda表达式的负面影响可以看Tal Weiss这篇文章。

 从更深层次来看，你写什么代码和调试什么代码是两码事。堆栈跟踪越来越大，使得难以调试代码。一些很简单的事情譬如添加一个空字符串到list中，本来是这样一个很短的堆栈跟踪


    at LmbdaMain.check(LmbdaMain.java:19)
    at LmbdaMain.main(LmbdaMain.java:34)

变成这样：


    at LmbdaMain.check(LmbdaMain.java:19)
    at LmbdaMain.lambda$0(LmbdaMain.java:37)
    at LmbdaMain$$Lambda$1/821270929.apply(Unknown Source)
    at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193)
    at java.util.Spliterators$ArraySpliterator.forEachRemaining(Spliterators.java:948)
    at java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:512)
    at java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:502)
    at java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:708)
    at java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234)
    at java.util.stream.LongPipeline.reduce(LongPipeline.java:438)
    at java.util.stream.LongPipeline.sum(LongPipeline.java:396)
    at java.util.stream.ReferencePipeline.count(ReferencePipeline.java:526)
    at LmbdaMain.main(LmbdaMain.java:39

lambda表达式带来的另一个问题是关于重载：使用他们调用一个方法时会有一些传参，这些参数可能是多种类型的，这样会使得在某些情况下导致一些引起歧义的调用。Lukas Eder 用示例代码进行了说明。

提醒：要意识到这一点，跟踪有时候可能会很痛苦，但是这不足以让我们远离宝贵的lambda表达式。

3. Default方法令人分心
----------------

Default方法允许一个功能接口中有一个默认实现，这无疑是Java8新特性中最酷的一个，但是它与我们之前使用的方式有些冲突。那么既然如此，为什么要引入default方法呢？如果不引入呢？

Defalut方法背后的主要动机是，如果我们要给现有的接口增加一个方法，我们可以不用重写实现来达到这个目的，并且使它与旧版本兼容。例如，拿这段来自Oracle Java教程中 添加指定一个时区功能的代码来说：


    public interface TimeClient {
    // ...
    static public ZoneId getZoneId (String zoneString) {
    try {
        return ZoneId.of(zoneString);
    } catch (DateTimeException e) {
        System.err.println("Invalid time zone: " + zoneString +
        "; using default time zone instead.");
        return ZoneId.systemDefault();
        }
    }
    default public ZonedDateTime getZonedDateTime(String zoneString) {
        return ZonedDateTime.of(getLocalDateTime(), getZoneId(zoneString));
        }
    }

就是这样，问题迎刃而解了。是这样么？Default方法将接口和实现分离混合了。似乎我们不用再纠结他们本身的分层结构了，现在我们需要解决新的问题了。想要了解更多，阅读Oleg Shelajev在RebelLabs上发表的文章吧。

提醒：当你手上有一把锤子的时候，看什么都像是钉子。记住它们原本的用法，保持原来的接口而重构引入新的抽象类是没有意义的。

4. 该如何拯救你，Jagsaw?
-----------------

Jigsaw项目的目标是使Java模块化，将JRE分拆成可以相互操作的组件。这背后最主要的动机是渴望有一个更好、更快、更强大的Java嵌入式。我试图避免提及“物联网”,但我还是说了。减少JAR的体积，改进性能，增强安全性等等是这个雄心勃勃的项目所承诺的。
但是，它在哪呢？Oracle的首席Java架构师， Mark Reinhold说：  Jigsaw，通过了探索阶段 ，最近才进入第二阶段，现在开始进行产品的设计与实现。该项目原本计划在Java8完成。现在推迟到Java9,有可能成为其最主要的新特性。

提醒：如果这正是你在等待的， Java9应该在2016年间发布。同时，想要密切关注甚至参与其中的话，你可以加入到这个邮件列表。

5. 那些仍然存在的问题

受检异常
没有人喜欢繁琐的代码，那也是为什么lambdas表达式那么受欢迎的的原因。想想讨厌的异常，无论你是否需要在逻辑上catch或者要处理受检异常，你都需要catch它们。即使有些永远也不会发生，像下面这个异常就是永远也不会发生的：


    try {
        httpConn.setRequestMethod("GET");
    } catch (ProtocolException pe) { /* Why don’t you call me anymore? */ }

原始类型

它们依然还在，想要正确使用它们是一件很痛苦的事情。原始类型导致Java没能够成为一种纯面向对象语言，而移除它们对性能也没有显著的影响。顺便提一句，新的JVM语言都没有包含原始类型。

运算符重载

James Gosling，Java之父，曾经在接受采访时说：“我抛弃运算符重载是因为我个人主观的原因，因为在C++中我见过太多的人在滥用它。”有道理，但是很多人持不同的观点。其他的JVM语言也提供这一功能，但是另一方面，它导致有些代码像下面这样：

    javascriptEntryPoints <<= (sourceDirectory in Compile)(base =>
        ((base / "assets" ** "*.js") --- (base / "assets" ** "_*")).get
    )

事实上这行代码来自Scala  Play框架，我现在都有点晕了。

提醒：这些是真正的问题么？我们都有自己的怪癖，而这些就是Java的怪癖。在未来的版本中可能有会发生一些意外，它将会改变，但向后兼容性等等使得它们现在还在使用。

6. 函数式编程–为时尚早
-------------

函数式编程出现在java之前，但是它相当的尴尬。Java8在这方面有所改善例如lambdas等等。这是让人受欢迎的，但却不如早期所描绘的那样变化巨大。肯定比Java7更优雅，但是仍需要努力增加一些真正需要的功能。

其中一个在这个问题上最激烈的评论来自Pierre-yves Saumont，他写了一系列的文章详细的讲述了函数式编程规范和其在Java中实现的差异。

所以，选择Java还是Scala呢？Java采用现代函数范式是对使用多年Lambda的Scala的一种肯定。Lambdas让我们觉得很迷惑，但是也有许多像traits，lazy evaluation和immutables等一些特性，使得它们相当的不同。

提醒：不要为lambdas分心，在Java8中使用函数式编程仍然是比较麻烦的。

[转载自ImportNew][1]



  [1]: http://www.importnew.com/13972.html
  