var CONFIG = CONFIG || {
	python_version: 'Python 2.7.9',
	gcc_version: '4.8.2',
	sys_platform: 'linux2',
	username: 'jack',
	ipython: false
};


var ContactInformation = {
	email: {
		showStr: "邮件地址",
		type: "lnk",
		info: "由于gmail的频繁抽风(F**k GFW)，换成了万恶的QQ邮箱",
		value: 'zzh.coder@qq.com'
	},
	weibo: {
		showStr: "微博地址",
		type: "lnk",
		info: "weibo上主要关注了一些大牛的账户，没做什么有意义的微博。",
		value: 'http://weibo.com/zzhcoder'
	},
	github: {
		showStr: "Github",
		type: "lnk",
		info: "自己特别喜欢逛github和分享自己的项目,就跟老婆逛淘宝的感觉一样样的, 发现了好玩的项目就忍不住<strong>偷看</strong>人间的源码。",
		value: 'http://github.com/jack-zh'
	},
	blog: {
		showStr: "博客地址",
		type: "lnk",
		info: "博客，主要记录一些平时忽视的小细节和坑，目前内容不多。",
		value: 'http://link-pub.cn'
	},
	realname: {
		showStr: "真实姓名",
		type: "text",
		value: '张志贺'
	}
};


var AboutMeStr = '***************************************************************************************<br>'+
          '我的网络ID为 jack.z。现在居住地<i class="fa fa-map-marker">武汉</i><br>'+
          '目前是一名pythoner。之前一直用c做嵌入式的网络设备开发。后来因为换工作开始使用python来做web app。<br>'+
          '从此喜欢上了python的简捷,快速和<span class="prettytext">There is only one way to do it</span> 的编程思想。<br>'+
          '目前的技术栈是 python, C, tornado， flask, mongodb， redis， nodejs， golang, mysql, git, linux。网站部署常用的是supervisord+nginx+git<br>'+
          '这个是我的个人网站。当然你可以从<a href="http://github.com/jack-zh" target="_blank">GitHub</a>上面看到我之前写的一些乱七八糟的项目。<br>'+
          '你可以通过邮件联系我 <a href="mailto:zzh.coder@qq.com">zzh.coder#qq.com</a> 或者QQ: 715443050 或者<a target="_blank" href="'+ 'http://github.com/jack-zh' +'">微博</a><br>'+
          '最后你可以试着输入 <span class="prettytext">jack.__doc__</span> 看看这个module有哪些属性和方法以便您更好的了解和使用它<br>'+
          '你可以点击命令输出结果中的任何绿色文字连接。在输入命令的时候如果你想中途退出，请输入Ctrl+D或者Ctrl+C。<br>'+
          '你可以输入&uarr;或者&darr;查看之前输入的命令<br>'+
          '***************************************************************************************<br>'

var InitCommands = [
	"python",
	"import jack",
	"jack.__doc__",
	"exit()"
];

CONFIG.prompt = function(cwd, user) {
    if (CONFIG.ipython){
        return '>>> ';
    }
    else{
    	// CONFIG.ipython = false;
	    return '<span class="user">' + CONFIG.username + '</span><span style="color:#9e65ff;">-> ~ </span>';
	}
};