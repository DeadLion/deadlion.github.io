---
title: "Atom package git-plus 使用教程"
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef201603141
tags:
    - atom
---


为啥用 git-plus 插件一直无法 push 成功呢？

再试试  
最后试一次

还真的好了，但是我不知道为啥好的。
网上有很多种说法，最多的就是说 ssh key 的问题。

在 git-plus 的 issue 里有很多人反应 windows 版本无法正常使用 push pull。

明天去公司电脑上实验下，看看到底是啥原因。

我今天尝试了太多方法，所以无法确定到底是什么原因造成的，所以今天尝试的方法就不写了。

今天再来试一下

这次一定成功！

好吧，这次是真的成功了，搞清楚是啥原因了。

因为我用的是 https ，而不是 ssh。所以每次 commit 提交能成功，但是 push 就没有下文了，也没有任何提示。因为 push 的时候需要输账户和密码。

我把原来的删除，然后重新用 ssh 方式 clone 下来就可以了。

因为电脑上之前安装了 github for windows，它也自带 git shell，所以我电脑上的环境也特别乱。

完整梳理下步骤好了，如果是 windows atom 客户端使用 git-plus 的话。

1.设置 git.exe 的路径，在相应的 package 里面设置。如果在系统 Path 里面已经添加了的话就可以省略此步骤。

如果和我一样使用 github for windows 的话，路径一般像下面这样(默认安装)

```
C:\Users\justin\AppData\Local\GitHub\PortableGit_cf76fc1621ac41ad4fe86c420ab5ff403f1808b9\cmd\git.exe
```

2.设置 config 参数 user.name user.email

```
git config --global user.name "yourname"
git config --global user.email "youremail"
```

3.使用 ssh 方式 clone 项目

```
git clone git@github.com:DeadLion/deadlion.github.io.git
```

关于如何添加 SSH 请参考 [github 官网说明](https://help.github.com/categories/ssh/)。
