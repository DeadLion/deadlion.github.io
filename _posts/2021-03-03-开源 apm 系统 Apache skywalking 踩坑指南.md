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

config/fetcher-prom-rules/self.yaml  url 需要修改
```
staticConfig:
  # targets will be labeled as "instance"
  targets:
    - url: http://localhost:1234
```

#### 启动脚本
bin/oapServer.sh 中的脚本限制了 oapServer 的内存大小，默认是 `-Xms256M -Xmx512M`，根据资源情况调整。

#### ElasticSearch

##### maximum shards open
es 集群每个 node max_shards_per_node 值默值为 1000，比如我们 5 个 node，总 shard 值为 5000，如果是一个 index 一个 shard 算的话。5000/160 约 30 天就无法再创建新索引了。  

会出现下面的异常：  
```
[ElasticsearchException[Elasticsearch exception [type=illegal_argument_exception, reason=Validation Failed: 1: this action would add [2] total shards, but this cluster currently has [4999]/[5000] maximum shards open;]]]]
```
可以按照实际情况设置值，或者将保存数据的时间调小，这样过期的索引就会被删掉。  
```
curl -L -X PUT 'localhost:9200/_cluster/settings?pretty' \
-H 'Content-Type: application/json' \
--data-raw '{
  "persistent": {
    "cluster": {
      "max_shards_per_node":1500
    }
  }
}'
```

##### index already exists

es 集群响应慢的时候会出现重复去创建 index 的情况，导致启动失败。这种情况建议是选取一个实例用 oapService.sh 来启动，但是这个实例需要用 supervisord 服务来确保能及时拉起。其他的实例都用 oapServiceNoInit.sh
脚本启动，这样会初始化创建实例的脚本可以一直

```
2021-05-06 12:37:35,806 - org.apache.skywalking.oap.server.starter.OAPServerBootstrap - 57 [main] ERROR [] - Elasticsearch exception [type=resource_already_exists_exception, reason=index [browser_app_page_load_page_percentile-20210506/3G6ROmwWRGqPOlftKD92Rw] already exists]
org.elasticsearch.ElasticsearchStatusException: Elasticsearch exception [type=resource_already_exists_exception, reason=index [browser_app_page_load_page_percentile-20210506/3G6ROmwWRGqPOlftKD92Rw] already exists]
        at org.elasticsearch.rest.BytesRestResponse.errorFromXContent(BytesRestResponse.java:177) ~[elasticsearch-7.5.0.jar:7.5.0]
        at org.elasticsearch.client.RestHighLevelClient.parseEntity(RestHighLevelClient.java:1793) ~[elasticsearch-rest-high-level-client-7.5.0.jar:7.5.0]
        at org.elasticsearch.client.RestHighLevelClient.parseResponseException(RestHighLevelClient.java:1770) ~[elasticsearch-rest-high-level-client-7.5.0.jar:7.5.0]
        at org.elasticsearch.client.RestHighLevelClient.internalPerformRequest(RestHighLevelClient.java:1527) ~[elasticsearch-rest-high-level-client-7.5.0.jar:7.5.0]
        at org.elasticsearch.client.RestHighLevelClient.performRequest(RestHighLevelClient.java:1499) ~[elasticsearch-rest-high-level-client-7.5.0.jar:7.5.0]
        at org.elasticsearch.client.RestHighLevelClient.performRequestAndParseEntity(RestHighLevelClient.java:1466) ~[elasticsearch-rest-high-level-client-7.5.0.jar:7.5.0]
        at org.elasticsearch.client.IndicesClient.create(IndicesClient.java:131) ~[elasticsearch-rest-high-level-client-7.5.0.jar:7.5.0]
        at org.apache.skywalking.oap.server.storage.plugin.elasticsearch7.client.ElasticSearch7Client.createIndex(ElasticSearch7Client.java:109) ~[storage-elasticsearch7-plugin-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.storage.plugin.elasticsearch.base.StorageEsInstaller.createTable(StorageEsInstaller.java:93) ~[storage-elasticsearch-plugin-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.core.storage.model.ModelInstaller.whenCreating(ModelInstaller.java:55) ~[server-core-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.core.storage.model.StorageModels.add(StorageModels.java:70) ~[server-core-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.core.analysis.worker.MetricsStreamProcessor.create(MetricsStreamProcessor.java:138) ~[server-core-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.core.analysis.worker.MetricsStreamProcessor.create(MetricsStreamProcessor.java:97) ~[server-core-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.core.analysis.StreamAnnotationListener.notify(StreamAnnotationListener.java:57) ~[server-core-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oal.rt.OALRuntime.notifyAllListeners(OALRuntime.java:167) ~[oal-rt-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.core.oal.rt.OALEngineLoaderService.load(OALEngineLoaderService.java:61) ~[server-core-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.receiver.browser.provider.BrowserModuleProvider.start(BrowserModuleProvider.java:73) ~[skywalking-browser-receiver-plugin-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.library.module.BootstrapFlow.start(BootstrapFlow.java:49) ~[library-module-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.library.module.ModuleManager.init(ModuleManager.java:62) ~[library-module-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.starter.OAPServerBootstrap.start(OAPServerBootstrap.java:43) [server-bootstrap-8.4.0.jar:8.4.0]
        at org.apache.skywalking.oap.server.starter.OAPServerStartUp.main(OAPServerStartUp.java:27) [server-starter-es7-8.4.0.jar:8.4.0]
        Suppressed: org.elasticsearch.client.ResponseException: method [PUT], host [http://10.186.85.123:9200], URI [/browser_app_page_load_page_percentile-20210506?master_timeout=30s&timeout=30s], status line [HTTP/1.1 400 Bad Request]
```