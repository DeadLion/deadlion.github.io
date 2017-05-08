---
title: '项目替换 SOA 框架'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170504
tags:
    - java
    - dubbo
---

公司现在的项目用了 58 内部的一个 SOA 框架，一直有个接收数据超时的问题，由于不是开源的（号称开源，结果只是换了个名字然后开源了第一个版本的代码而已，后面也没有人维护和更新），所以很难排查问题。反正从我进公司开始就一直被这个问题折腾，因为这个问题还会导致很多的连锁 Bug，简直不要太坑。

### 1
```xml
<!-- 声明需要暴露的服务接口 -->
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoService" />

    <!-- 和本地bean一样实现服务 -->
    <bean id="demoService" class="com.alibaba.dubbo.demo.provider.DemoServiceImpl" />
```
当时只配置了 dubbo:service ，漏掉了 bean 。启动服务的时候就一直在 starting！关键是没有错误提示！如果有人碰到类似的情况好好去检查下配置吧。

### 2
有些服务依赖主机名之类的，具体错误忘记了。
总之就是要 hosts 文件里加上一条记录。  
127.0.0.1  sdfa-aad（主机名）

### 3
dubbo admin 服务显示有个 bug。
具体修复请参考 [这篇文章](http://blog.csdn.net/u012063409/article/details/59110559)
