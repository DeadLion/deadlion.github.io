---
title: '《深入理解 Java 虚拟机》运行时数据区域'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170206
tags:
    - java
    - jvm
---

*本系列文章均摘自《深入理解 Java 虚拟机》第二版，略有删减、概括，主要是为了精简篇幅，方便阅读和以后查阅。推荐购买正版书籍，阅读完整内容。*

## 2.2 运行时数据数据区域
JVM 在执行程序的时候会把它管理的内存划分为若干个不同数据区。根据 JVM 规范（Java SE 7）的规定，JVM 所管理的内存将会包括以下几个运行时数据区域，下图所示。
![](/media/images/2017020601.png)

### 2.2.1 程序计数器
程序计数器是一块较小的内存空间，可以看作是当前线程所执行的字节码的行号指示器。

每条线程都有一个独立的程序计数器，各线程之间计数器互不影响，独立存储，属于“线程私有”的内存。

如果线程在执行一个 Java 方法，计数器记录的是正在执行的虚拟机字节码指令的地址。如果执行的是 Native 方法，计数器值为空。此内存区域是唯一在 JVM 规范中没有规定任何 OutOfMemoryError 情况的区域。

### 2.2.2 Java 虚拟机栈
线程私有，生命周期与线程相同。虚拟机栈描述的是 Java 方法执行的内存模型：每个方法执行时都会创建一个**栈帧（Stack Frame）** 用于存储局部变量表、操作数栈、动态链接、方法出口等信息。每个方法从调用至完成的过程，就对应着一个栈帧在虚拟机栈中入栈到出栈的过程。

局部变量表存放了编译器可知的各种基本类型数据（8 个基本类型）、对象引用（reference 类型，不等同于对象本身，可能是引用指针，可能是句柄或其他与此对象相关的位置）和 returnAddress 类型（指向字节码指令的地址）。

局部变量表所需内存空间在编译期间完成分配，在方法运行期间不会改变局部变量表的大小。局部变量空间最小单位为 Slot，long 和 double 占 2 个 Slot，其他类型占 1 个。

此区域规定了两种异常：线程请求的栈深度大于 JVM 所允许的深度，将抛出 StackOverflowError 异常；如果虚拟机栈动态扩展无法申请到足够的内存，则抛出 OutOfMemoryError 异常。

### 2.2.3 本地方法栈
与虚拟机栈非常相似，只不过服务的对象不同，本地方法栈服务的是本地（Native）方法。JVM 规范对于本地方法使用的语言、使用方式和数据接口并没有强制规定，Sun HotSpot 虚拟机就直接把本地方法栈和虚拟机栈合二为一。同样也会出现 StackOverflowError 和 OutOfMemoryError 异常。

### 2.2.4 Java 堆
JVM 所管理的内存中最大的一块。被所有线程所共享，在 JVM 启动时创建。JVM 规范中规定：所有对象实例以及数组都要在堆上分配。但是随着 JIT 编译器的发展与逃逸分析技术逐渐成熟，栈上分配、标量替换优化技术将会导致一些微妙的变化发生，所有对象在堆上分配不是那么“绝对”了。

Java 堆是垃圾收集器管理的主要区域。由于现在收集器基本都采用分代收集算法，所以 Java 堆还能细分为：新生代和老年代；再细致点还能分为 Eden、From Survivor、To Survivor 等。Java 堆可以处于物理上不连续的内存空间中，只要逻辑上是连续的即可。目前主流 JVM 都是可以动态扩展 Java 堆的（通过 -Xmx 和 -Xms 控制）。堆中无足够内存并且堆也无法再扩展时，将会抛出 OutOfMemoryError 异常。

### 2.2.5 方法区
线程共享，用来存储已被 JVM 加载的类信息、常量、静态变量、即时编译器编译后的代码等数据。对于 HotSpot JVM 来说，很多人将方法区称为“永久代（Permanent Generation）” ，本质上两者并不等价，只是 HotSpot 将 GC 分代收集扩展至方法区，像 Java 堆一样来管理这部分内存。但是这样更容易出现内存溢出问题，对于 HotSpot JVM，根据官方发布的信息，现在也有放弃永久代改为采用 Native Memory 来实现方法区的规划了，在 JDK 1.7 的 HotSpot 中，已经降原来永久代中的字符串常量池移出。

JVM 规范对于方法区的限制非常宽松，除了不需要连续的内存、可以固定大小或者可扩展，甚至可以不实现垃圾收集。一般来说，方法区回收目标主要是针对常量池的回收和对类型的卸载。当方法区无法满足内存分配的需求时，会出现 OutOfMemoryError 异常。

### 2.2.6 运行时常量池
运行时常量池是方法区的一部分。Class 文件中除了有类的版本、字段、方法、接口等描述信息外，还有一项信息就是常量池（Constant Pool Table），用于存放编译期间生成的各种字面量和符号引用，类加载后进入方法区的运行时常量池中存放。

运行时常量池相对于 Class 文件常量池的另外一个特征是具备动态性，除了预置入 Class 文件中常量池的内容能进入方法区运行时常量池，运行期间也能将新的常量放入，String 类的 intern() 方法就是个例子。既然是方法区的一部分，自然受到方法区内存限制，不足时会抛出 OutOfMemoryError  异常。

### 2.2.7 直接内存
直接内存不是 JVM 运行时数据区的一部分，也不是规范中定义的内存区域。JDK 1.4 中新加入了 NIO（New Input/OutPut）类，引入了一种基于通道与缓冲区的 IO 方式，它可以使用 Native 函数库直接分配堆外内存，然后通过 Java 堆中的 DirectByteBuffer 对象作为这块内存的引用进行操作。避免在 Java 堆和 Native 堆中来回复制数据，提高性能。虽然直接内存不受 Java 堆大小的限制，但是受本机总内存大小限制。在配置 JVM 参数时，会根据实际内存设置 -Xmx 等参数信息，但经常忽略直接内存，使得各个内存区总和大于物理内存，从而导致动态扩展时出现 OutOfMemoryError 异常。