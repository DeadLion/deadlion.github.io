---
title: '站内消息'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720170104
tags:
    - other
    - project
---

直接看类设计吧

```java
public class Notify {

	private Long id;
	private String title;	//标题
	private String content; //内容
	private String url; 	//链接，使用绝对地址，因为有可能发站外地址。
	private Long target;  //目标人 id
	private String targetType; //目标类型
	private String contentType; //消息内容类型： project
	private String extData;			//其它相关 id 或者备用数据
	private Long sender;	//发送人
	private String remark; //备注
	private Date createAt; //创建时间
	private Long hasReadNum; //已读数

}

public class UserNotify extends Notify{

	private Long id;
	private Long notifyId; //消息 id
	private Long memberId; //用户 id
	private Boolean isRead; //已读标记
	private Date readAt; //查看时间

}  
```

先从最初级的需求：向全体用户发消息开始。
因为消息内容都是一样的，所以把消息本身抽象出来。  
用户消息就通过 id 关联起来，然后添加了已读标记，方便统计阅读率。  

那面临的第一个问题就是生成 UserNotify 。  
正常来说，我发布了一条 Notify，那么就应该为所有用户生成 UserNotify。  
但是这种方法非常浪费资源，因为网站活跃用户只是注册用户的一小部分，可能一天只有几百的样子。而且瞬间生成那么多记录也会占用各种资源，可能影响到其他业务。  
这里我采用的方法是用户登录的时候才会去拉取消息。然后再生成新的 UserNotify 记录。

![](/media/images/20170104170648.png)

因为登录完一般在首页，只需要展示未读消息数就够了，就是类似 iPhone 上 app 图标的那个红色小圆，里面显示未读消息数。  
在消息页展示所有消息内容。

需要向特定身份的人发送消息，那么就在 *targetType* 字段中设置。  
需要向指定的人发送消息，那就在 *target* 中写入用户 id。  
在用户拉取消息的时候添加对应的判断条件就可以了。

这样一个比较简单的站内消息模块就完成了。  
后面根据需求再继续优化扩展。
