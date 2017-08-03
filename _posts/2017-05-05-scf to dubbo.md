---
title: '阿里 RPC 框架 dubbo 中的那些坑'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170504
tags:
    - java
    - dubbo
---

公司现在的项目用了 58 内部的一个 RPC 框架，一直有个接收数据超时的问题，由于不是开源的（号称开源，结果只是换了个名字，然后开源了第一个版本的代码而已，后面也没有人维护和更新），所以很难排查问题。反正从我进公司开始就一直被这个问题折腾，因为这个问题还会导致很多的连锁 Bug，简直不要太坑。

之后决定使用阿里 dubbo 框架替换掉现在使用的，dubbo 总体来说还是不错，然而其中也碰到一些问题，希望能给大家一些帮助。
### 0x00 服务配置
```xml
<!-- 声明需要暴露的服务接口 -->
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoService" />

    <!-- 和本地bean一样实现服务 -->
    <bean id="demoService" class="com.alibaba.dubbo.demo.provider.DemoServiceImpl" />
```
当时只配置了 dubbo:service ，漏掉了 bean 。启动服务的时候就一直在 starting！关键是没有错误提示！如果有人碰到类似的情况好好去检查下配置吧。

### 0x01 主机名
有些服务依赖主机名之类的，具体错误忘记了。
总之就是要 hosts 文件里加上一条记录。  
127.0.0.1  xxxx（主机名）

### 0x02 dubbo-admin
dubbo admin 服务显示有个 bug。
具体修复请参考 [这篇文章](http://blog.csdn.net/u012063409/article/details/59110559)

### 0x03 服务管理脚本
提供者服务启动脚本有点问题，我用了默认的 spring 容器来启动服务的，才会有这些脚本。  
在打包后的 bin 目录下的 start.sh 和 stop.sh 脚本中有一句:

    ps -f | grep java | grep "$CONF_DIR" |awk '{print $2}'

但是经常会已经启动服务了但是这句脚本找不到进程，推荐修改下脚本

    ps -ef | grep java | grep "$CONF_DIR" |awk '{print $2}'

还有个问题是在 stop.sh 里，

```
if [ "$1" != "skip" ]; then
    $BIN_DIR/dump.sh
fi
```
stop 的时候会转储一些堆内存之类的，具体的细节你可以看看 bin/dump.sh 里是怎么写的。  
当服务正在处理大量请求时，占用内存很多的情况下，有可能 dump 会卡住，实际上服务已经停掉了，但是并没有通知注册中心，导致服务异常。所以推荐删掉这个 dump 的逻辑，如果确实需要 dump 文件来做故障分析的话，推荐单独运行 dump.sh。

### 0x04 spring 依赖
dubbo 依赖的 spring 版本为 2.5.6.SEC03 ，版本太低了。如果你的项目里没有 spring 的依赖的话倒是无所谓了。如果有其他版本的依赖那很有可能会有冲突，建议排除掉低版本。    

```
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>dubbo</artifactId>
            <version>2.5.3</version>
            <exclusions>
                <exclusion>
                    <artifactId>spring</artifactId>
                    <groupId>org.springframework</groupId>
                </exclusion>
            </exclusions>
        </dependency>
```

### 0x05 线程池
关于处理线程，默认是 fixed 固定线程池 ，线程数量默认为 200。但是一般来说是不够用的，推荐使用 cached 缓存线程池，空闲一分钟自动删除，需要时重建。

使用 cached 线程池也是有问题的，当大并发的情况下，会瞬间创建很多个线程，甚至有可能超过 Linux 系统限制，导致服务器异常，是的，我碰到过一次。

可能还是要根据具体的业务来选择哪个线程池，比如说消费端请求量变化不会太大，那么 cached 完全没问题，但是有可能出现剧烈波动的情况还是推荐 fixed，防止突然撑爆服务器。

### 0x06 序列化方式
推荐使用默认序列化方式（dubbo），之前考虑服务给 php 调用，所以选择了通用的 json 序列化方式，但是后来发现 Java 里复杂类型的情况下（嵌套泛型），最里层的泛型是无法转换成对象的，通通变成 JsonObject 了。如果非要用 json 做序列化的话，就尽量保证参数和结果简单。

### 0x07 关于调试
想单独测试接口的话可以用 `telnet` 命令。

```
// IP 和端口号
telnet 127.0.0.1 26880  

命令：

//显示服务列表
ls

//显示服务详细信息列表
ls -l

//显示服务的方法列表
ls XxxService

//显示服务的方法详细信息列表
ls -l XxxService

//调用方法
invoke XxxMethod()

```
还有其他一些命令，不过调试主要用到 `invoke` 命令。  
使用的时候建议使用全路径。
比如：`cn.deadlion.dubbo.getName()`
会返回结果和耗费的时间。  
如果方法有简单类型的参数的话，就直接写参数好了。
`cn.deadlion.dubbo.getNameById(110)`  
`cn.deadlion.dubbo.getNameByAgeAndNick(110,"deadlion")`
如果参数是个对象怎么办？使用 json 串。  
