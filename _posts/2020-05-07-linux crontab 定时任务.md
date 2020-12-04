---
title: 'Linux crontab 定时任务'
layout: post
subtitle: "Linux, crontab, 定时任务"
tags:
  - linux
---

同事离职交接给我一个任务，每个月一号凌晨跑一个任务，任务的功能就是读取文件里的一批 userid，然后调用某个接口。背景就不做过多的介绍了，就是优先保障一些“用户”的权益能在月初及时到账。

这种事情放在服务器上用 linux 自带的 cron 任务再合适不过了。

### crontab 命令介绍
```
crontab [-u username]　　　　//省略用户表表示操作当前用户的crontab
    -e      (编辑工作表)
    -l      (列出工作表里的命令)
    -r      (删除工作作)
```

crontab -e 执行后就和 vim 编辑文本一样。

一条完整的 crontab 命令由前面的时间规则和动作组成，比如：

    * * * * * command 

每分钟执行一次 command 命令。

    5 0 1 * * /Users/deadlion/job.sh

每月 1 号 0 点 5 分执行 /Users/deadlion/job.sh 脚本。

关于前面的时间规则推荐一个工具 https://tool.lu/crontab/ 。

上面有规则的详细介绍，以及根据 cron 表达式推算后面 7 次的执行时间。


在我这个例子里的话，我写的 shell 脚本如下：

```
#!/bin/bash
source /etc/profile
cd /home/migu/soft/gift/
nohup java -jar commontools-1.0.jar userId_leader0331.txt  >> result-$(date "+%Y
-%m-%d-%H-%M-%S").txt 2>&1 &
```

### 优缺点
- 轻量
- linux 内置服务稳定
- 不适合分布式


### 避坑指南
- 以前碰到一种情况是在 cron 中执行没有 java 环境，但是直接在终端中用 java 命令是正常的。所以直接在脚本里加载一下环境变量最好。
- 注意下路径，最好用绝对路径。
- 条件允许的话，第一次最好能自测下，将时间间隔调小些，模拟 cron 任务触发执行。
- tailf /var/log/cron 可以查看定时任务执行记录


### 其他资料
[crontab 定时任务](https://linuxtools-rst.readthedocs.io/zh_CN/latest/tool/crontab.html)