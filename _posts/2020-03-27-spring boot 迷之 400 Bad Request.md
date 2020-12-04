---
title: 'spring boot 迷之 400 Bad Request'
layout: post
subtitle: "spring boot, 400 ,bad request,IllegalArgumentException"
tags:
  - spring boot,java
---

昨天两个接口都碰到了 400 错误，但是错误日志还不一样。


### 1 The character [_] is never valid in a domain name
```
16:32:24.204 [http-nio-10099-exec-2] INFO  org.apache.coyote.http11.Http11Processor - The host [auth_tv] is not valid
 Note: further occurrences of request parsing errors will be logged at DEBUG level.
java.lang.IllegalArgumentException: The character [_] is never valid in a domain name.
	at org.apache.tomcat.util.http.parser.HttpParser$DomainParseState.next(HttpParser.java:926) ~[tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.tomcat.util.http.parser.HttpParser.readHostDomainName(HttpParser.java:822) ~[tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.tomcat.util.http.parser.Host.parse(Host.java:71) ~[tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.tomcat.util.http.parser.Host.parse(Host.java:45) ~[tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.coyote.AbstractProcessor.parseHost(AbstractProcessor.java:288) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.coyote.http11.Http11Processor.prepareRequest(Http11Processor.java:809) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:384) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:791) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1417) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142) [?:1.8.0_111]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617) [?:1.8.0_111]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) [tomcat-embed-core-9.0.13.jar:9.0.13]
	at java.lang.Thread.run(Thread.java:745) [?:1.8.0_111]
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


#### 1.2 解决源头
可以从源头来解决，我的情况就是上游的 nginx 转发请求的时候往 host 值里加了 auth_tv，那如果能改掉这个名字就可以了呀，或者如果你的应用不需要用到 header 中 host 值的话，可以考虑 nginx 屏蔽掉 host。


### 2 The valid characters are defined in RFC 7230 and RFC 3986
```
2020-04-08 13:31:40.688 [http-nio-10099-exec-1] INFO  org.apache.coyote.http11.Http11Processor - Error parsing HTTP request header
 Note: further occurrences of HTTP header parsing errors will be logged at DEBUG level.
java.lang.IllegalArgumentException: Invalid character found in the request target. The valid characters are defined in RFC 7230 and RFC 3986
	at org.apache.coyote.http11.Http11InputBuffer.parseRequestLine(Http11InputBuffer.java:472) ~[tomcat-embed-core-8.5.20.jar:8.5.20]
	at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:683) [tomcat-embed-core-8.5.20.jar:8.5.20]
	at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:66) [tomcat-embed-core-8.5.20.jar:8.5.20]
	at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:868) [tomcat-embed-core-8.5.20.jar:8.5.20]
	at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1457) [tomcat-embed-core-8.5.20.jar:8.5.20]
	at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:49) [tomcat-embed-core-8.5.20.jar:8.5.20]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142) [?:1.8.0_111]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617) [?:1.8.0_111]
	at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:61) [tomcat-embed-core-8.5.20.jar:8.5.20]
	at java.lang.Thread.run(Thread.java:745) [?:1.8.0_111]
```

<<<<<<< HEAD
这是因为在 url 中带了特殊字符`{}|`，我们的接口地址是 `http://xxx?request={"key":"value"} `，请求的时候需要对参数做 urlencode，但是在本地 postman 测试确复现不了。通过 debug 发现 postman 自动对特殊字符做了转换。
原请求
```
private/account/queryLiveBalance?request={"userId":"903935426","accountTypes":["MOVIE_ORIENT_AMOUNT_TICKET"]}&clientId=xxx&sign=xxx
```
在应用里拦截下来的请求确是下面这样的
```
private/account/queryLiveBalance?request=%7B%22userId%22:%22903935426%22,%22accountTypes%22:[%22MOVIE_ORIENT_AMOUNT_TICKET%22]%7D&clientId=xxx&sign=xxx HTTP/1.1
```

后来我找调用方要到了源代码发起测试收到请求是没有转换过的
```
private/account/queryLiveBalance?request={"userId":"903935426","accountTypes":["MOVIE_ORIENT_AMOUNT_TICKET"]}&clientId=xxx&sign=xxx HTTP/1.1
=======
这是因为在 url 中带了特殊字符`{}"`，我们的接口地址是 `http://xxx?request={"key":"value"} `，本地 postman 测试复现不了，经过 debug 发现 postman 自动对特殊字符做了 urlencode 。这个问题还是挺坑的，本地用 httpclient 去构造请求的话也会直接校验 queryString，有特殊字符的话无法发出请求。最后要到了调用方的代码，发现用这个版本的工具包可以复现出来 400。
```
        <dependency>
            <groupId>commons-httpclient</groupId>
            <artifactId>commons-httpclient</artifactId>
            <version>3.0</version>
        </dependency>
>>>>>>> a14b599f55b0a60b779f22f909deb12736868969
```

#### 2.1 配置 requestTargetAllow
spring boot 项目在启动类 main 函数中配置

```
 System.setProperty("tomcat.util.http.parser.HttpParser.requestTargetAllow","|{}");
```
这个配置项只能对 `|{}` 这三个特殊字符有效。因为在 HttpParser 代码里写死了。这个配置项对我不起作用，因为我们的 queryString 里面还包含了 " (双引号)。

```
        String prop = System.getProperty("tomcat.util.http.parser.HttpParser.requestTargetAllow");
        int i;
        if (prop != null) {
            for(i = 0; i < prop.length(); ++i) {
                char c = prop.charAt(i);
                if (c != '{' && c != '}' && c != '|') {
                    log.warn(sm.getString("httpparser.invalidRequestTargetCharacter", new Object[]{c}));
                } else {
                    REQUEST_TARGET_ALLOW[c] = true;
                }
            }
        }
```

#### 2.2 配置 relaxedQueryChars
在高版本的 tomcat 里可以通过配置 relaxedQueryChars 来放开特殊字符校验。下面是一种方式，还有另外一种方式是通过 @Bean 来配置。

```
@Component
public class PortalTomcatWebServerCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {
    public PortalTomcatWebServerCustomizer() {
    }

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> connector.setAttribute("relaxedQueryChars", "\"_{}[]|"));
    }
}
```

### 3 最终的办法
那现在就出现一个非常尴尬的事情就是，解决问题 1 需要降低 tomcat 版本。解决问题 2 需要高版本 tomcat。没找到能完美解决两个问题的办法。那就只能使用终极大招换容器了。如果你要问我为啥换容器就能行，瞎猫碰上死耗子信不信。

#### 3.1 tomcat 换 jetty
主要就是 pom 中替换依赖，这个具体怎么换就不细说啦，最后解决了 400。


不过我换成 jetty 之后又碰到另外两个问题，原来获取头信息 content-type，在 jetty 里变成了 Content-Type。

有个接口 header 里传了 Content-Encoding:UTF-8，导致报 501 ：
```
WARN  org.eclipse.jetty.server.HttpChannel - /private/delivery/delivery_request org.eclipse.jetty.http.BadMessageException: 
501: Unsupported Content-Encoding
```

Content-Encoding 不是这么传的呀，
```
Content-Encoding: gzip
Content-Encoding: compress
Content-Encoding: deflate
Content-Encoding: identity
Content-Encoding: br

// Multiple, in the order in which they were applied
Content-Encoding: gzip, identity
Content-Encoding: deflate, gzip
```
这才是正确的值。

版本差异，规范实现的差异真的是让人头大。解决了老的问题结果又冒出来一堆新的问题。

代码不规范，研发两行泪！

### 4 参考资料
[Improve logging in AbstractProcessor.parseHost()](https://bz.apache.org/bugzilla/show_bug.cgi?id=62371#c14)

[characters are defined in RFC 7230 and RFC 3986](https://programmer.help/blogs/characters-are-defined-in-rfc-7230-and-rfc-3986.html)

[ RFC 7230/3986 url requirement that prevents unencoded curly braces should be optional, since it breaks existing sites](https://bz.apache.org/bugzilla/show_bug.cgi?id=60594)