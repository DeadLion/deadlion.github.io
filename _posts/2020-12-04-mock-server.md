---
title: '简易 mock-server 服务搭建'
layout: post
subtitle: "test, 压测,桩,mock-server"
tags:
  - java
---

#### 背景

最近在评估各个系统的性能指标，所以需要进行压测。微服务系统肯定有很多接口依赖，有内部能力服务，外部接口之类的。为了方便压测需要对这些依赖接口进行 mock，模拟响应报文，我们大部分都是 http json 格式的接口。一开始在网上找有没有现成的工具，倒是看到了美团技术团队的一篇 blog ，还是挺有参考意义的，大公司就是大公司，还专门做了个管理端页面。反正是没找到那种拿来即用的工具，那就干脆自己做一个吧。

#### 核心需求

自定义配置 uri、配置响应报文、配置延迟时间、热更新。


#### 元数据对象 

```
public class MockData {
    String uri;
    long sleepTime;
    JSONObject data;
}
```

#### 概要设计
创建一个全局拦截器，然后获取请求 uri ，和配置的 uri 做匹配，匹配上的话就当前线程延迟 sleepTime，最终将 data 返回。

考虑到实际情况都是需要返回成功状态的数据，所以不考虑去精确匹配一些 header 字段和 httpMethod。那只要上面三个字段配置就足够了。

因为压测只是临时数据也没有啥持久化的需求，就直接用配置中心 apollo 来保存配置数据了，正好也方便做热更新。

#### 拦截器核心代码  

```
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        response.setContentType("application/json; charset=UTF-8");
        String uri = request.getRequestURI();
       //(String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE); //
        if (map.keySet().contains(uri)) {
            MockData mockData = map.get(uri);
            Thread.sleep(mockData.getSleepTime());
            response.getWriter().println(map.get(uri).getData().toJSONString());
            response.flushBuffer();
            return false;
        }
        return true;
    }
```

#### apollo 监听器

```
    @ApolloConfigChangeListener(interestedKeys = "mockData")
    public void onChange(ConfigChangeEvent changeEvent) {
        coreInterceptor.setMap(converData(JSON.parseArray(changeEvent.getChange("mockData").getNewValue(), MockData.class)));
    }
```


apollo 配置中有个 key 为 mockData ，value 为 MockData List JsonString，读取的时候直接转换成 map。

```
    private Map<String, MockData> converData(List<MockData> mockData) {
        return mockData.stream().collect(Collectors.toMap(MockData::getUri, MockData -> MockData));
    }
```

#### 拦截器配置

最后记得把拦截器添加到 WebMvcConfigurer 中。  

```
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        coreInterceptor.setMap(converData(mockDataList));
        InterceptorRegistration registration = registry.addInterceptor(coreInterceptor);
        registration.addPathPatterns("/**");
    }
```

这样一个简单的 mock-server 就完成啦。

性能嘛，跟你的 sleepTime 配置有很大关系，如果 sleep 100ms，单实例支撑上千并发还是挺简简单单。

#### 改进项

1.建议使用 webflux 异步响应，性能还有进一步提升。  
2.对于参数在 uri 中的情况可能会出现匹配不上的情况，例如 /student/get/{uid} ，因为项目中没有 @RequestMapping，所以用 request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE) 这种方式无效，建议用正则匹配。  
3.可能有些场景中会需要动态参数，比如说创建订单希望每次返回的订单 id 都是不同的，可以使用内置占位符，然后返回前替换。

参考文章：[Mock Server实践](https://tech.meituan.com/2015/10/19/mock-server-in-action.html)


#### 其他方案
后来发现 [easy-mock](https://github.com/easy-mock/easy-mock) 也是能满足要求的。这个前端开发人员可能更了解，初衷是为了方便前端开发人员的，而且功能更加丰富。

不过 easy-mock 法案对于使用了注册中心的服务就不支持了，各有利弊吧。