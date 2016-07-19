---
title: "mysql replace special characters"
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef2016071801
tags:
    - mysql
---

由于系统升级，涉及到数据转换问题。  
之前表中有个字段里是用 `;` 符号分隔的。但是新的数据使用 `,` 分隔。  
可以用 sql 中 replace() 方法来替换。

```
replace(string_expression,from_str,to_str);
// string_expression 是待替换文本
// from_str 待替换字符串
// to_str 想要的字符串
```

下面是我写的 sql：

```
UPDATE investor
SET direction = REPLACE (
	direction,
	char(';'),
	char(',')
);
```

后来考虑到如果是特殊字符替换应该怎么写呢？试过转义，好像没用。后来在 stackoverflow 上看到另外一种方法就是用 ASCII 码。具体如下：

```
UPDATE investor
SET direction = REPLACE (
	direction,
	char(59),
	char(44)
);
```

注意中文标点不在 ASCII 中哦。

相关参考：  
[stackoverflow 问题](http://stackoverflow.com/questions/6066953/remove-special-characters-from-a-database-field)

![ASCII 字符对应表](/media/images/20160719104901.jpg)
