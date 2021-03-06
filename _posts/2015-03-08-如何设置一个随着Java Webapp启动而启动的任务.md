---
title: '如何设置一个随着Java Webapp启动而启动的任务'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef7aee05242
tags:
    - java
    - web
---


最近在做一个微信公众号的项目，微信中要经常去获取一个access_token。这个access_token是有两个小时的有效期的，而且每天请求的次数是有限制的。
那么我们最好写一个类让它定时自动去获取，我们需要用到access_token的时候呢就直接去问这个类要，不再去关心过期的问题。
那这个类应该怎么写呢，而且要怎么让它随着我们的网站启动而启动然后一直运行下去呢。

抛开这个微信项目而言，随着web app启动而启动在很多场景都是能用到的，像数据同步啊，为一些任务初始化啊等等。
ok，那我们现在进入正题！


webapp在启动的时候会去加载ServletContext -> Listener -> Filter -> Servlet
将我们的任务放在上述的这些过程中不就跟着启动了么

ServletContext有个监听器类ServletContextListener
我们可以通过它达到我们的目的

先实现我们的任务

    public class TokenThread implements Runnable { 
    private static Logger log = LoggerFactory .getLogger (TokenThread . class); 
    // 第三方用户唯一凭证 
    public static String appid = PropertiesUtil .getProperty ("weixin.appid" );
    // 第三方用户唯一凭证密钥 
    public static String appsecret = PropertiesUtil .getProperty ("weixin.appsecret" );  
    public static AccessToken accessToken = null; 
 
    public void run () { 
        while (true ) { 
            try { 
                accessToken = WeixinUtil . getAccessToken( appid, appsecret ); 
                if ( null != accessToken ) { 
                    log. info( "获取access_token成功，有效时长{}秒 token:{}", accessToken.getExpiresIn(), accessToken .getToken()); 
                    // 休眠7000秒 
                    Thread. sleep ((accessToken .getExpiresIn() - 200 ) * 1000 ); 
                } else { 
                    // 如果access_token为null，60秒后再获取 
                    Thread. sleep (60 * 1000 ); 
                } 
            } catch (InterruptedException e) { 
                try { 
                    Thread. sleep (60 * 1000 ); 
                } catch (InterruptedException e1) { 
                    log. error( "{}" , e1 ); 
                } 
                log. error( "{}" , e ); 
            } 
        } 
    }
    }
     
   

Method1
-------

在contextInitialized 方法中启动我们的任务

    public class MyServletContentListenter implements ServletContextListener {

      @Override
      public void contextDestroyed (ServletContextEvent arg0 ) {
            // TODO Auto-generated method stub

     }
     
      @Override
      public void contextInitialized (ServletContextEvent arg0 ) {
           
           Thread thread = new Thread( new TokenThread());
           thread.run();
     }
     }
最后在web.xml中注册我们的ServletContextListener

    < listener>
           <listener-class >MyServletContentListenter  </listener-class >
    </listener>

这样就OK了


Method2
-------

我们也可以写一个Servlet来达到这样的目的，和上面十分的类似。只不过一个是注册监听器，一个是注册Servlet。

上面的方法比较原生，现在都流行使用框架，那我们再来说一个和spring框架结合的方法。
这个方法非常的简单，看代码：

    <bean id="myTokenThread" class="service.util.TokenThread">
	</bean>

	<bean id="tokenThread" class="java.lang.Thread" init-method="start">
		<constructor-arg ref="myTokenThread" />
	</bean>
我们只要在配置文件中注册两个bean就ok了！






Method3  
-------

####update at 2015-11-30####


熟悉 spring 的人应该知道常用的一些注解 @component 注册组件 bean
其实这些 bean 也是在启动的时候初始化的，所以可以将线程放在构造函数中。

下面直接贴代码了

```
@Repository
public class StartWithServer {

	Logger logger = Logger.getLogger(getClass());
	
	@Autowired
	private MessageService messageService;
	@Autowired
	private ProjectChangeNotify projectChangeNotify;

	public StartWithServer() {

		Runnable deal = new DealMeassage();
		new Thread(deal).start();
	}

	public class DealMeassage implements Runnable {

		@Override
		public void run() {
			while (true) {
				try {
					TimeUnit.SECONDS.sleep(60);
//					logger.info("----------------------popMessage----------------------");
//					messageService.getMnsClient();
					Message ms = messageService.popMessage();
					if (null != ms) {
						//logger.info(ms.getMessageBodyAsString());
						projectChangeNotify.postMessage(JsonUtil.getObjectFromJson(ms.getMessageBodyAsString(), ProjectDO.class));
						messageService.delMessage(ms);
					}
				} catch (Exception e) {
					logger.warn("消息处理线程异常："+e.getMessage());
					//logger.info(messageService.client.isOpen());
					//messageService.getMnsClient();
				}
			}

		}

	}

}
```

@repository  @controller  @service 等注解和 @component 基本都是一致的，不过根据名字也知道具体是用在什么地方的，就不细说了，如果不知道用啥注解就直接用 @component 好了。


其实还有很多方法都可以达到我们的目的，上面介绍了几个比较简单的方法。
Spring本身也自带了任务执行框架、还有quartz 任务调度框架也能实现，但是配置稍微麻烦些，一般用在定时任务上，像每天同步数据什么之类的。


