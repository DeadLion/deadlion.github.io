---
title: "SpringMVC 复杂对象数据绑定"
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef2016051401
tags:
    - java
    - springmvc
---


表单在 web 页面上无处不在，有些表单可能很复杂，大部分表单里的输入项都会对应后端一个对象里的一个属性。  
SpringMVC 可以自动将表单值转换成对象！而且能转换很复杂的对象！！  
这边我就不写那些基本的表单绑定了。  
这里我想写工作中遇到的一个情况，就是想转换成一个 List 对象，并且这个对象里面有属性也是 List 的。  


```java

public class ProjectDO{

  //其他属性就省略了
  //团队成员
  private List<ProjectTeamInfoDO> teaminfoList;

}


public class ProjectTeamInfoDO {
  //学历信息
  private List<ProjectCollegeDO> college;

}

public class ProjectCollegeDO{
    // 专业
  	private String major;
  	// 学校
  	private String school;
  	// 学位
  	private String diploma;
}

```

解释下意思，项目类里有个属性存放团队成员信息的，肯定有多个成员对吧，所以是 List 类型。每个团队成员又有学历信息，那学历也有很多，本科、硕士、博士啊之类的，所以也是 List 类型的。  

这个对像已经算是复杂了，那应该怎样让它自动绑定起来呢？  
说难不难，说简单也不简单。

先说说为什么简单，我们来看看怎么写这个表单才能自动绑定上去。

```html
<form action="/createdProject.htm" >

//第一个团队成员 ，第一个学历  
<input type="text" name="teaminfoList[0].college[0].major">
<input type="text" name="teaminfoList[0].college[0].school">
<input type="text" name="teaminfoList[0].college[0].diploma">

//第一个团队成员 ，第二个学历  
<input type="text" name="teaminfoList[0].college[1].major">
<input type="text" name="teaminfoList[0].college[1].school">
<input type="text" name="teaminfoList[0].college[1].diploma">

//第二个团队成员 ，第一个学历  
<input type="text" name="teaminfoList[1].college[0].major">
<input type="text" name="teaminfoList[1].college[0].school">
<input type="text" name="teaminfoList[1].college[0].diploma">

</form>

```

```java
@RequestMapping("/createdProject.htm")
public String createdProjects(ProjectDO Project){
  //project 就是绑定后的对象  
}

```


看，form 结构是不是很简单，其实就是一个二维数组。name 值带上对应的下标就行。

那又难在哪呢？  
难在下标的生成，团队成员人数是未知的，不知道这个数组应该有多长，所以下标都是后面用 js 动态生成的。

有个问题需要注意的是绑定 List 类型的时候，会根据 input name 值下标来确定 List 长度。  
比如  

```html
     <input type="text" name="teaminfoList[2].college[0].major">
```

那 teaminfoList 的长度就是 3 了。前面两个 0 和 1 都为 null。  
中间或者前面空掉的数字都会是 null ，所以后端接收到绑定后的对象要注意移除那些空对象。如果前端能保证下标连续的话就最好了。
