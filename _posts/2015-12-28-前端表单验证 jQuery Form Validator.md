---
title: '前端表单验证 jQuery Form Validator '
layout: post
guid: urn:uuid:b87da13a-a4dd-402f-b06a-cef720151228
tags:
    - web
    - front-end
---


前端外包就是坑，只写样式，js 表单验证啥的都不写，只能由我这个半吊子前端顶上了，啊哈哈哈，好惨。
还是去找找有啥符合要求的“好轮子”用吧。github 上东西太多了，直接搜不好搜呀，然后我就在 [BootCDN](http://www.bootcdn.cn/) 上搜关键字 valid 有很多啊。然后就一个一个看，终于发现一个符合要求的。那就是今天的主角 [jQuery Form Validator](https://github.com/victorjonsson/jQuery-Form-Validator) 。我就是希望能找到一个使用简单方便，能自定义，不要依赖太多其他的框架。也见过很多不错的前端表单验证但是要么就是太重，写法太复杂，要么就是跟太依赖前端框架和 bootstrap 绑定到一块了。还有错误样式无法自定义啊，太丑啊之类的。

## 简介 ##

该项目使用的是 MIT License， [官网](http://www.formvalidator.net/) 上也有介绍和 Demo 。所以很多东西我就不再重复了，可能重点说说我用的时候的一些经验吧。突然想到一个比较致命的缺点，不提供服务器端验证。

## 使用介绍 ##

此框架依赖 jquery 。

```

//data-validation 表示需要使用的规则，required、url 、email、numbers 等等，不同的规则可能会有补充的参数
<input name="email" data-validation="email">

//numbers    data-validation-allowing="range[1;100]"表示只允许输1-100的整数
<input type="text" data-validation="number" data-validation-allowing="range[1;100]">

// custom 自定义验证  可以使用正则来验证
<input type="text" data-validation="custom" data-validation-regexp="^([a-z]+)$">

//js 代码

//最简单的写法
$.validate();

//如果页面上有多个 form ，可以指定验证某一个,默认全部验证
$.validate({
  form : '#registration'
});


```

还有很多其他的就不再详细介绍了，官网上还是蛮详细的。


## 自定义验证器 ##

如果默认的验证规则无法满足你，而且正则又很长的话，就直接修改下源码，给你自己增加一种规则吧。
比如我们需要验证手机号，那我们自己写一个验证手机号的验证规则。


```
   /*
   * Validate cellphone
   */
    $.formUtils.addValidator({
    name: 'cellphone',
    validatorFunction: function (val) {
      //return false;
	  return (/^1[0-9]{10}$/.test(val));
    },
    errorMessage: '',
    errorMessageKey: 'badCellPhone'
  });
```


name 表示你在 data-validation 后跟的名字，像这条规则就是验证 1 开头的 11 位数字。


```
<input name="phone" data-validation="cellphone">
```


errorMessageKey：定义的是你的错误提示语的key

```
/**
     * Error dialogs
     *
     * @var {Object}
     */
    LANG: {
      errorTitle: 'Form submission failed!',
      requiredFields: '此项为必填项',
      badCellPhone: '请输入正确的手机号'
    }
  };
```

## 错误提示语 ##

因为没有中文版的提示语，所以你可以在这汉化一下，或者增加自己的提示语。

关于错误提示语，如果你只是某些输入框不想使用这些默认的话，可以在 input 标签中增加一个自定义的。


```
<input data-validation-error-msg="请输入小于100万的正整数认购金额" data-validation="number" data-validation-allowing="range[1;100]" type="text"  name="money" id="" value=""  placeholder="请输入整数" />
```    


看这条验证规则是 1-100 的整数，你可以根据你们自己的业务需求来自定义这个输入框的错误提示。


## 错误提示样式 ##

关于错误提示样式 ，我觉得这个做的还是蛮不错的。边框变红，错误提示语在输入框的下方出现为红色字。
它是在 input 后面加一个 span 标签，所以基本不会对样式混乱，当然你可以自己修改样式把默认样式覆盖掉。

## 提交按钮联动 ##

现在很多验证都是和提交按钮联动的，就是默认情况下，提交按钮是不可点的，当所有表单验证通过了，提交按钮自动变为可点状态。

说到这不得不提一下这个框架的另外一个好的地方，就是功能模块化。

很多时候我们会把功能代码全都写到一个文件里，然后随着功能越多，文件也越来越大，不方便维护啊。
这个框架就有 module 的概念，你可以自己创建一个 module ，把一些功能封装进去。然后在需要使用的页面上加载它就行了。默认提供了一些 module ：security、date、file 等等，提交按钮联动就用到了其中的一个 module — toggleDisabled。


```

    $.validate({
        modules: 'toggleDisabled', //加载模块 加载多个的话 逗号隔开
        showErrorDialogs: true   // 显示错误提示，false 的话，只会出现输入框边框会变红但是没有错误提示
    });

```


默认提交按钮联动有个问题，就是只能识别 type=submit 的情况，但是我们实际使用情况是大部分都不会使用默认的提交按钮，基本都是异步提交，要么绑定在 a 标签或者是button 上。

然后看了下 toggleDisabled 的源码，发现写的还是蛮清晰的，然后自己动手改了下，使用 class 绑定。


```
 var d = function (a, b) {
            "disabled" == b ? a.find('.validation-submit').addClass("disabled").attr("disabled", "disabled") : a.find('.validation-submit').removeClass("disabled").removeAttr("disabled")
        }, e = !1;

```


```
<input class="disabled validation-submit" disabled="disabled"  type="submit" value="确认并追加认购项目"/>
```

使用的时候只要在元素 class 上增加 validation-submit 就好了。
为此还提交了个 issue ，真是 show 了一把无知。

其实 jquery 可以绑定默认 submit 方法的。
这是人家给我的建议，之前想过应该有的，搜到了在onsubmit 方法中 return false，然而并没有什么暖用，不知道是不是自己写错了。下面的方法试过了确实能 work。

```
$('#my-form').on('submit', function() {
   // do ajax stuff...
   return false; // prevent default behaviour...
});
```

## 参数配置 ##

还有很多可选的配置项


*   **ignore** _[ ]_ – Array with name of inputs that shouldn't become validated.
*   **errorElementClass** _'error'_ – Class that will be applied on elements which value is invalid.
*   **borderColorOnError** _'#b94a48'_ – Border color on inputs which value is invalid (empty string to prevent the change of border color).
*   **errorMessageClass** _'form-error'_ – Class name of div containing all error messages when validation fails. This option is only relevant when having configuration option `errorMessagePosition` set to `top`
*   **validationRuleAttribute** 'data-validation', // name of the attribute holding the validation rules
*   **validationErrorMsgAttribute** 'data-validation-error-msg', // define custom err msg inline with element
*   **errorMessagePosition** 'element', // Can be either "top" or "element" or "custom"
*   **scrollToTopOnError** true
*   **dateFormat** 'yyyy-mm-dd'
*   **addValidClassOnAll** false, // whether or not to apply class="valid" even if the input wasn't validated
*   **decimalSeparator** '.'
*   **inputParentClassOnError** 'has-error', // twitter-bootstrap default class name
*   **inputParentClassOnSuccess** 'has-success', // twitter-bootstrap default class name
*   **validateHiddenInputs** false, // whether or not hidden inputs should be validated


就不再一一解释了，根据自己需要的配置好了。
我就修改了 validateHiddenInputs 这项，因为我们表单上有需要验证 hidden 元素的地方。默认是不会对 hidden 表单进行验证的。

## 验证 select 问题 ##

不知道这算不算一个 bug，input 验证绑定在 keyup 事件上的，input 的验证是实时验证。但是对于 select 来说 keyup 是无效的，选择一个选项触发的是 onchange 事件，那就意味着每次选择 select 后要在其他地方点一下，然后提交按钮才变成可点。

我使用了一个比较傻的方法，就是在 select onchange 事件里对其他的 input blur 一下。

```
 function inputBlur(){
            $('#company').blur();
        }
```

提交了 issue ，有回复的话我会回来跟新下。


## 其他 ##

总之这工具还是很好用的，还有很多功能没用到。
验证回调方法啊之类的，自己去挖掘吧。


## 其他 ##

总之这工具还是很好用的，还有很多功能没用到。
验证回调方法啊之类的，自己去挖掘吧。

## Update ##

2015-12-30  提交的 issue 被改为 Unconfirmed Bug 状态了

2016-01-14  Bug Fixed in next release
