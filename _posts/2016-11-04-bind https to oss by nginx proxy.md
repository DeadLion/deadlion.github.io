---
title: 'Nginx 反向代理绑定自定义 https 到 oss'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720161104
tags:
    - nginx
    - https
---

最近出现一个坑爹的问题，在微信中从网站上下载一些文件无法打开，直接跳转到涉嫌违规页面。经过一番排查发现微信把阿里云 oss 的官方域名封掉了。具体原因估计是有些人真的违规了，而且用了 oss 的二级域名，导致根域名也被牵连。

那现在就只能绑定自己的域名来解决这个问题了。

oss 有提供配置自定义域名的服务，但是只支持 http ，而不支持 https 。（我记得七牛好像可以上传对应的 https 证书以达到支持 https 的目的）

于是只能考虑用 Nginx 配置反向代理来解决这个问题了。  

```
server {
      listen       443 ssl;
      server_name  file.xxxx.com;
      #中间还有些其他配置 ssl 证书之类的。
      location / {
          #下面三个配置可以省略，但是 oss 本身有一些统计监控，如果不配置的话，可能会看到所有流量都是本机 ip 访问的。
     			proxy_set_header   Host             $host;
     			proxy_set_header   X-Real-IP        $remote_addr;
     			proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
     			proxy_pass http://xxxx.oss-cn-hangzhou-internal.aliyuncs.com/;  #如果都在一个区使用内网连接，节省流量。
     			expires 1y; #配置过期时间，会自动缓存在浏览器客户端，第二次访问会返回 304 ，不会再重新请求，节省流量。
      }

}  
```

现在访问一个文件，https://file.xxxx.com/a.jpg ，实际上是 http://xxxx.oss-cn-hangzhou-internal.aliyuncs.com/a.jpg 。这样就解决了 url 被和谐的问题了。

我不太确定 nginx rewrite 是不是也能达到同样的效果。后面会仔细研究一下。
