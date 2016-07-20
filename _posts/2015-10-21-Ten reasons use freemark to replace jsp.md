---
title: '[译]使用FreeMarker替换JSP的10个理由'
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720151021
tags:
    - translate
    - java
    - web
---

![](http://blog.stackhunter.com/wp-content/uploads/2014/01/photodune-1927580-webpage-layout-xs-236x300.jpg)

你还在使用 Java 服务器页面（俗称JSP）吗？我曾经也是，但是几年前我抛弃了它们，并且再也没有用过JSP了。JSP 是个很好的概念，但是它却剥夺了 web 开发的乐趣。 对我而言，这些都是小事，比如无法在页面模板上使用单独的文件header.jsp 和 footer.jsp，不能调用表达式语言的方法，在运行时无法合并，重新排列页面的各个部分。所以我转而使用 FreeMarker 模板。FreeMarker 已经存在一段时间了，如果你最近没有关注过 FreeMarker 的话，那这有些建议给你，让你考虑下个 web 应用使用 FreeMarker。

## 1、类加载没有 PermGen 问题

如果你已经开发Java Web应用程序一段时间，那么对于 JVM 的 PermGen 问题可能并不陌生。由于 FreeMarker 模板不编译成类，它们不占用 PermGen 空间，并不需要一个新的类加载器加载。

## 2、模板加载器

直接从数据源加载页面和模板岂不是很好？也许从 CMS 或数据库。也许你只想把它们放在一个地方，可以不重新部署整个应用程序就能更新它们。那么在 JSP 中你是很难做到这一点的，但 FreeMarker 提供的模板加载器就是为了 这个目的。你可以使用内建类或者创建你自己的实现。

*   [ClassTemplateLoader](http://freemarker.org/docs/api/freemarker/cache/ClassTemplateLoader.html)：从classpath中加载模板。
*   [FileTemplateLoader](http://freemarker.org/docs/api/freemarker/cache/FileTemplateLoader.html)：在文件系统中从指定文件夹加载模板。
*   [StringTemplateLoader](http://freemarker.org/docs/api/freemarker/cache/StringTemplateLoader.html)：从一个字符串 Map 中加载模板。
*   [URLTemplateLoader](http://freemarker.org/docs/api/freemarker/cache/URLTemplateLoader.html)：从 URL 中加载模板。 你必须要实现 [getURL](http://freemarker.org/docs/api/freemarker/cache/URLTemplateLoader.html#getURL%28java.lang.String%29) 方法，但应该很容易做到。
*   [WebappTemplateLoader](http://freemarker.org/docs/api/freemarker/cache/WebappTemplateLoader.html)：从 servlet 上下文中加载模板。

FreeMarker 也可以将[多个加载器](http://freemarker.org/docs/api/freemarker/cache/MultiTemplateLoader.html)链在一起形成一个系列模板装载器。我通常使用 WebappTemplateLoader 指向 WEB—INF 下一个内容文件夹。

<pre class="brush: java; gutter: true">Configuration configuration = new Configuration();
configuration.setTemplateLoader(
new WebappTemplateLoader(servletContext, "WEB-INF/content"));

## 3、可以在运行时嵌入模板

FreeMarker 能让你创建真正的模板，而不只是片段 ，还记得 JSP 中的 header 和 footer 吗？FreeMarker 允许你使用一个模板（在本例中为 head.ftl）


    <title>${title}</title>


并将其添加到另一个模板（site.ftl body区域）。

    <html>
    ${body}
    </html>

可以以编程的方式选择哪个模板进入 body 区。还可以添加多个模板一起放入同一区域。甚至可以将字符串值或计算的值放入 body 区域。在 JSP 中试试做到这些。

## 4、没有导入

JSP 要求你导入每个你需要使用的类，就像一个常规的 Java 类一样。FreeMarker 模板，嗯，仅仅是模板。可以被包括在另一个模板中，但目前还不需要导入类。

## 5、支持 JSP 标签

使用 Jsp 的一个理由是有可用性很好的标签库。好消息是 FreeMarker 支持 JSP 标签。坏消息是它们使用 FreeMarker 的语法，不是 JSP 语法。

## 6、表达式语言中的方法调用

除非你的目标是 Servlet 3.0/El 2.2 标准的容器，那么表达式语言中方法调用是不可用的。不是所有人都同意 EL 表达式中方法调用是一件好事，但是当你需要它们的时候，使用 JSP 真的太痛苦了。 但是 FreeMarker 同等对待其中每个引用。

    ${customer.address.country}

    ${customer.getAddress().country}

## 7\. 内置空字符串处理

FreeMarker 和 Jsp 都可以在表达式语言中处理空值，但 FreeMarker 在可用性上更先进一些。

    Invoice Date: ${(customer.invoice.date)!}

感叹号告诉 FreeMarker 对表达式自动检查 null 值和空字符串。如果 customer、invoice 或者 date 中有一个为空值或空字符串，你只会得到标签:

    Invoice Date:

另一个选择是感叹号后包括你的默认值。

    Invoice Date: ${(customer.invoice.date)!'No Invoice Available'}

如果所有值丢失，你会得到:

    Invoice Date: No Invoice Available

请参见[处理缺少的值](http://freemarker.org/docs/dgui_template_exp.html)了解更多细节。

## 8、共享变量

FreeMarker 的共享变量是我最喜欢的“隐藏”功能之一。此功能可以让你设置自动添加到所有模板的值。 例如，可以设置应用程序的名称作为共享变量。

    Configuration configuration = new Configuration();
    configuration.setSharedVariable("app", "StackHunter");

然后像任何其他变量一样访问它。

    App: ${app}

在过去使用共享变量一般引用资源包 然后使用像 ${i18n.resourceBundle.key} 这样的表达式来获取值。

    ${i18n.countries.CA}
    ${i18n.countries['CA']}
    ${i18n.countries[countryCode]}

上面这些行都引用 countries_en.properties 资源包内的 key “CA”对应的值。你需要执行自己的 TemplateHashModel，然后将其添加为一个共享变量来实现这一目标。

## 9、支持 JSON

FreeMarker 内置 JSON 支持。 比方说你有以下的 JSON 存储到变量命名 user 的字符串中。

    { 'firstName': 'John', 'lastName': 'Smith', 'age': 25, 'address': { 'streetAddress': '21 2nd Street', 'city': 'New York', 'state': 'NY', 'postalCode': 10021 }}

使用 ?eval 将从字符串转换为一个 JSON 对象，然后像其他数据一样在表达式中使用。

    <#assign user = user?eval>
    User: ${user.firstName}, ${user.address.city}

## 10、不只是为了 Web 开发

最后<span style="color: #ff0000;">，</span>与 JSP 不同的是FreeMarker 模板可以在 servlet 容器之外使用。可以使用它们来生成电子邮件、 配置文件、 XML 映射等。你甚至可以使用它们来生成 web 页 并将它们保存在服务器端的缓存中。 请在下一个 web 项目尝试使用 FreeMarker把 web 开发的乐趣给找回来。

原文链接： [stackhunter](http://blog.stackhunter.com/2014/01/17/10-reasons-to-replace-your-jsps-with-freemarker-templates/) 翻译： [ImportNew.com](http://www.importnew.com) - [光光头去打酱油](http://www.importnew.com/author/zhongjianno1)  
译文链接： [http://www.importnew.com/16944.html](http://www.importnew.com/16944.html)  
[ <span style="color:#ff0000">**转载请保留原文出处、译者和译文链接。**</span>]
