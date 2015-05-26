---
title: 'Spring Boot 碰到的那些问题'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef7aeee0526
tags:
    - Java
    - Web
---


最近接手了一个别人的项目，用了 Spring Boot。没有仔细的研究过这个玩意，就说说自己碰到的一些问题以及解决法方。

Spring Boot个人感觉比较适合小项目使用，因为里面已经集成好了 java web 容器，直接打包成一个jar文件，就能启动起来。不依赖第三方比如 jetty tomcat等容器。
可以做到0配置，就一个application.properties中配置一些数据库连接等基本信息就行了，没有web.xml。

程序入口就是Application类

``` java
    //不需要配置扫描目录，真正的全自动注入
    @SpringBootApplication // same as @Configuration @EnableAutoConfiguration @ComponentScan
    public class Application extends SpringBootServletInitializer {
    	@Override
	    protected SpringApplicationBuilder configure(
			SpringApplicationBuilder application) {
		return application.sources(Application.class);
	    }

	    public static void main(String[] args) {
	        SpringApplication.run(Application.class, args);
    	}
    }
```

下面就直接说我遇到的问题吧

## 打War包 ##
第一个问题就是希望能打成war包，放到tomcat中和其他应用一起，这样也方便管理。

[官方文档][1]中已经有了说明了

pom.xml中一些关键的配置：
```
        <packaging>war</packaging> 

        <dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-tomcat</artifactId>
			<scope>provided</scope>
		</dependency>
		
		//此插件去掉，要不然package失败
		 <plugin> 
		 <groupId>org.springframework.boot</groupId>                
		 <artifactId>spr ing-boot-maven-plugin</artifactId> 
		 </plugin>
```

## 单元测试 ##
普通项目，我们可以直接加载xml配置文件来测试，Spring Boot没有配置文件怎么测呢?
直接加载Application类作为配置
```
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
public class AppTest {
    @Autowired
	private UserDao userDao;
	
	@Test
	public void testUserDao{
	
	}

}
```
这样就能注入Dao、Service等进行测试了

## 简单定时任务 ##
在之前的项目里经常会有一些定时任务需要做的，能随着 app 启动而启动。以前使用 Quartz 来完成这部分的工作，感觉比较复杂，需要配置 job 、trigger 等等。
Quartz 功能强大无需置疑，但是我只是想启动一个简单的任务罢了，有种杀鸡用牛刀的感觉。
不过在 spring boot 中想实现这一任务非常简单。

其实 spring 自己也有一套任务调度框架，配合注解使用起来非常简单，而且还有一个好处就是不用在头疼 依赖注入问题，因为很多任务都是要跟数据库交互，我们的任务直接写在Service里，然后注入到定时任务中。


```
@Component
public class DayJob {

	@Autowired
	private ReportService reportService;

    //每个小时执行一次
	@Scheduled(cron = "0 0 0/1 * * ?") 
	public void run() {
		reportService.createMerchantUserReport();
	}

}
```
还记得我们之前说过的Application.class么，在Application中使用@EnableScheduling 就支持定时任务了。

```
@SpringBootApplication
@EnableScheduling
public class Application extends SpringBootServletInitializer {

}
```

## properties配置参数 ##
项目中可能需要配置其他的服务，比如说电子邮件服务等等。
比较传统的配置应该是像下面这样


application.properties

```
mail.username=open@exapleo.com
mail.password=psw
mail.host=smtp.mail.com
mail.port=465
```

MailService.class

```
public class MailService {

    @Value("${mail.username}")
	private String username = "World";
    
    ...

}
```

下面让我们来看看正确的姿势是咋样的

```
@ConfigurationProperties(prefix = "mail", ignoreUnknownFields = false)
public class MailService {

	private String username = "World";
	
    ...
    
}
```
直接配置下前缀就行了，后缀名和属性名相同就会自动赋值。是不是很方便！



## 最后 ##
如果后面我遇到了问题我会一直更新下去的。

  [1]: http://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#howto-create-a-deployable-war-file

