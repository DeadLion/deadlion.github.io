---
title: 数据库连接池碰到的那些问题
layout: post
subtitle: 'MySQL,Last packet sent to the server,testOnBorrow,connection pool'
tags:
  - mysql
comments:
  - author:
      type: full
      displayName: DeadLion
      url: 'https://github.com/DeadLion'
      picture: 'https://avatars0.githubusercontent.com/u/2594907?v=4&s=73'
    content: test comment
    date: 2018-04-11T08:47:40.972Z

---

项目中一直有一个顽疾，就是数据库连接池这块。现在用的连接池是之前团队自己写的，然后和项目耦合的很紧，没办法直接替换掉，所以一直没动过。下面说问题。


### 流量暴增带来的问题
运营每天早上会向所有用户发送推送，emmmm，标题党那种，一看标题就让人很想点开的那种，所以每天那个时间点的 QPS 会突增，平时大概 200-300 左右，但是那个时间点的峰值 1500-5000 左右。几秒之内突然暴涨 10 倍。  
每到那个时间点超时就很严重，后台日志很多 db connection pool is full。是的，数据库连接池直接打满了，那个时候所有服务加一块配了大概 3k 多的连接数，但是实际上其他项目组日活比我们大很多，他们占用连接数才 1k 不到。他们是 PHP 服务，抛开技术上的差异，按道理也不应该差这么多的。  
后来排查发现最小连接数配的很小，只有 20。那就意味着高峰期流量突增的时候，要一个一个的创建连接，直到最大值 1000。创建连接的过程相对来说算是比较耗时的过程了，在急需使用的时候还要一个一个去创建，这里明显可以优化下，后来直接把最小连接数配置成和最大值一致。  
在业务上也想办法优化了下，将早上的推送分批进行，现在采用的方案就是将 Android 和 IOS 设备的推送分开并间隔五分钟。  
后来超时问题基本解决了。

对于大型互联网公司来说这种情况可能会比较常见，他们也有成熟的应对方案，总结概括起来无非就是削峰、限流、扩容。  
削峰就是想办法将峰值摊平，比如我们采用分开推送的方案就是，之前我们查看流量图的时候只有一个很高的峰，但是现在就变成两个峰了。
![](/media/images/20180305182931.jpg)


### 无效连接问题
上面的问题解决之后但是又有新的问题了，我们发现高峰期偶尔会出现大量 `Last packet sent to the server was X ms ago` 这种错误。这是因为创建连接之后很久也没有使用过，MySQL Server 主动断开了连接，所以服务再次使用这些断开的连接就出现这种错误了。  
数据库连接默认有效时间是 8 个小时，MySQL Server 配置项 `wait_timeout` 可以修改。为什么会出现这种情况呢？根本原因是因为连接池的容器使用的是栈 `private Stack<Connection> AvailableConn = new Stack();` ，栈的特点就是先进后出，那么很有可能并发量不够的情况下，栈底的连接无法被使用到，一直在使用栈顶的连接。    
临时解决方案就是将最小连接数缩小一点，让所有的连接都有可能使用到。情况确实好了很多！  
我们还尝试过一个方案，就是将 `wait_timeout` 修改成 24 小时，然后服务每天凌晨的时候依次重启，这样来保证连接的有效性。不过后来觉得这个方案太不 “优雅” 了，过渡了一段时间后废弃掉了。  
再后来我想办法把那个 jar 包反编译出来，直接在源码上修改，将栈改成了队列。`private Queue<Connection> AvailableConn = new ConcurrentLinkedQueue<Connection>();` ，从根本上解决问题。

### 连接有效性检测
上面修改了队列之后确实好了很多，但是偶尔还是会有零星出现几个类似的错误。因为情况很少，而且配合 dubbo 的重试机制，倒也不会影响到业务。但是还可以再继续优化彻底解决这个问题吗？我在 MySQL 官网上找到了相关的 Troubleshooting。  
[Troubleshooting Connector/J Applications](https://dev.mysql.com/doc/connector-j/5.1/en/connector-j-usagenotes-troubleshooting.html) 找到 14.11: What should you do if you receive error messages similar to the following: “Communications link failure – Last packet sent to the server was X ms ago”?  
里面有很多推荐方案，其中有一个方法就是主动去检测连接是否有效，怎么检测呢？  
主动发起一个查询： `Ensure connections are valid when used from the connection pool. Use a query that starts with /* ping */ to execute a lightweight ping instead of full query. Note, the syntax of the ping needs to be exactly as specified here.` 在查询前加上  `/* ping */` ，比如   `/* ping */ SELECT 1`。号称是轻量级 ping，应该耗时比较短吧。  

其实在 `Connector/J` ConnectionImpl 里已经实现 ping 方法了。为啥上面 Troubleshooting 里不直接推荐使用 ping 方法呢？很好奇。

```java
public void ping() throws SQLException {
    this.pingInternal(true, 0);
}
```

知名项目 `Druid` 里如果配置了 `testOnBorrow testOnReturn testWhileIdle` 都会检测连接的有效性。 在 `MySqlValidConnectionChecker` 类里面，调用了 ping 的核心方法 `pingInternal`。如果无法使用该方法的话就会执行查询 `SELECT 1`。

```java
public MySqlValidConnectionChecker(){
    try {
        clazz = Utils.loadClass("com.mysql.jdbc.MySQLConnection");
        if (clazz == null) {
            clazz = Utils.loadClass("com.mysql.cj.jdbc.ConnectionImpl");
        }

        //通过反射获取 pingInternal 方法
        if (clazz != null) {
            ping = clazz.getMethod("pingInternal", boolean.class, int.class);
        }

        if (ping != null) {
            usePingMethod = true;
        }
    } catch (Exception e) {
        LOG.warn("Cannot resolve com.mysql.jdbc.Connection.ping method.  Will use 'SELECT 1' instead.", e);
    }

    configFromProperties(System.getProperties());
}
```

我在项目里也测试了使用 `ping` 方法来做检测，但是确实性能方面会大打折扣！有兴趣的朋友可以做个详细的性能测试。

### 关于 autoReconnect
有个配置项可以设置自动重连，在 jdbc_url 里加上参数就能启用，但是官方是不推荐这么用的，因为会产生 session 状态以及数据一致性问题。官方推荐是通过捕获异常来处理。

Note
Use of the autoReconnect option is not recommended because there is no safe method of reconnecting to the MySQL server without risking some corruption of the connection state or database state information. Instead, use a connection pool, which will enable your application to connect to the MySQL server using an available connection from the pool. The autoReconnect facility is deprecated, and may be removed in a future release.

Troubleshooting 14.12 Why does Connector/J not reconnect to MySQL and re-issue the statement after a communication failure, instead of throwing an Exception, even though I use the autoReconnect connection string option? 也做了详细的说明。

### 其他参考链接
- [Ping a MySQL server](https://stackoverflow.com/questions/4569956/ping-a-mysql-server)
- [MySQL Connector/J 5.1 Developer Guide Troubleshooting Connector/J Applications](https://dev.mysql.com/doc/connector-j/5.1/en/connector-j-usagenotes-troubleshooting.html)
- [Driver/Datasource Class Names, URL Syntax and Configuration Properties for Connector/J](https://dev.mysql.com/doc/connector-j/5.1/en/connector-j-reference-configuration-properties.html)
- [Solving a “communications link failure” with JDBC and MySQL [duplicate]
](https://stackoverflow.com/questions/6865538/solving-a-communications-link-failure-with-jdbc-and-mysql)
