---
title: '教你配置使用阿里云 Maven 库，体验秒下 jar 包的快感'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170219
tags:
    - maven
    - java
---

鉴于国内的网络环境不太好，从默认 Maven 库下载 jar 包是非常的痛苦。
速度慢就不说了，还经常是下不下来，然后一运行就是各种 `ClassNotFoundException`，然后你得找到残留文件删掉重新下，或者下载到本地然后通过命令添加到本地库中。

今天就给大家安利下阿里云的 Maven 库：[http://maven.aliyun.com](http://maven.aliyun.com)。秒下 jar 包！

###  全局配置
在本地库 .m2 的目录下创建一个 settings.xml 文件，然后添加配置：

```
<repositories>
    <repository>
      <id>central</id>
      <name>Central Repository</name>
      <url>http://maven.aliyun.com/nexus/content/repositories/central</url>
      <layout>default</layout>
      <snapshots>
        <enabled>false</enabled>
      </snapshots>
    </repository>
  </repositories>

```

Windows 系统默认的路径是 `C:\Users\你的系统用户名\.m2`
Mac 系统下也是类似的路径 `用户\你的用户名\.m2`

### 项目配置
你也可以针对单个项目使用阿里云 Maven 库，只需要把上面的 repositories 配置复制到项目 POM.xml 中即可。

然后就能体验秒下 jar 包的快感了！
