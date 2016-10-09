---
title: "Let's Encrypt 初体验"
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720160928
tags:
    - https
    - security
---

近期，Mozilla 表态将停止信任 WoSign 和 StartCom 签发的新证书。具体啥原因广大群众自行搜索吧。

公司网站上用的就是 WoSign 的免费证书，也快要到期了，正好看看其他有啥可替代的服务。

[Let's Encrypt](https://letsencrypt.org/) 是一家免费、自动化、开放的证书颁发机构（CA）。其它就不多说了，很多人都应该听说过。
我们直接进入主题吧。
官网提供的方法比较复杂，需要安装很多不必要的东西，推荐一个简化的项目 [acme-tiny](https://github.com/diafygi/acme-tiny) 。基本就是按照该教程来做的。

## 0x00 克隆 acme-tiny 项目

```
sudo git clone https://github.com/diafygi/acme-tiny.git
cd acme-tiny
```

## 0x01 创建私钥
要先装好 openssl

```
openssl genrsa 4096 > account.key
```

## 0x02 创建域名证书签名请求

```
#创建域名私钥
openssl genrsa 4096 > domain.key

#单个域名
openssl req -new -sha256 -key domain.key -subj "/CN=yoursite.com" > domain.csr

#多域名，比如 a.yoursite.com 和 b.yoursite.com
openssl req -new -sha256 -key domain.key -subj "/" -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:a.yoursite.com,DNS:b.yoursite.com")) > domain.csr
```

如果创建多域名证书签名请求的话要注意，后面验证的话是同时验证的。如果多个域名指向同一台服务器的话推荐多域名签名。
还有个问题就是 openssl.cnf 路径按照实际路径来，像我的就是 /etc/pki/tls/openssl.cnf 。

## 0x03 创建网站服务器 challenge 文件
Let's Encrypt 要求你必须证明签名的域名是属于你的，所以需要在服务器上验证一些文件。脚本会帮你生成这些文件到你指定的文件夹中，我们要做的就是确保 .well-known/acme-challenge/（验证的时候会访问 yourdomian.com/.well-known/acme-challenge/） url 对应的是这个文件夹。提示：默认是发送 http 请求到 80 端口，所以最好是用 HTTP 服务（重定向到 HTTPS 也是可以的）。


```
#创建 challenge 文件夹 (按需修改)
mkdir -p /var/www/challenges/
```

nginx 配置

```
#example for nginx
server {
    listen 80;
    server_name a.yoursite.com b.yoursite.com;

    location /.well-known/acme-challenge/ {
        alias /var/www/challenges/;
        try_files $uri =404;
    }

    ...the rest of your config
}
```

有些人在这一步卡住了，那么这里教一个简单的方法验证你的配置是不是正确

```
echo 123123 > /var/www/challenges/test.txt && curl http://yourdomian.com/.well-known/acme-challenge/test.txt
```

在 /var/www/challenges/ 文件夹下生成一个 txt 文件，然后通过 url 读取该文件，看看是不是正确输出了 123123。
出错的原因有可能是下面几种：

  - 修改了 nginx 配置，但是没有 reload 。
  - /etc/hosts 配置有问题。
  - 还有可能 http 直接重定向到 https 了，那你还是配置到 80 端口上的话就不对了，应该直接配置到 443 端口上。

## 0x04 获取签名证书

```
#在服务器上运行这条脚本，就在 acme-tiny 目录下
python acme_tiny.py --account-key ./account.key --csr ./domain.csr --acme-dir /var/www/challenges/ > ./signed.crt
```

由于服务器的 python 版本是 2.6 的，没有 argparse 模块。
两个办法：
1.升级到 2.7 版本，因为 2.7 自带 argparse 模块。
2.直接 copy [argparse.py](/media/scripts/argparse.py) 到项目目录（acme-tiny 目录下）。

升级太麻烦了，建议直接用第二种方法吧。

## 0x05 安装证书

```
#NOTE: 对于 nginx, 需要将 Let's Encrypt 中间证书加到证书中
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat signed.crt intermediate.pem > chained.pem
```

nginx 配置

```
server {
        listen       443;

        server_name  a.yourdomian.com;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;

		    ssl                  on;

        ssl_certificate      /root/acme-tiny/chained.pem;
        ssl_certificate_key  /root/acme-tiny/domain.key;

        ssl_session_timeout  5m;

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA:ECDHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA;
		    ssl_session_cache shared:SSL:50m;
		    ssl_prefer_server_ciphers on;

        #other config
}
```

## 0x06 更新证书脚本
Let's Encrypt 的证书只有三个月的有效期，所以需要配置个自动更新的脚本，原理就是重新执行下申请签名脚本。所以 `0x03` 中的 */.well-known/acme-challenge/* 不能动，还是要保证其可正确访问的。

renew_cert.sh

```
#!/usr/bin/sh
python /path/to/acme_tiny.py --account-key /path/to/account.key --csr /path/to/domain.csr --acme-dir /var/www/challenges/ > /tmp/signed.crt || exit
wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem
cat /tmp/signed.crt intermediate.pem > /path/to/chained.pem
service nginx reload
```

```
#设置定期执行脚本（每月跑一次）
0 0 1 * * /path/to/renew_cert.sh 2>> /var/log/acme_tiny.log
```

注意修改下相关文件路径。


下面是我写的脚本

```
python /root/acme-tiny/acme_tiny.py --account-key /root/acme-tiny/account.key --csr /root/acme-tiny/domain.csr --acme-dir /var/www/challenges/ > /root/acme-tiny/signed.crt || exit
cat /root/acme-tiny/signed.crt /root/acme-tiny/intermediate.pem > /root/acme-tiny/chained.pem
/root/app/tengine/sbin/nginx -s reload
```

下面这句我觉得没必要，因为好像不会变，不放心的话还是加上吧。谁知道以后会不会变呢。

	wget -O - https://letsencrypt.org/certs/lets-encrypt-x3-cross-signed.pem > intermediate.pem

还有写脚本的时候注意，最好是直接在目标环境上直接写，像我在 windows 上写好传上去的话会出错，因为格式不一样。  
不过也可以用 vi 编辑器改一下就好了。  

查看文件格式命令：

	:set ff

可以看到如下信息 

     fileformat=dos 或 fileformat=unix 
     
利用如下命令修改文件格式 

     :set ff=unix 
     :wq 
