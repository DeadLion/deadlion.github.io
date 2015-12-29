---
title: '5步避免Hadoop堆空间错误[译]'
layout: post
guid: urn:uuid:b87da13a-a4dd-412f-b06a-cef7aeee2d80
tags:
    - translate
    - hadoop
---

牢记以下五个步骤可以为你减少很多头痛的问题并且避免Java堆空间错误。

1.	通过计算预期的内存消耗。
2.	检查JVM是否有足够的可用空间。
3.	检查JVM的设置是否正确。
4.	限制节点使用交换空间和内存分页。
5.	设置实例slot数量小于JobTracker web GUI计算的数值。
译者注：slot  ：slot不是CPU的Core，也不是memory chip，它是一个逻辑概念，一个节点的slot的数量用来表示某个节点的资源的容量或者说是能力的大小，因而slot是 Hadoop的资源单位。详见这里。

在这篇博文里，我将详细讲解每个步骤，帮助大家更好地理解并正确管理实例（task attempt）内存。

译者注：实例（task attempt） ：这个词在官方文档中找到了解释： “Each task attempt is one particular instance of a Map or Reduce Task identified by its TaskID”。

理解怎样管理实例内存是很重要的，这样可以避免Java堆空间错误。当运行 map/reduce 作业（Job）时，你可能会看到实例出现这样的错误：

    13/09/20 08:50:56 INFO mapred.JobClient: Task Id : attempt_201309200652_0003_m_000000_0, Status : FAILED on node node1
    Error: Java heap space


当试图申请一个超过Java虚拟机（JVM）设置的最大内存限制时就会发生这个错误。

避免Java堆空间错误的第一步是了解你的map和reduce任务的内存需求，以便于你启动一个JVM时设置了适当内存限制。

例如，hadoop-0.20.2-dev-examples.jar中的wordcount 功能。 不管处理什么数据，map 任务都不需要很多内存。唯一需要很多内存的就是在加载运行所需的函数库的时候。当使用默认附带MapR包的wordcount功能时，512MB的内存对于实例JVM是绰绰有余了。如果你打算运行我们提供的Hadoop示例，可以尝试将map实例JVM的内存限制设为512MB。

如果你知道自己的map实例需要多少内存（在本例中是512MB）， 那么下一步启动设置好JVM内存。该实例在JVM中的内存是由TaskTracker为Map/Reduce作业处理数据而设定的。 TaskTracker设定的限制可能有两个来源：要么是用户提交作业时指定了内存大小作为该作业配置对象的一部分，或者是TaskTracker产生了 默认内存大小的JVM。

mapred.map.child.java.opts属性被用来为TaskTracker 启动JVM和执行map任务的参数（在reduce任务中也有个类似的属性）。如果mapred.map.child.java.opts属性被设置成“-Xmx512m”，那么map实例JVMs会有512MB的内存限制。相反的，如果-Xmx没有通过配置属性去指定一个数值的话，那么 每个TaskTracker将会为启动JVM计算一个默认的内存限制。该限制是基于TaskTracker为map/reduce task slot分配的数量所决定的，并且TaskTracker分配给Map/Reduce总内存不能超过系统限制。

TaskTracker为map/reduce实例分配的slot数量在TaskTracker启动时就设定好了。通过每个节点上mapred-site.xml文件中两个参数进行控制的：

    mapred.tasktracker.map.tasks.maximum
    mapred.tasktracker.reduce.tasks.maximum


设置这些默认值的规则是基于节点上CPU核心的数量。不过你可以下面两个方法来重载参数：

修改mapred-site.xml文件设定一个固定的slots数值。
使用自定义规则。
在系统中，TaskTracker  map/reduce实例内存限制是在TaskTracker进程启动时设定的。有两个地方可以设置内存限制。首先在Hadoop conf目录下的hadoop-env.sh脚本中可以显式的设置，你可以添加下面这行来指定内存限制：


    export HADOOP_HEAPSIZE=2000

这行命令限制了节点上的所有实例JVM总共可以使用2000MB的内存。如果没有在hadoop-env.sh文件中指定 HADOOP_HEAPSIZE这个参数，那么当MapR warden service启动TaskTracker时会对内存进行限制。 warden service会基于节点上物理内存的数量减去服务运行中已经占用的内存数量得出限制的大小。如果你去看看warden.conf你会看到像这样的一些属性：


    service.command.mfs.heapsize.percent=20
    service.command.mfs.heapsize.min=512

这个例子表示，warden占用分配给MFS服务节点的20%物理内存或最低512MB（512MB<20%的物理内存的情况下）。如果你考虑所有服务都配置在一个节点上运行的话，你要考虑下在 warden.conf中指定下内存分配。你应该能明确多少内存用于服务配置（还要为系统正常运行预留内存）。剩下的内存就是TaskTracker为并发运行实例设置的内存限制了。

例如，假设你在一个节点上安装运行ZooKeeper、CLDB、MFS、JobTracker、TaskTracker、NFS、the GUI、HBase Master 和HBase RegionServer。这么多的服务运行在一个节点上，而且每个服务都需要内存，所以warden会将内存按照百分比分配给每个服务，剩下的将会分配 给节点上的map/reduce 实例。如果你分配给这些服务总共60%还有5%为系统预留，那么就还有35%分给节点上的map/reduce实例。如果这个节点有10G的内存，将会有3.5G分给 map/reduce 任务。如果你有 6个map slot和4个reduce slot。如果内存是平均分配的，最终每个JVM的内存限制为350MB。如果你需要512MB内存来运行你的map任务，那么默认设置的情况下是不会运行的，你会遇到Java堆空间错误。

当管理实例内存的时候会意识到还有其它问题。不要强制节点去使用大量的交换空间（swap space）或者触发频繁内存分页读写磁盘。如果你通过显式的在mapred.map.child.java.opts设置“-Xmx500m”来改变提交的作业，将会重写安全的内存限制。但实际上你并没有额外的物理内存。虽然 map/reduce 实例仍能启动，但是会强制使用大量的交换空间，而且无法依赖内核的OOM killer或者其他的方法来防止这种情况发生。如果真的发生这种情况，无法指望节点启动大量分页来迅速恢复。如果只是增加了实例的JVM内存，同时继续在节点上启动相同数量的实例。你会申请更多的内存，需要注意不要超额申请。如果超额申请太多的话，会导致大量的分页，这样节点可能会被挂 起再也无法恢复。除非重启电源。

所以如果你给每个实例JVM增加内存的话，需要通过TaskTrackers来减少分配给map/reduce task slot数量。

这是一个很复杂的情况，因为如果你在集群上并发执行不同的作业，可能来自一个作业（JobA）的实例需要大量的内存，来自另外一个作业（JobB）的实例只需要很少的内存。因此，如果你减少map/reduce slot的数量，会发现会有足够的内存来运行来自JobB任务（task）。但是却没有足够的内存提供给JobA。所以关键就是找到一个平衡点，一个可以允许进行一些超额申请却不会导致节点被挂起的平衡点。

为了协助这个任务，TaskTracker 将会着眼于当前所有在运行的 map/reduce tasks 所使用的内存数量。不是只看这些任务的最大内存限制，而是所有运行中的实例实际利用的内存总数。当消耗的内存达到一定级别，TaskTracker 会杀死一些运行的实例来释放内存，以便其他的实例能正常执行完并且不会造成节点上的分页过多。

举个例子，如果你想在一个小型的集群或者单一节点上运行wordcount示例，碰到“Java堆空间”错误，最简单最快的解决方法就是通过编辑/opt/mapr/hadoop/hadoop-0.20.2/conf/mapred-site.xml中的设置来减少 map/reduce 实例 slot的数量：



    mapred.tasktracker.map.tasks.maximum 
    mapred.tasktracker.reduce.tasks.maximum

将实例的slot的数量设置为小于当前计算结果是非常重要的。当前计算的数量可以通过进入JobTracker web界面来确定。例如，如果你有一个TaskTracker ，显示它有6个mpa slot和4个 reduce slot，那么你应该设置 3个map slot、2个 reduce slot。然后通过下面这行命令重启节点上的TaskTracker进程：


    maprcli node services -nodes -tasktracker restart

减少slot的数量重新启动后，重新提交wordcount作业。如果没有额外内存申请，每个实例、JVM都会分配到更多的内存。这是一个安全的解决方法，节点不会产生大量分页。这是一种简单的解决方案，不需要大量计算内存。这也是快速的方法，只需要编辑下配置文件并重启下服务就好了。

为了避免Java堆空间错误，记住下面这些步骤：

估算你的实例需要消耗多少内存。
确保TaskTracker 启动你的实例时，JVM内存的限制要大于等于你预计的内存需求。
记住，启动这些JVM是有默认设置的，除非你显式的重写过这些设置。在CPU核心数和物理内存已经平衡并运行服务的节点上，默认设置并不适用。
不要迫使节点大量的使用交换空间或者频繁的将内存分页读写到磁盘上。
将实例slot数量设置为小于JobTracker web GUI计算值。

[转载自ImportNew][1]



  [1]: http://www.importnew.com/14049.html
  
