---
title: '模拟 connect read timeout'
layout: post
subtitle: "timeout, connection,read"
tags:
  - java
---

#### 背景
应用程序里会配置各种链接超时、读取超时时间等。但是很多时候我们都不知道这些配置是否生效，有些配置项可能会因为版本差异出现配置项的名称不同导致失效。最近找了个简单的工具可以方便模拟这两种情况。

#### 模拟读取超时 readTimeout
linux、macos 有 nc 工具可以直接在本地启动一个端口进行监听，不会响应只会读取数据。在终端执行 `nc -l 9000`，对 9000 端口号进行监听，应用中需要使用哪个端口即监听哪个端口，你可以在终端上看到应用传输过来的数据。

下面是我向 9000 端口发送了一个 http 请求。

```
deadlion@iMac2018 ~ % nc -l 9000
GET /demo HTTP/1.1
X-B3-TraceId: aaaaa
User-Agent: PostmanRuntime/7.28.0
Accept: */*
Cache-Control: no-cache
Host: localhost:9000
Accept-Encoding: gzip, deflate, br
Connection: keep-alive
```

退出终端即取消监听。

#### 模拟连接超时 connectTimeout
连接超时是在 tcp 三次握手失败导致的，但是应用程序大部分都是在建立连接之后对数据的操作，所以从应用程度端不太好模拟，后来找到个方法是配置防火墙策略，对握手的数据包丢弃即可模拟连接超时。
前提还是需要使用到 nc 命令，先启动监听端口，否则会应用端会直接 Connection refused。

先执行 `nc -l 9000`，再执行 `iptables -A OUTPUT -p tcp -m tcp --tcp-flags SYN SYN --sport 9000 -j DROP ` ，该命令会丢弃 SYN 数据包，导致无法建立链接，适用 linux。macos 也有类似 iptables 的命令，感兴趣的小伙伴可以自己研究下。

