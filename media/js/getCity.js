$(document).ready(function(){



var cityJsonData = {
    "安徽省": [
        {
            "cityId": "340800",
            "cityName": "安庆市"
        },
        {
            "cityId": "340300",
            "cityName": "蚌埠市"
        },
        {
            "cityId": "341600",
            "cityName": "亳州市"
        },
        {
            "cityId": "340181",
            "cityName": "巢湖市"
        },
        {
            "cityId": "341700",
            "cityName": "池州市"
        },
        {
            "cityId": "341100",
            "cityName": "滁州市"
        },
        {
            "cityId": "341200",
            "cityName": "阜阳市"
        },
        {
            "cityId": "340100",
            "cityName": "合肥市"
        },
        {
            "cityId": "340600",
            "cityName": "淮北市"
        },
        {
            "cityId": "340400",
            "cityName": "淮南市"
        },
        {
            "cityId": "341000",
            "cityName": "黄山市"
        },
        {
            "cityId": "341500",
            "cityName": "六安市"
        },
        {
            "cityId": "340500",
            "cityName": "马鞍山市"
        },
        {
            "cityId": "340700",
            "cityName": "铜陵市"
        },
        {
            "cityId": "340200",
            "cityName": "芜湖市"
        },
        {
            "cityId": "341300",
            "cityName": "宿州市"
        },
        {
            "cityId": "341800",
            "cityName": "宣城市"
        }
    ],
    "北京市": [
        {
            "cityId": "110000",
            "cityName": "北京市"
        }
    ],
    "福建省": [
        {
            "cityId": "350100",
            "cityName": "福州市"
        },
        {
            "cityId": "350800",
            "cityName": "龙岩市"
        },
        {
            "cityId": "350700",
            "cityName": "南平市"
        },
        {
            "cityId": "350900",
            "cityName": "宁德市"
        },
        {
            "cityId": "350300",
            "cityName": "莆田市"
        },
        {
            "cityId": "350500",
            "cityName": "泉州市"
        },
        {
            "cityId": "350400",
            "cityName": "三明市"
        },
        {
            "cityId": "350200",
            "cityName": "厦门市"
        },
        {
            "cityId": "350600",
            "cityName": "漳州市"
        }
    ],
    "甘肃省": [
        {
            "cityId": "620400",
            "cityName": "白银市"
        },
        {
            "cityId": "621100",
            "cityName": "定西市"
        },
        {
            "cityId": "623000",
            "cityName": "甘南州"
        },
        {
            "cityId": "620200",
            "cityName": "嘉峪关市"
        },
        {
            "cityId": "620300",
            "cityName": "金昌市"
        },
        {
            "cityId": "620900",
            "cityName": "酒泉市"
        },
        {
            "cityId": "620100",
            "cityName": "兰州市"
        },
        {
            "cityId": "622900",
            "cityName": "临夏州"
        },
        {
            "cityId": "621200",
            "cityName": "陇南市"
        },
        {
            "cityId": "620800",
            "cityName": "平凉市"
        },
        {
            "cityId": "621000",
            "cityName": "庆阳市"
        },
        {
            "cityId": "620500",
            "cityName": "天水市"
        },
        {
            "cityId": "620600",
            "cityName": "武威市"
        },
        {
            "cityId": "620700",
            "cityName": "张掖市"
        }
    ],
    "广东省": [
        {
            "cityId": "445100",
            "cityName": "潮州市"
        },
        {
            "cityId": "441900",
            "cityName": "东莞市"
        },
        {
            "cityId": "440600",
            "cityName": "佛山市"
        },
        {
            "cityId": "440100",
            "cityName": "广州市"
        },
        {
            "cityId": "441600",
            "cityName": "河源市"
        },
        {
            "cityId": "441300",
            "cityName": "惠州市"
        },
        {
            "cityId": "440700",
            "cityName": "江门市"
        },
        {
            "cityId": "445200",
            "cityName": "揭阳市"
        },
        {
            "cityId": "440900",
            "cityName": "茂名市"
        },
        {
            "cityId": "441400",
            "cityName": "梅州市"
        },
        {
            "cityId": "441800",
            "cityName": "清远市"
        },
        {
            "cityId": "440500",
            "cityName": "汕头市"
        },
        {
            "cityId": "441500",
            "cityName": "汕尾市"
        },
        {
            "cityId": "440200",
            "cityName": "韶关市"
        },
        {
            "cityId": "440300",
            "cityName": "深圳市"
        },
        {
            "cityId": "441700",
            "cityName": "阳江市"
        },
        {
            "cityId": "445300",
            "cityName": "云浮市"
        },
        {
            "cityId": "440800",
            "cityName": "湛江市"
        },
        {
            "cityId": "441200",
            "cityName": "肇庆市"
        },
        {
            "cityId": "442000",
            "cityName": "中山市"
        },
        {
            "cityId": "440400",
            "cityName": "珠海市"
        }
    ],
    "广西": [
        {
            "cityId": "451000",
            "cityName": "百色市"
        },
        {
            "cityId": "450500",
            "cityName": "北海市"
        },
        {
            "cityId": "451400",
            "cityName": "崇左市"
        },
        {
            "cityId": "450600",
            "cityName": "防城港市"
        },
        {
            "cityId": "450800",
            "cityName": "贵港市"
        },
        {
            "cityId": "450300",
            "cityName": "桂林市"
        },
        {
            "cityId": "451200",
            "cityName": "河池市"
        },
        {
            "cityId": "451100",
            "cityName": "贺州市"
        },
        {
            "cityId": "451300",
            "cityName": "来宾市"
        },
        {
            "cityId": "450200",
            "cityName": "柳州市"
        },
        {
            "cityId": "450100",
            "cityName": "南宁市"
        },
        {
            "cityId": "450700",
            "cityName": "钦州市"
        },
        {
            "cityId": "450400",
            "cityName": "梧州市"
        },
        {
            "cityId": "450900",
            "cityName": "玉林市"
        }
    ],
    "贵州省": [
        {
            "cityId": "520400",
            "cityName": "安顺市"
        },
        {
            "cityId": "520500",
            "cityName": "毕节地区"
        },
        {
            "cityId": "520100",
            "cityName": "贵阳市"
        },
        {
            "cityId": "520200",
            "cityName": "六盘水市"
        },
        {
            "cityId": "522600",
            "cityName": "黔东南州"
        },
        {
            "cityId": "522700",
            "cityName": "黔南州"
        },
        {
            "cityId": "522300",
            "cityName": "黔西南州"
        },
        {
            "cityId": "520600",
            "cityName": "铜仁地区"
        },
        {
            "cityId": "520300",
            "cityName": "遵义市"
        }
    ],
    "海南省": [
        {
            "cityId": "460100",
            "cityName": "海口市"
        },
        {
            "cityId": "460200",
            "cityName": "三亚市"
        }
    ],
    "河北省": [
        {
            "cityId": "130600",
            "cityName": "保定市"
        },
        {
            "cityId": "130900",
            "cityName": "沧州市"
        },
        {
            "cityId": "130800",
            "cityName": "承德市"
        },
        {
            "cityId": "130400",
            "cityName": "邯郸市"
        },
        {
            "cityId": "131100",
            "cityName": "衡水市"
        },
        {
            "cityId": "131000",
            "cityName": "廊坊市"
        },
        {
            "cityId": "130300",
            "cityName": "秦皇岛市"
        },
        {
            "cityId": "130100",
            "cityName": "石家庄市"
        },
        {
            "cityId": "130200",
            "cityName": "唐山市"
        },
        {
            "cityId": "130500",
            "cityName": "邢台市"
        },
        {
            "cityId": "130700",
            "cityName": "张家口市"
        }
    ],
    "河南省": [
        {
            "cityId": "410500",
            "cityName": "安阳市"
        },
        {
            "cityId": "410600",
            "cityName": "鹤壁市"
        },
        {
            "cityId": "410800",
            "cityName": "焦作市"
        },
        {
            "cityId": "410200",
            "cityName": "开封市"
        },
        {
            "cityId": "410300",
            "cityName": "洛阳市"
        },
        {
            "cityId": "411100",
            "cityName": "漯河市"
        },
        {
            "cityId": "411300",
            "cityName": "南阳市"
        },
        {
            "cityId": "410400",
            "cityName": "平顶山市"
        },
        {
            "cityId": "410900",
            "cityName": "濮阳市"
        },
        {
            "cityId": "411200",
            "cityName": "三门峡市"
        },
        {
            "cityId": "411400",
            "cityName": "商丘市"
        },
        {
            "cityId": "410700",
            "cityName": "新乡市"
        },
        {
            "cityId": "411500",
            "cityName": "信阳市"
        },
        {
            "cityId": "411000",
            "cityName": "许昌市"
        },
        {
            "cityId": "410100",
            "cityName": "郑州市"
        },
        {
            "cityId": "411600",
            "cityName": "周口市"
        },
        {
            "cityId": "411700",
            "cityName": "驻马店市"
        }
    ],
    "黑龙江省": [
        {
            "cityId": "230600",
            "cityName": "大庆市"
        },
        {
            "cityId": "232700",
            "cityName": "大兴安岭地区"
        },
        {
            "cityId": "230100",
            "cityName": "哈尔滨市"
        },
        {
            "cityId": "230400",
            "cityName": "鹤岗市"
        },
        {
            "cityId": "231100",
            "cityName": "黑河市"
        },
        {
            "cityId": "230300",
            "cityName": "鸡西市"
        },
        {
            "cityId": "230800",
            "cityName": "佳木斯市"
        },
        {
            "cityId": "231000",
            "cityName": "牡丹江市"
        },
        {
            "cityId": "230900",
            "cityName": "七台河市"
        },
        {
            "cityId": "230200",
            "cityName": "齐齐哈尔市"
        },
        {
            "cityId": "230500",
            "cityName": "双鸭山市"
        },
        {
            "cityId": "231200",
            "cityName": "绥化市"
        },
        {
            "cityId": "230700",
            "cityName": "伊春市"
        }
    ],
    "湖北省": [
        {
            "cityId": "420700",
            "cityName": "鄂州市"
        },
        {
            "cityId": "422800",
            "cityName": "恩施州"
        },
        {
            "cityId": "421100",
            "cityName": "黄冈市"
        },
        {
            "cityId": "420200",
            "cityName": "黄石市"
        },
        {
            "cityId": "420800",
            "cityName": "荆门市"
        },
        {
            "cityId": "421000",
            "cityName": "荆州市"
        },
        {
            "cityId": "420300",
            "cityName": "十堰市"
        },
        {
            "cityId": "421300",
            "cityName": "随州市"
        },
        {
            "cityId": "420100",
            "cityName": "武汉市"
        },
        {
            "cityId": "421200",
            "cityName": "咸宁市"
        },
        {
            "cityId": "420600",
            "cityName": "襄阳市"
        },
        {
            "cityId": "420900",
            "cityName": "孝感市"
        },
        {
            "cityId": "420500",
            "cityName": "宜昌市"
        }
    ],
    "湖南省": [
        {
            "cityId": "430700",
            "cityName": "常德市"
        },
        {
            "cityId": "431000",
            "cityName": "郴州市"
        },
        {
            "cityId": "430400",
            "cityName": "衡阳市"
        },
        {
            "cityId": "431200",
            "cityName": "怀化市"
        },
        {
            "cityId": "433101",
            "cityName": "吉首市"
        },
        {
            "cityId": "431300",
            "cityName": "娄底市"
        },
        {
            "cityId": "430500",
            "cityName": "邵阳市"
        },
        {
            "cityId": "430300",
            "cityName": "湘潭市"
        },
        {
            "cityId": "430900",
            "cityName": "益阳市"
        },
        {
            "cityId": "431100",
            "cityName": "永州市"
        },
        {
            "cityId": "430600",
            "cityName": "岳阳市"
        },
        {
            "cityId": "430800",
            "cityName": "张家界市"
        },
        {
            "cityId": "430100",
            "cityName": "长沙市"
        },
        {
            "cityId": "430200",
            "cityName": "株洲市"
        }
    ],
    "吉林省": [
        {
            "cityId": "220800",
            "cityName": "白城市"
        },
        {
            "cityId": "220600",
            "cityName": "白山市"
        },
        {
            "cityId": "220200",
            "cityName": "吉林市"
        },
        {
            "cityId": "220400",
            "cityName": "辽源市"
        },
        {
            "cityId": "220300",
            "cityName": "四平市"
        },
        {
            "cityId": "220700",
            "cityName": "松原市"
        },
        {
            "cityId": "220500",
            "cityName": "通化市"
        },
        {
            "cityId": "222400",
            "cityName": "延边州"
        },
        {
            "cityId": "220100",
            "cityName": "长春市"
        }
    ],
    "江苏省": [
        {
            "cityId": "320400",
            "cityName": "常州市"
        },
        {
            "cityId": "320800",
            "cityName": "淮安市"
        },
        {
            "cityId": "320700",
            "cityName": "连云港市"
        },
        {
            "cityId": "320100",
            "cityName": "南京市"
        },
        {
            "cityId": "320600",
            "cityName": "南通市"
        },
        {
            "cityId": "320500",
            "cityName": "苏州市"
        },
        {
            "cityId": "321200",
            "cityName": "泰州市"
        },
        {
            "cityId": "320200",
            "cityName": "无锡市"
        },
        {
            "cityId": "321300",
            "cityName": "宿迁市"
        },
        {
            "cityId": "320300",
            "cityName": "徐州市"
        },
        {
            "cityId": "320900",
            "cityName": "盐城市"
        },
        {
            "cityId": "321000",
            "cityName": "扬州市"
        },
        {
            "cityId": "321100",
            "cityName": "镇江市"
        }
    ],
    "江西省": [
        {
            "cityId": "361000",
            "cityName": "抚州市"
        },
        {
            "cityId": "360700",
            "cityName": "赣州市"
        },
        {
            "cityId": "360800",
            "cityName": "吉安市"
        },
        {
            "cityId": "360200",
            "cityName": "景德镇市"
        },
        {
            "cityId": "360400",
            "cityName": "九江市"
        },
        {
            "cityId": "360100",
            "cityName": "南昌市"
        },
        {
            "cityId": "360300",
            "cityName": "萍乡市"
        },
        {
            "cityId": "361100",
            "cityName": "上饶市"
        },
        {
            "cityId": "360500",
            "cityName": "新余市"
        },
        {
            "cityId": "360900",
            "cityName": "宜春市"
        },
        {
            "cityId": "360600",
            "cityName": "鹰谭市"
        }
    ],
    "辽宁省": [
        {
            "cityId": "210300",
            "cityName": "鞍山市"
        },
        {
            "cityId": "210500",
            "cityName": "本溪市"
        },
        {
            "cityId": "211300",
            "cityName": "朝阳市"
        },
        {
            "cityId": "210200",
            "cityName": "大连市"
        },
        {
            "cityId": "210600",
            "cityName": "丹东市"
        },
        {
            "cityId": "210400",
            "cityName": "抚顺市"
        },
        {
            "cityId": "210900",
            "cityName": "阜新市"
        },
        {
            "cityId": "211400",
            "cityName": "葫芦岛市"
        },
        {
            "cityId": "210700",
            "cityName": "锦州市"
        },
        {
            "cityId": "211000",
            "cityName": "辽阳市"
        },
        {
            "cityId": "211100",
            "cityName": "盘锦市"
        },
        {
            "cityId": "210100",
            "cityName": "沈阳市"
        },
        {
            "cityId": "211200",
            "cityName": "铁岭市"
        },
        {
            "cityId": "210800",
            "cityName": "营口市"
        }
    ],
    "内蒙古": [
        {
            "cityId": "152900",
            "cityName": "阿拉善盟"
        },
        {
            "cityId": "150800",
            "cityName": "巴彦淖尔市"
        },
        {
            "cityId": "150200",
            "cityName": "包头市"
        },
        {
            "cityId": "150400",
            "cityName": "赤峰市"
        },
        {
            "cityId": "150600",
            "cityName": "鄂尔多斯市"
        },
        {
            "cityId": "150100",
            "cityName": "呼和浩特市"
        },
        {
            "cityId": "150700",
            "cityName": "呼伦贝尔市"
        },
        {
            "cityId": "150500",
            "cityName": "通辽市"
        },
        {
            "cityId": "150300",
            "cityName": "乌海市"
        },
        {
            "cityId": "150900",
            "cityName": "乌兰察布市"
        },
        {
            "cityId": "152500",
            "cityName": "锡林郭勒盟"
        },
        {
            "cityId": "152200",
            "cityName": "兴安盟"
        }
    ],
    "宁夏": [
        {
            "cityId": "640400",
            "cityName": "固原市"
        },
        {
            "cityId": "640200",
            "cityName": "石嘴山市"
        },
        {
            "cityId": "640300",
            "cityName": "吴忠市"
        },
        {
            "cityId": "640100",
            "cityName": "银川市"
        },
        {
            "cityId": "640500",
            "cityName": "中卫市"
        }
    ],
    "青海省": [
        {
            "cityId": "632600",
            "cityName": "果洛藏族自治州"
        },
        {
            "cityId": "632200",
            "cityName": "海北藏族自治州"
        },
        {
            "cityId": "632100",
            "cityName": "海东地区"
        },
        {
            "cityId": "632500",
            "cityName": "海南藏族自治州"
        },
        {
            "cityId": "632800",
            "cityName": "海西蒙古族藏族自治州"
        },
        {
            "cityId": "632300",
            "cityName": "黄南藏族自治州"
        },
        {
            "cityId": "630100",
            "cityName": "西宁市"
        },
        {
            "cityId": "632700",
            "cityName": "玉树藏族自治州"
        }
    ],
    "山东省": [
        {
            "cityId": "371600",
            "cityName": "滨州市"
        },
        {
            "cityId": "371400",
            "cityName": "德州市"
        },
        {
            "cityId": "370500",
            "cityName": "东营市"
        },
        {
            "cityId": "371700",
            "cityName": "菏泽市"
        },
        {
            "cityId": "370100",
            "cityName": "济南市"
        },
        {
            "cityId": "370800",
            "cityName": "济宁市"
        },
        {
            "cityId": "371200",
            "cityName": "莱芜市"
        },
        {
            "cityId": "371500",
            "cityName": "聊城市"
        },
        {
            "cityId": "371300",
            "cityName": "临沂市"
        },
        {
            "cityId": "370200",
            "cityName": "青岛市"
        },
        {
            "cityId": "371100",
            "cityName": "日照市"
        },
        {
            "cityId": "370900",
            "cityName": "泰安市"
        },
        {
            "cityId": "371000",
            "cityName": "威海市"
        },
        {
            "cityId": "370700",
            "cityName": "潍坊市"
        },
        {
            "cityId": "370600",
            "cityName": "烟台市"
        },
        {
            "cityId": "370400",
            "cityName": "枣庄市"
        },
        {
            "cityId": "370300",
            "cityName": "淄博市"
        }
    ],
    "山西省": [
        {
            "cityId": "140200",
            "cityName": "大同市"
        },
        {
            "cityId": "140500",
            "cityName": "晋城市"
        },
        {
            "cityId": "140700",
            "cityName": "晋中市"
        },
        {
            "cityId": "141000",
            "cityName": "临汾市"
        },
        {
            "cityId": "141100",
            "cityName": "吕梁市"
        },
        {
            "cityId": "140600",
            "cityName": "朔州市"
        },
        {
            "cityId": "140100",
            "cityName": "太原市"
        },
        {
            "cityId": "140900",
            "cityName": "忻州市"
        },
        {
            "cityId": "140300",
            "cityName": "阳泉市"
        },
        {
            "cityId": "140800",
            "cityName": "运城市"
        },
        {
            "cityId": "140400",
            "cityName": "长治市"
        }
    ],
    "陕西省": [
        {
            "cityId": "610900",
            "cityName": "安康市"
        },
        {
            "cityId": "610300",
            "cityName": "宝鸡市"
        },
        {
            "cityId": "610700",
            "cityName": "汉中市"
        },
        {
            "cityId": "611000",
            "cityName": "商洛市"
        },
        {
            "cityId": "610200",
            "cityName": "铜川市"
        },
        {
            "cityId": "610500",
            "cityName": "渭南市"
        },
        {
            "cityId": "610100",
            "cityName": "西安市"
        },
        {
            "cityId": "610400",
            "cityName": "咸阳市"
        },
        {
            "cityId": "610600",
            "cityName": "延安市"
        },
        {
            "cityId": "610800",
            "cityName": "榆林市"
        }
    ],
    "上海市": [
        {
            "cityId": "310000",
            "cityName": "上海市"
        }
    ],
    "四川省": [
        {
            "cityId": "513200",
            "cityName": "阿坝州"
        },
        {
            "cityId": "511900",
            "cityName": "巴中市"
        },
        {
            "cityId": "510100",
            "cityName": "成都市"
        },
        {
            "cityId": "511700",
            "cityName": "达州市"
        },
        {
            "cityId": "510600",
            "cityName": "德阳市"
        },
        {
            "cityId": "513300",
            "cityName": "甘孜州"
        },
        {
            "cityId": "511600",
            "cityName": "广安市"
        },
        {
            "cityId": "510800",
            "cityName": "广元市"
        },
        {
            "cityId": "511100",
            "cityName": "乐山市"
        },
        {
            "cityId": "513400",
            "cityName": "凉山州"
        },
        {
            "cityId": "510500",
            "cityName": "泸州市"
        },
        {
            "cityId": "511400",
            "cityName": "眉山市"
        },
        {
            "cityId": "510700",
            "cityName": "绵阳市"
        },
        {
            "cityId": "511300",
            "cityName": "南充市"
        },
        {
            "cityId": "511000",
            "cityName": "内江市"
        },
        {
            "cityId": "510400",
            "cityName": "攀枝花市"
        },
        {
            "cityId": "510900",
            "cityName": "遂宁市"
        },
        {
            "cityId": "511800",
            "cityName": "雅安市"
        },
        {
            "cityId": "511500",
            "cityName": "宜宾市"
        },
        {
            "cityId": "512000",
            "cityName": "资阳市"
        },
        {
            "cityId": "510300",
            "cityName": "自贡市"
        }
    ],
    "天津市": [
        {
            "cityId": "120000",
            "cityName": "天津市"
        }
    ],
    "西藏": [
        {
            "cityId": "542500",
            "cityName": "阿里地区"
        },
        {
            "cityId": "542100",
            "cityName": "昌都地区"
        },
        {
            "cityId": "540100",
            "cityName": "拉萨市"
        },
        {
            "cityId": "542600",
            "cityName": "林芝地区"
        },
        {
            "cityId": "542400",
            "cityName": "那曲地区"
        },
        {
            "cityId": "542300",
            "cityName": "日喀则地区"
        },
        {
            "cityId": "542200",
            "cityName": "山南地区"
        },
        {
            "cityId": "542300",
            "cityName": "樟木口岸镇"
        }
    ],
    "新疆": [
        {
            "cityId": "652900",
            "cityName": "阿克苏地区"
        },
        {
            "cityId": "654300",
            "cityName": "阿勒泰地区"
        },
        {
            "cityId": "652800",
            "cityName": "巴音郭楞蒙古自治州"
        },
        {
            "cityId": "652700",
            "cityName": "博尔塔拉蒙古自治州"
        },
        {
            "cityId": "652300",
            "cityName": "昌吉回族自治州"
        },
        {
            "cityId": "652200",
            "cityName": "哈密地区"
        },
        {
            "cityId": "653200",
            "cityName": "和田地区"
        },
        {
            "cityId": "653100",
            "cityName": "喀什地区"
        },
        {
            "cityId": "650200",
            "cityName": "克拉玛依市"
        },
        {
            "cityId": "653000",
            "cityName": "克孜勒苏柯尔克孜自治州"
        },
        {
            "cityId": "659001",
            "cityName": "石河子市"
        },
        {
            "cityId": "654200",
            "cityName": "塔城地区"
        },
        {
            "cityId": "652100",
            "cityName": "吐鲁番地区"
        },
        {
            "cityId": "650100",
            "cityName": "乌鲁木齐市"
        },
        {
            "cityId": "654000",
            "cityName": "伊犁哈萨克自治州"
        }
    ],
    "云南省": [
        {
            "cityId": "530500",
            "cityName": "保山市"
        },
        {
            "cityId": "532300",
            "cityName": "楚雄州"
        },
        {
            "cityId": "532900",
            "cityName": "大理州"
        },
        {
            "cityId": "533100",
            "cityName": "德宏州"
        },
        {
            "cityId": "533400",
            "cityName": "迪庆州"
        },
        {
            "cityId": "532500",
            "cityName": "红河州"
        },
        {
            "cityId": "530100",
            "cityName": "昆明市"
        },
        {
            "cityId": "530700",
            "cityName": "丽江市"
        },
        {
            "cityId": "530900",
            "cityName": "临沧市"
        },
        {
            "cityId": "533300",
            "cityName": "怒江州"
        },
        {
            "cityId": "530300",
            "cityName": "曲靖市"
        },
        {
            "cityId": "530800",
            "cityName": "思茅市"
        },
        {
            "cityId": "532600",
            "cityName": "文山州"
        },
        {
            "cityId": "532800",
            "cityName": "西双版纳州"
        },
        {
            "cityId": "530400",
            "cityName": "玉溪市"
        },
        {
            "cityId": "530600",
            "cityName": "昭通市"
        }
    ],
    "浙江省": [
        {
            "cityId": "330100",
            "cityName": "杭州市"
        },
        {
            "cityId": "330500",
            "cityName": "湖州市"
        },
        {
            "cityId": "330400",
            "cityName": "嘉兴市"
        },
        {
            "cityId": "330700",
            "cityName": "金华市"
        },
        {
            "cityId": "331100",
            "cityName": "丽水市"
        },
        {
            "cityId": "330200",
            "cityName": "宁波市"
        },
        {
            "cityId": "330800",
            "cityName": "衢州市"
        },
        {
            "cityId": "330600",
            "cityName": "绍兴市"
        },
        {
            "cityId": "331000",
            "cityName": "台州市"
        },
        {
            "cityId": "330300",
            "cityName": "温州市"
        },
        {
            "cityId": "330900",
            "cityName": "舟山市"
        }
    ],
    "重庆市": [
        {
            "cityId": "500102",
            "cityName": "涪陵市"
        },
        {
            "cityId": "500114",
            "cityName": "黔江市"
        },
        {
            "cityId": "500101",
            "cityName": "万州市"
        },
        {
            "cityId": "500000",
            "cityName": "重庆市"
        }
    ]
};
var oid_province=$("#code_province").val();
if(oid_province==null||oid_province==''){
    $("#code_province").val('上海市');
    changeProvince('上海市');
}else{
    changeProvince(oid_province);
}
var bank_code=$("#oid_bankno").val();
if(bank_code==null||bank_code==''){
 $("#oid_bankno").val('请选择银行');
}


$("#province_list").change(function(){
var content=$(this).val();
changeProvince(content);
})

function changeProvince(proId)
{	var cityJsonObj = eval(cityJsonData);
    var citys = cityJsonObj[proId];
    $("#code_city").val(citys[0].cityName);
    $("#city_id").val(citys[0].cityId);
     $("#city_list option").remove();
    for(var i=0;i<citys.length;i++)
    {
        var city = citys[i];
        var id = city.cityId;
        $("#city_list").append("<option value="+city.cityName+" id="+city.cityId+">"+city.cityName+"</option>");
    }
}

    var data;
    var bankName = $("#bank_name").val();
    if(bankName!=''&&bankName!=null){
            getBankResource();
            $("#bank_name").attr("disabled",false);
    }
   $("#bank_list li").click(function(){
    var bankcode=$(this).attr("id");
    var city = $("#city_id").val();
    $("#code_bank").val(bankcode);
    $("#bank_name").val("");
     $("#loading").show();
    getBankResource(bankcode,city);
    });
     $("#province_list li").click(function(){
     var bankcode= $("#code_bank").val();
     var province=$(this).text();
     var citys = cityJsonData[province];
     var city =citys[0].cityId;
     $("#bank_name").val("");
     $("#loading").show();
    getBankResource(bankcode,city);
    });

});
