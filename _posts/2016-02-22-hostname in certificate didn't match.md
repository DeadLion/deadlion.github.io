---
title: "hostname in certificate didn't match"
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720160222
tags:
    - java
    - exception
---

最近一个第三方接口又出问题了，是的。 又！！！出问题了！！！
三天两头出问题，真是捉急。

```
Caused by: javax.net.ssl.SSLException: hostname in certificate didn't match:
```

先说怎么解决的吧

```
//老代码
SSLSocketFactory socketFactory = new SSLSocketFactory(ctx);

//新代码
SSLSocketFactory socketFactory = new SSLSocketFactory(ctx,SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
```

使用另外一个 SSLSocketFactory 构造函数，增加 X509HostnameVerifier 参数。


后来和他们公司沟通说是启用了新域名，和原来老域名并用。他们也不知道为什么会报错。
但是根据错误信息提示就是因为 hostname 不匹配。

那新增的参数是干啥用的呢？  
设置 hostname 验证模式的,有如下三种

```
ALLOW_ALL_HOSTNAME_VERIFIER 这个看字面意思就知道了，允许所有域名。

BROWSER_COMPATIBLE_HOSTNAME_VERIFIER（默认配置） 浏览器匹配
允许所有子域名，如 *.foo.com 匹配 a.b.foo.com 也可以通过。

STRICT_HOSTNAME_VERIFIER 严格模式
只匹配同级域名，比如使用了通配符  *.foo.com 那么只能匹配 a.foo.com 。如果是 a.b.foo.com 就无法通过验证。

```

构造 SSLSocketFactory 的时候，如果没有提供此项参数的话，默认就是 BROWSER_COMPATIBLE_HOSTNAME_VERIFIER 模式。

还有一种方法就是自己实现一个 hostname 验证函数。
可以根据自己的需求来实现。

```
X509HostnameVerifier hostnameVerifier = new X509HostnameVerifier() {

				@Override
				public boolean verify(String arg0, SSLSession arg1) {
          // 总是返回 true
        	return true;
				}

				@Override
				public void verify(String host, String[] cns, String[] subjectAlts) throws SSLException {
					// TODO Auto-generated method stub

				}

				@Override
				public void verify(String host, X509Certificate cert) throws SSLException {
					// TODO Auto-generated method stub

				}

				@Override
				public void verify(String host, SSLSocket ssl) throws IOException {
					// TODO Auto-generated method stub

				}
			};
```
