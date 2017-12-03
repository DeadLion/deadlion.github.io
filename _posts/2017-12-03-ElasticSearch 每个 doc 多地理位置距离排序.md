---
title: 'ElasticSearch 每个 doc 多地理位置距离排序'
layout: post
subtitle: "ElasticSearch,geo_point,doc,经纬度"
tags:
  - ElasticSearch

---

ElasticSearch 同一条记录中包含多个经纬度做距离排序问题。
问题背景，一个教练有多个练车场地，给学员推荐教练的时候，教练列表会显示距离，产品经理希望展示的距离是教练离学员最近的那一个。
或者我再举一个类似的例子，一家连锁小吃店，有很多个分店，但是店名都是同一个不会显示xx分店之类的，那在外卖列表里按距离排序的时候只显示最近的那个店距离。不知道这样说是不是好理解一些。

因为我之前没用过 ElasticSearch，我来的时候这个项目已经在用 es 搜索了，看之前的代码直接上手的，以前一直都是一条数据 里存一个经纬度，而且我看官方文档也没有特别说明多个。索性这次把 ElasticSearch 的文档通读一遍，没准能发现点啥。这一看还真的发现了点东西，在看到多值字段排序的时候提到，如果一个字段是个拥有多值的集合，对于数字和日期可以从多个值中取出一个来进行排序，可以用 min、max、avg 和 sum 这些模式。我就联想到距离排序是不是也支持模式。立即 google 了下，发现还真的可以。我先是在 github 上看到这个 [issue](https://github.com/elastic/elasticsearch/issues/1846) 提到了这个问题。这个 issue 还是 2012 年的，es 的早期版本。那个时候有人是用自定义脚本来实现这个功能的，好在这么多年过去了，官方已经实现了这个功能。

那现在来说下需要注意的问题：

 1. 属性 type 必须声明为 geo_point，不能是动态 mapping。
  至于你是用字符串存经纬度还是数组形式存，没有关系,比如我用的是字符串数组来存的多个经纬度，当然也不能随意格式存，ES 有自己规范的，还有种是以数组的形式存。
  ```
          "location": [
            "31.174,121.440",
            "31.200,121.470"
        ]
  ```

 2. sortMode 为 min。
 这个就看你们自己的需求了，这里用 min，就是让取距离最小的那个参与排序。
 地址位置的排序支持 sort_mode 中的 min,max 和 avg。

 3. 取距离值.
如果你们只有距离排序的话，就比较简单了，直接从 sortValues 里取值就行了，但是我们的需求比较复杂，有哪些排序不确定，所有 sortValues 里有哪些值根本就不知道，所以可以在最后再加一个距离排序，这样我只要取 sortValues 里最后一个值就知道距离了。

```
    "sortValues": [
        4.672153894499351,
        900000,
        4.672153894499351
    ],
```

参考：

[support geo sorting on multiple geo point values per doc](https://github.com/elastic/elasticsearch/issues/1846)  

[Sort](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-sort.html)
