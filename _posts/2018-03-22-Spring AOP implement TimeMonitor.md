---
title: 'Spring AOP 结合注解实现方法执行时间统计'
layout: post
subtitle: "Spring AOP,注解,annotation"
tags:
  - aop
  - spring
---

公司有一套模调系统，监控方法的执行时间等一些基本信息。

![](/media/images/20180322180105.jpg)

大概原理就是将监控的数据根据规则组装成一段数据，然后以 udp 的方式发送到模调服务器上，模调服务然后会对数据继续做一些加工，最后就能通过上图的方式展现出来了。PHP 那边很多东西都已经封装好了，使用的话就是在方法开始标记，然后方法结束的时候再计算下执行时间。  
恩，非常不优雅！

虽然我们是公司唯一的 Java 项目，但是感觉模调系统还挺有用的，于是就花了点时间来接入这套模调系统，而且在使用方式上肯定可以做到更优雅！

### 数据上报

首先我们要先搞定数据是如何传输到模调服务器上的。  

```java
public class ModData {

    /**
     * 接口ID
     */
    private int apiId;
    /**
     * 模块ID
     */
    private int moduleId;

    /**
     * 接口是否调用成功
     */
    private boolean success;

    /**
     * 错误码
     */
    private int errorCode;

    /**
     * 被调用的API的IP
     */
    private String apiServerIp;

    /**
     * 接口调用耗时
     */
    private int usedTimeMs;

    /**
     * 当前时间戳，精确到秒
     */
    private int currentTimeSec;
}
```

上面就是具体需要上报的数据了，然后下面根据规则拼接数据然后以 udp 的方式发送到服务器上。

```java
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            DataOutputStream dos = new DataOutputStream(baos);

            dos.writeInt(data.getApiId());
            dos.writeInt(data.getModuleId());
            dos.writeByte(data.isSuccess() ? 1 : 0);
            dos.writeInt(data.getErrorCode());

            //apiServerIp是允许为空的
            String apiIp = data.getApiServerIp();

            if (apiIp == null || apiIp.isEmpty()) {
                dos.writeInt(0);
            } else {
                dos.write(ipToBytes(apiIp));
            }

            dos.writeInt(data.getUsedTimeMs());
            dos.writeInt(data.getCurrentTimeSec());

            byte[] b = baos.toByteArray();
            DatagramPacket sendPacket = new DatagramPacket(b, b.length, InetAddress.getByName(serverIp), 9903);
            client.send(sendPacket);
```

写完赶紧测试了下，恩，模调系统中已经有数据了。


### 实现统计方法执行时间
普通方法就是和他们一样在每个需要监控的方法开头标记，然后最后计算时间。在 Java 里可以通过 Spring AOP 来很优雅的实现这个需求，我们可以声明一个注解，然后在需要监控的方法上加上这个注解就 OK 了。

#### 先创建一个注解
``` java
@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Monitor {
    String value() default "";

    public String moduleId() default "";

    public String apiId() default "";
}
```

因为每个方法有自己的 id，和所属的模块 id，所以我们要在注解了加上参数。要不然不知道统计的是哪个方法。

#### Spring AOP 

```java
    @Pointcut(value = "@annotation(Monitor)")
    public void annotationProcessor() {
    }
```

先获取切入点，只有添加了 Monitor 的方法才会被代理。

```java
    @Around(value = "annotationProcessor()")
    public Object count(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        ModData data = new ModData();

        //获取注解中的参数
        MethodSignature signature = (MethodSignature) proceedingJoinPoint.getSignature();
        Monitor monitor = signature.getMethod().getAnnotation(Monitor.class);
        data.setModuleId(Integer.parseInt(monitor.moduleId()));
        data.setApiId(Integer.parseInt(monitor.apiId()));

        data.setCurrentTimeSec((int) (System.currentTimeMillis() / 1000));

        boolean excuteResult = true;

        Object result = null;
        long start = System.currentTimeMillis();
        try {
            result = proceedingJoinPoint.proceed();
        } catch (Exception e) {
            e.printStackTrace();
            excuteResult = false;
        }
        data.setSuccess(excuteResult);
        long end = System.currentTimeMillis();
        data.setUsedTimeMs((int) (end-start));

        //上报数据
        sendData(data);
        
        return result;
    }
```

#### 最后使用

```java
    @Monitor(moduleId = "0",apiId = "1")
    public String testMethod() {
        return "test";
    }
```
在方法上添加注解和参数就行了，是不是很简单，当然这只是一个最初的版本，其实还有很多可以优化的地方。