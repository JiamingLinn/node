##网络爬虫，主文件:clawster.js
>代码示例
```js
var Clawster = require('./clawster.js);

var c = new Clawster({
	debug: true,
	saveDir:'./m',
	startUrl: 'http://video.weibo.com/show?fid=1034:ca9a2f993b409c8266b34a61df0e9b1f',
	strongFilter: null,
	weakFilter: null,
	urlHandler:null,
	maxUrlSize: 120
});
c.crawl();
```
>test.js
```
参数：
	debug:
	    boolean ，是否开启调试模式
	saveDir:
	    string ，爬到的页面保存路径
	startUrl: 
	    string， 开爬的页面，标准url，包括协议
	strongFilter: nul
	    RegExp, url重过滤器。不匹配不下载
	weakFilter: null,
	    RegExp,url轻过滤器。不匹配，不爬取该内容中的url
	maxUrlSize: 120
	    int，url长度限制
```

