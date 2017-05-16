---
title: '项目替换 SOA 框架'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170504
tags:
    - java
    - dubbo
---

公司现在的项目用了 58 内部的一个 SOA 框架，一直有个接收数据超时的问题，由于不是开源的（号称开源，结果只是换了个名字然后开源了第一个版本的代码而已，后面也没有人维护和更新），所以很难排查问题。反正从我进公司开始就一直被这个问题折腾，因为这个问题还会导致很多的连锁 Bug，简直不要太坑。

### 0x00
```xml
<!-- 声明需要暴露的服务接口 -->
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoService" />

    <!-- 和本地bean一样实现服务 -->
    <bean id="demoService" class="com.alibaba.dubbo.demo.provider.DemoServiceImpl" />
```
当时只配置了 dubbo:service ，漏掉了 bean 。启动服务的时候就一直在 starting！关键是没有错误提示！如果有人碰到类似的情况好好去检查下配置吧。

### 0x01
有些服务依赖主机名之类的，具体错误忘记了。
总之就是要 hosts 文件里加上一条记录。  
127.0.0.1  sdfa-aad（主机名）

### 0x02
dubbo admin 服务显示有个 bug。
具体修复请参考 [这篇文章](http://blog.csdn.net/u012063409/article/details/59110559)

### 0x03
提供者服务启动脚本有点问题，我用了默认的 spring 容器来启动服务的，才会有这些脚本。  
在打包后的 bin 目录下的 start.sh 和 stop.sh 脚本中有一句:

    ps -f | grep java | grep "$CONF_DIR" |awk '{print $2}'

但是经常会已经启动服务了但是这句脚本找不到进程，推荐修改下脚本

    ps -ef | grep java | grep "$CONF_DIR" |awk '{print $2}'
