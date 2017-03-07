---
title: '微信 JS-SDK 添加卡券'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170307
tags:
    - wechat
---

最近帮朋友做了一个添加卡券的功能，朋友想批量添加卡券，就是一次领好几张一样的券。
做完发现还蛮多问题的，最后一直都是签名不对，但是把签名放到验证工具里检查又是对的。
这篇文章把添加卡券要注意的问题都写出来，也许有人能用上呢。

### api_ticket 和 jsapi_ticket 不是一个东西
用于卡券接口签名的 api_ticket 与通过 config 接口注入权限验证配置使用的 jsapi_ticket 不同。卡券 api_ticket 有点类似于 access_token，是有 7200 的有效期的，要在本地缓存下。

### 卡券 cardExt 内的参数与卡券签名中的字段一致对齐
文档里也说的不清楚，我看到 cardExt 里写的必填参数只有 timestamp 和 signature。但是实际上 nonce_str 字段是参与签名了的，也就是说如果 cardExt 里的字段有参与签名的字段，那就必须得写出来。要不然也会出现签名错误的问题。我就是碰到这种情况了，实际上签名是对的，但是参与签名的 nonce_str 没有在 cardExt 中显示出来。


其他相关参考信息。
[JSSDK相关](https://kf.qq.com/faq/120911VrYVrA151016U7jMvy.html)
[微信卡券JSAPI签名校验工具](https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=cardsign)
[JS-SDK Demo](http://203.195.235.76/jssdk/#menu-card)
[微信公众号技术文档](https://mp.weixin.qq.com/wiki)
