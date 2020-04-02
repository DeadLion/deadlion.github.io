---
title: 'spring boot 迷之 400 Bad Request'
layout: post
subtitle: "spring boot, 400 ,bad request,IllegalArgumentException"
tags:
  - spring boot,java
---

昨天两个应用的接口都碰到了 400 错误，但是错误日志还不一样。本地还无法复现！


### 1 The character [_] is never valid in a domain name
```
xxxx the host [auth_tv] is not valid //记不清具体的信息了
java.lang.IllegalArgumentException: The character [_] is never valid in a domain name.
	org.apache.tomcat.util.http.parser.HttpParser$DomainParseState.next(HttpParser.java:926)
	org.apache.tomcat.util.http.parser.HttpParser.readHostDomainName(HttpParser.java:822)
	org.apache.tomcat.util.http.parser.Host.parse(Host.java:71)
	org.apache.tomcat.util.http.parser.Host.parse(Host.java:45)
	org.apache.coyote.AbstractProcessor.parseHost(AbstractProcessor.java:273)
	org.apache.coyote.http11.Http11Processor.prepareRequest(Http11Processor.java:809)
	org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:384)
	org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66)
	org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:764)
	org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1388)
	org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49)
	java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61)
	java.lang.Thread.run(Thread.java:748)
```

原因说的很清楚了，就是 host 里有下划线，校验不通过。但是应用之前一直都是好的，综合网上的资料发现是 tomcat 新版本中对参数校验更加严格了。

#### 1.1 换 tomcat 版本
降低 tomcat 版本，因为我用的是 spring boot ,所以是内嵌的 tomcat，通过在项目 pom 中添加下面的参数来指定版本。

```
	<properties>
		<tomcat.version>8.5.20</tomcat.version>
	</properties>
```

具体降能降到哪个版本只能自己试了，项目可能会依赖其中的一些方法，所以高版本降低版本经常会碰到无法启动的情况，在xxx类里缺少xxx方法什么的。我这次就碰到了，我项目 spring boot 版本为 `v2.1.1.RELEASE`，默认自带的tomcat 版本为 `tomcat-embed-core 9.0.13`。我尝试过降到 8.5.14 结果就提示少了 `AbstractProtocol.setAcceptCount(int acceptCount) ` 方法。所以如果你想用这种方法解决的话，那你得多多尝试了，网上给的建议不一定适合每一个人。


其实还可以联想到另外一个类似的方法来解决这个问题，使用其他内嵌 servlet 容器来尝试，比如说用  jetty 。

#### 1.2 解决源头
可以从源头来解决，我的情况就是上游的 nginx 转发请求的时候往 host 值里加了 auth_tv，那如果能改掉这个名字就可以了呀，或者如果你的应用不需要用的  header 的话，可以考虑 nginx 屏蔽掉 header，这样你的应用就不用改了。


[Improve logging in AbstractProcessor.parseHost()](https://bz.apache.org/bugzilla/show_bug.cgi?id=62371#c14)

### 2 The valid characters are defined in RFC 7230 and RFC 3986
```
2020-03-27 14:46:16.296 [http-nio-19098-exec-1] INFO  org.apache.coyote.http11.Http11Processor - Error parsing HTTP request header
 Note: further occurrences of HTTP header parsing errors will be logged at DEBUG level.
java.lang.IllegalArgumentException: Invalid character found in the request target. The valid characters are defined in RFC 7230 and RFC 3986
        at org.apache.coyote.http11.Http11InputBuffer.parseRequestLine(Http11InputBuffer.java:472) ~[tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:683) [tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66) [tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:868) [tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1457) [tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49) [tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_161]
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_161]
        at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) [tomcat-embed-core-8.5.20.jar!/:8.5.20]
        at java.lang.Thread.run(Thread.java:748) [?:1.8.0_161]
```

这是因为在 url 中带了特殊字符`{}|`，我们的接口地址是 `http://xxx?request={"key":"value"} `，请求的时候需要对参数做 urlencode，但是在本地 postman 测试确复现不了。扔到服务器上就 400 。

#### 2.1 配置 requestTargetAllow
spring boot 项目在启动类 main 函数中配置

```
 System.setProperty("tomcat.util.http.parser.HttpParser.requestTargetAllow","|{}");
```
诡异的是我确认配置已经生效了（通过 debug），本地无法复现出返回 400 的情况，本地无法测试。所以扔到服务器上试了仍然 400。

#### 2.1 tomcat 换 jetty
主要就是 pom 中替换依赖，这个具体怎么换就不细说啦，最后解决了 400。不过
我换成 jetty 之后又碰到另外一个问题，原来获取头信息 content-type，在 jetty 里变成了  Content-Type。

虽然 servlet 有规范，但是各个容器的细节还是稍有不同，真是让人头发。


### 3 参考资料
[Improve logging in AbstractProcessor.parseHost()](https://bz.apache.org/bugzilla/show_bug.cgi?id=62371#c14)

[characters are defined in RFC 7230 and RFC 3986](https://programmer.help/blogs/characters-are-defined-in-rfc-7230-and-rfc-3986.html)

[ RFC 7230/3986 url requirement that prevents unencoded curly braces should be optional, since it breaks existing sites](https://bz.apache.org/bugzilla/show_bug.cgi?id=60594)