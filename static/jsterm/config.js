var CONFIG = CONFIG || {
	python_version: 'Python 2.7.9',
	gcc_version: '4.8.2',
	sys_platform: 'linux2',
	realname: '张志贺',
	username: 'jack',
	email: 'zzh.coder@qq.com',
	weibo: 'http://weibo.com/zzhcoder',
	github: 'http://github.com/jack-zh',
	blog: 'http://link-pub.cn',
	first: true
};


CONFIG.prompt = function(cwd, user) {
    if (!CONFIG.first){
        return '>>> ';
    }
    else{
    	CONFIG.first = false;
	    return '<span class="user">' + CONFIG.username + '</span><span style="color:#9e65ff;">-> ~ </span>';
	}
};