---
title: ' 开源 apm 系统 Apache skywalking 实践笔记'
layout: post
subtitle: "apm,skywalking"
tags:
  - java
  - apm
---

### 缘起
由于服务缺乏监控，导致一些疑难故障的时候只能查日志、看代码。服务器一些基本的硬件指标是有 zabbix 监控，但是应用层面的监控就没有了，比如 gc 、堆内存等等，经过一番调研发现 skywalking 比较适合，开源而且无需改动业务代码，只需要增加启动参数重启即可。

这篇文章主要是描述下我在使用过程中遇到的问题，给大家参考。 

skywalking 就不再单独介绍了，一些基本概念直接在官网上看吧。



### 架构介绍
官网提供的安装包很简单，一个压缩包里包含了服务端 oapServer、webapp，客户端使用的  agent。

oapServer 其实是有三种角色的、默认是混合模式，还有 Receiver（接收器）、Aggregator（聚合器）。

[](https://skywalking.apache.org/assets/frame-v8.jpg?u=20200423)

上面的架构图很清晰的表达了角色的含义，Receiver 是用来接收数据的，Aggregator 用来持久化数据的。我在使用的时候是用了默认混合模式，目前在两台 8c 16G 的虚机上各启动了两个实例，共 4 个 oapServer 实例，后面会测试下接入多少服务器会有压力。

因为是采用了前后端分离的模式，所以有个 webapp 作为 dashboard 来展现数据。因为 webapp 是没有登录校验的，所以我是用  nginx basic auth 方案来走个简单的登录。

关于数据存储，考虑到后期可能会扩容就选了 ES，目前按照每天 1T 的数据量来评估的，数据的大头主要是 trace 数据，测试环境上看一条 trace(表名称为 segment) 约 6Kb，然后根据每天多少请求来算的。

### 服务端配置

#### recordDataTTL、metricsDataTTL 
这两个参数是用来控制数据保存多久，用 ES 的话每天会生成 140+ 个索引，xxxx-20210309 类似这种。recordData 主要就是 segment，其他大部分都是 metricsData。

#### 配置中心
我们用了 apollo 配置中心，那么你一定要配置 `core.default.apdexThreshold = default: 500` ，否则 oapServer 会一直打印 warn 日志，不管的话很可能会撑爆硬盘。

#### webui 定制
默认的很多面板我们都用不上，比如 .net 服务的监控。还有 service-mesh 等等。  
ui-initialized-templates 目录下可以控制 webui 上展示的模块和栏目，删除 ui_template 索引的话，重启 oapServer 可以自动重新生成。
####  集群管理
使用 consul 的话一定要配置 internalComHost（本机 ip） 和 internalComPort（grpc 端口），为了 consul 能做健康监测，否则会启动失败。
#### 自监测
selfObservability 默认是没有开启的，主要功能是监控 oapServer，开启的话需要修改 application.yml 中的 `prometheus-fetcher`  和 `telemetry`

```
prometheus-fetcher:
  selector: ${SW_PROMETHEUS_FETCHER:default}

telemetry:
  selector: ${SW_TELEMETRY:prometheus} 
```
#### 启动脚本
bin/oapServer.sh 中的脚本限制了 oapServer 的内存大小，默认是 `-Xms256M -Xmx512M`，根据资源情况调整。


