---
title: '根据手机号查询用户地区'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720160823
tags:
    - java
---

运营那边经常要求向特定地区的用户发送短信，但是注册的时候地区是非必填信息，那怎么办呢？  
好在用户注册都是用手机号的，那根据手机号查询归属地不就是了么？虽然可能有些人换了地区但是不换手机号，但是毕竟是少数嘛。大致还是能反映出地区的。  
查询号码归属地 api 来自 360 。是我从网页上扒下来的，后来试了试没有啥限制就直接拿来用了，查询过程中不知道为啥有些会查询失败，重新执行一遍就又好了。    
核心方法就是向接口发送 get 请求，然后会返回 json 数据，转换成对象，下面是对应的 Java 对象。

```java
public class QueryPhoneDO
{
    private int code;

    private Data data;

    public void setCode(int code){
        this.code = code;
    }
    public int getCode(){
        return this.code;
    }
    public void setData(Data data){
        this.data = data;
    }
    public Data getData(){
        return this.data;
    }
}

public class Data
{
   private String province;

   private String city;

   private String sp;

   public void setProvince(String province){
       this.province = province;
   }
   public String getProvince(){
       return this.province;
   }
   public void setCity(String city){
       this.city = city;
   }
   public String getCity(){
       return this.city;
   }
   public void setSp(String sp){
       this.sp = sp;
   }
   public String getSp(){
       return this.sp;
   }
}

```

httpClientManager 是 httpclient 的封装类 ，就是发送带参数的 get 请求，自行替换相关方法。

```java
Map<String, String> map = new HashMap<String, String>(1);

for(String temp:list){
  map.put("number", temp);
  String json = httpClientManager.execGetRequestWithParams("http://cx.shouji.360.cn/phonearea.php", map);
  if (json != null) {
  QueryPhoneDO queryPhoneDO = JsonUtil.getObjectFromJson(json, QueryPhoneDO.class);
    if (queryPhoneDO != null && queryPhoneDO.getCode() == 0) {

      //如果城市为空的话是直辖市，如 北京、上海这种
      if (StringUtils.isBlank(queryPhoneDO.getData().getCity())) {
        // do your business
        log.info(queryPhoneDO.getData().getProvince());
      }else {
        // do your business
        log.info(temp, queryPhoneDO.getData().getCity());
      }
    }else {
      log.error(temp+":"+json);
    }
  }else {
    log.error(temp+":"+json);
  }
}
```

因为我们需要处理的数据不多，总共也就 2w 条左右吧，大概半小时处理完。效率比较低，可以自己优化下。
