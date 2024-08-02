---
title: 'APISIX hmac-auth plugin postman pre js'
layout: post
subtitle: "APISIX,hmac-auth,postman,pre js"
tags:
  - APISIX
---

我们网关使用了 APISIX ，有些接口使用了 hmac-auth 插件，使用 postman 测试时会比较麻烦，需要手动生成签名，然后复制到请求头中。网上搜了下，发现没有支持 APISIX hmac-auth 插件的 postman pre js，不过  hmac-auth 是个标准的规范，虽然各家网关插件略有差别，但是基本原理是一样的。所以我网上找了个版本稍微改了下，支持 APISIX hmac-auth 插件。

```javascript

var crypto = require('crypto-js')

function hashString(algorithm, str, secret) {
  switch (algorithm) {
    case "hmac-sha1":
      return crypto.HmacSHA1(str, secret);
    case "hmac-sha256":
      return crypto.HmacSHA256(str, secret);
    case "hmac-sha512":
      return crypto.HmacSHA512(str, secret);
    default:
      return null;
  }
}

var gmtDate = new Date().toGMTString();
// console.log("path:"+pm.request.url.getPath())
var targetUrl = pm.request.url.getPath()

// keyId 就是 access_key secret 就是 secret_key
var keyId = "xxx"
var secret = "xxx"
// 按需设置
var algorithm = "hmac-sha256";

var method = pm.request.method

var uri = targetUrl

var canonical_query_string = ""

var sigString = method+"\n"+uri +"\n" +canonical_query_string+"\n"+keyId+"\n"+gmtDate +"\n"
// console.log(sigString)


var digest = crypto.enc.Base64.stringify(hashString(algorithm,pm.request.body.raw,secret))

var signature = crypto.enc.Base64.stringify(hashString(algorithm,sigString,secret))
// console.log(signature)

pm.request.headers.add({key:"Date",value:gmtDate})
pm.request.headers.add({key:"X-HMAC-ACCESS-KEY",value:keyId})
pm.request.headers.add({key:"X-HMAC-SIGNATURE",value:signature})
pm.request.headers.add({key:"X-HMAC-DIGEST",value:digest})
pm.request.headers.add({key:"X-HMAC-ALGORITHM",value:algorithm})

```

不过我们没使用需要签名的自定义 header，如果有使用的话需要拼接一下。自己稍微改下就行了。

APISIX hmac-auth 插件的文档：https://apisix.apache.org/zh/docs/apisix/plugins/hmac-auth


postman pre-request-scripts 文档：https://learning.getpostman.com/docs/writing-scripts/pre-request-scripts/

不同 postman 版本 pre-request-scripts 语法可能不同，万一跑不起来了检查下最新的文档。

