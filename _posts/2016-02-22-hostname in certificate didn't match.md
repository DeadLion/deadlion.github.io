---
title: 'hostname in certificate didn't match'
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

在 new SSLSocketFactory 的时候增加一个参数就好了。

挖坑，后面补。
