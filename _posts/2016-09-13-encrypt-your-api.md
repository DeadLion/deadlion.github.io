---
title: ' 给接口加密'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720160913
tags:
    - other
    - security
---

restful 风格接口大行其道，大家现在用的也都差不多，我们只用了 post 一种方式。  
之前公司接口没有做任何的安全校验，也就是说如果别人知道了接口地址，正确的传参就能返回结果。  
下载个 app ，然后开个代理，所有接口、参数列表都能抓取到。如果有人想做些坏事的话，这就太简单了。

所以考虑给接口加密。  
综合考虑后，得出下面的方案。

  * 请求端
  * 将请求的参数和约定的秘钥做一次 HMAC-MD5 得到 sign。
  * 将 sign 放到 http 请求的 header 里。


  * 服务端
  * 过滤器拦截请求，取出请求的参数， header 中的 sign。
  * 将请求的参数加上秘钥做 HMAC-MD5 得到 sign。
  * 将 header 中的 sign 和计算出来的 sign 比较，相同则正确，否则抛出 401。

看到这可能会有人有疑问为啥不用拦截器？  
我一开始也是这么想的，但是发现一个坑爹的情况，就是在拦截器里读取不到 body，要不然就是报错。  
那是因为 springmvc 已经读取过了，大家都知道 springmvc 里有个不错的功能就是数据绑定，有兴趣的话可以看看 springmvc HttpMessageConverter 相关代码。    

具体原因是：
流对应的是数据，数据放在内存中，有的是部分放在内存中。read 一次标记一次当前位置（mark position），第二次read就从标记位置继续读（从内存中copy）数据。 所以这就是为什么读了一次第二次是空了。 怎么让它不为空呢？只要inputstream 中的pos 变成0就可以重写读取当前内存中的数据，但很遗憾，没找到有修改pos 的api。[转自这个问题里面的答案](http://www.oschina.net/question/2341924_2139436)

后来看到了[这篇文章](http://www.myjavarecipes.com/tag/java-java-lang-illegalstateexception-getreader-has-already-been-called-for-this-request-servlets/),这哥们也说想要对 request body 数据做些处理，但是发现无法读取两次。然后就用了 request 包装类来处理。我最终的实现办法也是基于这篇文章的。

还有关于 MultiReadHttpServletRequest 包装类缓存 request ，让 request 能够读取多次的办法来自这个 [StackOverFlow](http://stackoverflow.com/questions/10210645/http-servlet-request-lose-params-from-post-body-after-read-it-once)


## 请求端

```java
// 请求端自己封装的 httpclient
// obj 是请求的参数，最终会转成 json 串
public <T> String execPostRequestWithSign(String uri, T obj) {
		HttpPost request = new HttpPost(uri);
		addContentType(request, JsonContentType);

		String json = "";
		if(obj != null ){
			json = JsonUtil.getJsonFromObject(obj);
		}

    // json 串加 privateCode （私钥） 得到 sign
		if (json != null) {
			String sign = Md5Util.getHmacMD5(json, privateCode);
			request.addHeader("sign",sign);
		}

  //...
}  	
```

## 服务端

RequestWrapperFilter 过滤器

```java
public class RequestWrapperFilter implements Filter {

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		// TODO Auto-generated method stub

	}

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		try {
			MultiReadHttpServletRequest requestWrapper = new MultiReadHttpServletRequest((HttpServletRequest) request);
			chain.doFilter(requestWrapper,response);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub

	}
}

```

MultiReadHttpServletRequest 包装类

```java
public class MultiReadHttpServletRequest extends HttpServletRequestWrapper {

	Logger logger = LoggerFactory.getLogger(getClass());

	private ByteArrayOutputStream cachedBytes;

	private static final String privateCode = "YEjdO34*6)&2G";

	public MultiReadHttpServletRequest(HttpServletRequest request) throws Exception {
		super(request);


		String bodyString = IOUtils.toString(this.getInputStream());

		String requestSign = request.getHeader("sign");

		if (StringUtils.isNotBlank(bodyString) && StringUtils.isNotBlank(requestSign)) {

			String sign = Md5Util.getHmacMD5(bodyString, privateCode);
			if (!sign.equals(requestSign)) {
				logger.error("sign error,bodystring:", bodyString);
				throw new AuthRequestRuntimeException("sign error");
			}

		}else {
			throw new AuthRequestRuntimeException("sign and request body couldn't be null");
		}


	}


	  @Override
	  public ServletInputStream getInputStream() throws IOException {
	    if (cachedBytes == null)
	      cacheInputStream();

	      return new CachedServletInputStream();
	  }

	  @Override
	  public BufferedReader getReader() throws IOException{
	    return new BufferedReader(new InputStreamReader(getInputStream()));
	  }

	  private void cacheInputStream() throws IOException {
	    /* Cache the inputstream in order to read it multiple times. For
	     * convenience, I use apache.commons IOUtils
	     */
	    cachedBytes = new ByteArrayOutputStream();
	    IOUtils.copy(super.getInputStream(), cachedBytes);
	  }

	  /* An inputstream which reads the cached request body */
	  public class CachedServletInputStream extends ServletInputStream {
	    private ByteArrayInputStream input;

	    public CachedServletInputStream() {
	      /* create a new input stream from the cached request body */
	      input = new ByteArrayInputStream(cachedBytes.toByteArray());
	    }

	    @Override
	    public int read() throws IOException {
	      return input.read();
	    }

		@Override
		public boolean isFinished() {
			// TODO Auto-generated method stub
			return false;
		}

		@Override
		public boolean isReady() {
			// TODO Auto-generated method stub
			return false;
		}

		@Override
		public void setReadListener(ReadListener readListener) {
			// TODO Auto-generated method stub

		}
	  }
}

```

web.xml

```xml
<filter>
<filter-name>RequestWrapperFilter</filter-name>
<filter-class>com.xxxxx.service.servlet.RequestWrapperFilter</filter-class>
</filter>
<filter-mapping>
<filter-name>RequestWrapperFilter</filter-name>
<url-pattern>/v2/*</url-pattern>
</filter-mapping>
```

## 优点

大大的提升了安全性，接口再也不是裸的了。即使抓包抓到了接口抓到了请求参数，没有秘钥你也无法请求到其他数据。  
实现简单，不用改太多的东西，对业务基本无影响。

## 缺点

sign 只绑定了请求的参数，其实最好还要把接口地址绑定上去，要不然同样参数请求不同的接口，可以用相同的 sign。  
还有个缺点就是无法友好的返回异常，正常来说请求异常了要返回错误信息，但是现在这个样子没有返回结果。  
到时候看看有没有更好的办法。

## 总结  
其实加密方式有很多种，MD5、SHA1、RSA、AES 这几种目前来说是比较常见的。根据自己的要求选择就好。  
考虑到平滑升级可以用 api 版本来过渡下，就是在 url 中加一个版本字段（像这样 `/v2/getuser/id`）。  
所有接口都升级完之后再把之前的接口停掉。   
将 sign 放到 herader 中是出于处理方便考虑的，最开始想拼接到 request body 中，但是后来觉得放到 header 中会更方便些，不用再截取 request body。  
如果你有更好的方法或者任何建议，欢迎在评论里留言。
