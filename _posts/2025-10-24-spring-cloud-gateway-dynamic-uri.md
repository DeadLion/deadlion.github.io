---
title: 'Spring Cloud Gateway 动态修改转发目标 URI'
layout: post
subtitle: "Spring Cloud Gateway,动态路由,URI修改,全局过滤器"
tags:
  - Spring Cloud
  - Java
  - 网关
---

公司有块业务需要升级焕新，老服务推倒，新建所有服务，于是需要根据用户类型去判断转发目的地，新服务还是老服务。

原本计划是直接在 APISIX 网关开发个插件，用 Lua 来实现就行，不过老板不太愿意，所以还是直接用 Java 技术栈。很自然的想到用 Spring Cloud Gateway 来实现，之前没用过，好在逻辑不复杂，用 AI 先实现了个 Demo，让我先了解了下相关概念。

核心的逻辑就是根据一些规则来判断这个请求是去新服务还是去老服务，主要就是改写 request 请求路径。

## 第一个版本：使用 AbstractGatewayFilterFactory

第一个版本通过 `extends AbstractGatewayFilterFactory` 来实现，哐哐一顿写，逻辑都写完了。

跑起来发现始终无法改写地址，会返回 HTTP Code 200，但是没有任何内容。

AI 一顿问，始终无法解决问题，不过发现了些蛛丝马迹：

1. 改写最终请求地址是通过 `GATEWAY_REQUEST_URL_ATTR` 赋值来实现的，后续一些默认的过滤器会帮你替换掉。
2. Response 200 但是无任何内容很符合占位符的效果，配置路由规则的时候 URI 必填，可以使用占位符 `no:op` 来通过编译校验。

问题 1 修复后发现还是一样，猜测 URI 最终没有替换掉。

## 深入源码分析

AI 已经无济于事了，只能 Debug 了，官方提供的默认路由过滤器里有 Rewrite 功能的，但是那个只能适合简单替换规则或者正则替换规则。

不过不妨碍我确认 `GATEWAY_REQUEST_URL_ATTR` 这种方式来修改 URI，所以去看了下源码，确认这种方式是正确的：

```java
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
   ServerHttpRequest req = exchange.getRequest();
   addOriginalRequestUrl(exchange, req.getURI());
   String path = req.getURI().getRawPath();
   String newPath = pattern.matcher(path).replaceAll(replacement);

   ServerHttpRequest request = req.mutate().path(newPath).build();

   exchange.getAttributes().put(GATEWAY_REQUEST_URL_ATTR, request.getURI());

   return chain.filter(exchange.mutate().request(request).build());
}
```

至于为啥没生效，自己猜测大概率应该还是有啥默认过滤器把 URI 给覆盖掉了，导致 `GATEWAY_REQUEST_URL_ATTR` 配置未生效。

## 发现问题：RouteToRequestUrlFilter

Debug 看了下 chain 上有几个 filter，相关 filter 的功能是干啥。

终于发现是 `RouteToRequestUrlFilter` 这个过滤器会直接把路由规则上的 URI 放进 `GATEWAY_REQUEST_URL_ATTR` 导致，我们的赋值被覆盖了。那我控制自定义 Filter 的执行顺序在 `RouteToRequestUrlFilter` 之后就可以了呗。

于是我设置了下 `Ordered`，再测试，还是不行，啥情况啊。

继续 Debug，原来是 `AbstractGatewayFilterFactory` Order 值最大只能到 0 了。

而 `RouteToRequestUrlFilter` 是通过实现全局路由 `GlobalFilter` 来实现的，默认 Order 值 10000。

要想大过 `RouteToRequestUrlFilter` 只能换成全局路由，并设置成最低优先级：

```java
public int getOrder() {
   return Ordered.LOWEST_PRECEDENCE;
}
```

## 最终解决方案

这回执行顺序终于对了，但是发现 AI 都说全局路由不需要配置路由，默认都会执行。实际并不是，如果任何路由都不配置的话，请求直接 404 了。只能添加一个全局路由，这样才对。

```properties
spring.cloud.gateway.routes[0].id=route-mk
spring.cloud.gateway.routes[0].uri=no:op
spring.cloud.gateway.routes[0].predicates[0]=Path=/**
```

## 总结

通过这次踩坑，学到了几个关键点：

1. 使用 `GATEWAY_REQUEST_URL_ATTR` 可以动态修改转发目标 URI
2. `AbstractGatewayFilterFactory` 的 Order 值有限制，最大只能到 0
3. `RouteToRequestUrlFilter` 会覆盖 `GATEWAY_REQUEST_URL_ATTR` 的值
4. 需要使用 `GlobalFilter` 并设置 `Ordered.LOWEST_PRECEDENCE` 来确保执行顺序
5. 即使是全局过滤器，也需要配置一个基础路由规则才能正常工作

Spring Cloud Gateway 的过滤器链机制还是很有意思的，通过合理使用可以实现很多复杂的路由逻辑。