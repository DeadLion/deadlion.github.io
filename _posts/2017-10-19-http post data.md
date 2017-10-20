---
title: 'Java servlet 对于 POST 数据处理的一些细节'
layout: post
guid: 'urn:uuid:b87da13a-a4dd-402f-b06a-cef720171019'
tags:
  - java
  - http

---

最近和其他项目组合作，需要调试 http 接口签名。我先简单介绍下他们的验签规则。

get 方法：直接将 url 中的参数串取出来（queryString）。再将 sign 字段和值截掉。将剩下的字符串 MD5 一次，再加上约定的 key，再次 MD5 得到最终的签名，和 sign 值比对。  
举个例子：

```
https://xxxx.com/xx?a=1&b=2&sign=xxxx&d=3
那么就是 a=1&b=2&sign=xxxx&d=3 把中间的 sign 取出，剩下 a=1&b=2&&d=3 先进行 MD5 算一次（中间的 & 号还留着）。
```

post 方法：url 后面还是会跟上参数串，前面的步骤和 get 方法完全一样，但是 post data 中多了一份 queryString，他们后端是 PHP，直接读取输入流数据。类似 Java 中 request.getInputStream()。那么就是 url 后面的 queryString 和 post 数据中的一份 queryString，两边分别 MD5 一次，两个值拼接起来 MD5 一次，再加上约定的 key MD5 一次，得到最终的 sign 进行比对。  
同样举上面的例子：

```
https://xxxx.com/xx?a=1&b=2&sign=xxxx&d=3
url 中得到 a=1&b=2&&d=3，
post 数据流中又能得到一份 a=1&b=2&d=3（post data 中没有 sign ，所以不用截，不会多一个 & 号出来），
两个字符串各 MD5 一次，再拼接起来 MD5，再拼上 key 再次 MD5。
```

就不吐槽这种 xx 方法了，只说问题。

get 方式我们能正常处理，但是 post 方法就遇到问题了。  
因为在 request 输入流中读不到数据，后来查资料发现，在 servlet 规范中，会自动将输入流中的数据放到 parameterMap 中去。然后输入流中就读取不到数据了。queryString 是没有排序的，所以无法通过 parameterMap 获取各项值自己拼接。而且由于 post 的 url 中也和 get 一样带了 querySring，所以 parameterMap 中一个key 会有两个同样的值。略无语，实在想不明白当初设计的人是怎么考虑的。

[完整版
JSR 340: Java Servlet 3.1 Specification](https://jcp.org/en/jsr/detail?id=340)

```
3.1 HTTP Protocol Parameters
Request parameters for the servlet are the strings sent by the client to a servlet
container as part of its request. When the request is an HttpServletRequest object,
and conditions set out in ”When Parameters Are Available” on page 24 are met, the
container populates the parameters from the URI query string and POST-ed data.
The parameters are stored as a set of name-value pairs. Multiple parameter values
can exist for any given parameter name. The following methods of the
ServletRequest interface are available to access parameters:
■ getParameter
■ getParameterNames
■ getParameterValues
■ getParameterMap
The getParameterValues method returns an array of String objects containing all
the parameter values associated with a parameter name. The value returned from
the getParameter method must be the first value in the array of String objects
returned by getParameterValues. The getParameterMap method returns a
java.util.Map of the parameter of the request, which contains names as keys and
parameter values as map values.
Data from the query string and the post body are aggregated into the request
parameter set. Query string data is presented before post body data. For example, if
a request is made with a query string of a=hello and a post body of a=goodbye&a=
world, the resulting parameter set would be ordered a=(hello, goodbye, world).3-24 Java Servlet Specification • April 2013
Path parameters that are part of a GET request (as defined by HTTP 1.1) are not
exposed by these APIs. They must be parsed from the String values returned by the
getRequestURI method or the getPathInfo method.
3.1.1 When Parameters Are Available
The following are the conditions that must be met before post form data will be
populated to the parameter set:
1. The request is an HTTP or HTTPS request.
2. The HTTP method is POST.
3. The content type is application/x-www-form-urlencoded.
4. The servlet has made an initial call of any of the getParameter family of methods
on the request object.
If the conditions are not met and the post form data is not included in the parameter
set, the post data must still be available to the servlet via the request object’s input
stream. If the conditions are met, post form data will no longer be available for
reading directly from the request object’s input stream.
```

大概意思就是符合以下几个条件时，post form data 无法通过直接读取 request 对象的输入流来获取。

* 该请求是一个 HTTP 或 HTTPS 请求。
* HTTP 方法是 POST。
* 内容类型是 application/x-www-form-urlencoded。
* 该 servlet 已经对请求对象的任意 getParameter 方法进行了初始调用。

通过使用 Postman 测试发现，Content-Type 为 application/x-www-form-urlencoded 和 form-data 时都无法读取到输入流。

不过 form-data 方式，post data 会比较奇葩，会自动加上一些其他的数据。

```
POST /init HTTP/1.1
Host: localhost:8888
Cache-Control: no-cache
Postman-Token: 446e6fa9-7d87-bab4-e225-4854d976659f
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="a"

b
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

最终测试下来发现只有 raw 方式可以正常获取到输入流数据，也就是没有 Content-Type 项的时候。或者 Content-Type: text/plain 等类似的类型也能正常读取。

```
POST /init HTTP/1.1
Host: localhost:8888
Cache-Control: no-cache
Postman-Token: 893c7785-2bf5-caa5-76ca-9f58a7156fe3

a=b
```

由于我是创建了 springboot 项目来测试的，使用了 springmvc ，所以会自动处理参数，无法满足第四个条件，有兴趣的朋友可以创建原始的 servlet 项目来进行测试。
