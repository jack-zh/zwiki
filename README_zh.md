# zwiki

##### 以wiki的名义构建的简易易扩展的个人记事本(Blog?)
##### 学习Flask的成果
=====

+ [中文](https://github.com/jack-zh/zwiki/blob/master/README_zh.md)
+ [English](https://github.com/jack-zh/zwiki/blob/master/README.md)

## version

  0.3.0

## 开始

#### 1. 获取代码

    git clone https://github.com/jack-zh/zwiki.git

#### 2. 安装zwiki

    cd zwiki
    pip install -r requirements.txt

#### 3. 运行zwiki

    gunicorn app:app

#### 4. 打开浏览器
    地址：http://localhost:8000/

#### 5. 页面说明
 + `zWiki`是页面的主Title
 + `Home`是主页面，在程序开始的时候设置
 + `Index`页面是所有的wiki列表
 + `Tags`是标签列表
 + `Search`是全局搜索入口
 + `New Page` 新添加页面配置

### 6. About的配置页面在`/static/jsterm/config.js`
 
## 设置

#### 启动设定端口和IP:
    
    gunicorn -b ip:port app:app

比如：

    gunicorn -b 8.8.8.8:6789 app:app

当然，你可以后台运行它

    nohup gunicorn -b 8.8.8.8:6789 app:app &


#### config.py配置说明：

`content/config.py`是一个全局配置文件，程序启动的时候优先寻找`content/user_config.py`文件，当查找不到得时候会加载`config.py`。即我们可以配置自己的`user_config.py`,也可以在`confif.py`的基础上更改。

    # encoding: utf-8

    SECRET_KEY='JACK_ZH'         # session key
    TITLE='zWiki'                # wiki title

    CONTENT_DIR="markdown"       # wiki(blog) save file dir
    USER_CONFIG_DIR="content"    # ...
    PRIVATE=False                # logout edit del ... flag
    SHOWPRIVATE=False            # logout show flag
    UPLOAD_DIR="./static/upload"

    # from 畅言： http://changyan.sohu.com/install/code/pc
    SOHUCS_APPID = "cyrE7gU83"
    SOHUCS_CONF = "prod_1f3b1e3a86d5da44e0295ab22fb27033"

+ `SECRET_KEY` 一个session key字符串,建议你在部署你的`wiki`时生成自己的key
+ `TITLE='zWiki'` 标题，更改成你要现实的文字， 比如`Jack'Blog`
+ `CONTENT_DIR="markdown"` 我们添加的`md`文件的保存路径，此配置的意思是路径在此目录下的"markdown"文件夹内
+ `USER_CONFIG_DIR="content"` 配置文件加载路径 建议不加更改
+ `PRIVATE=False` 当更改我们的wiki时是否需要验证
+ `SHOWPRIVATE=False` 当查看我们的wiki时，是否需要验证
+ `SOHUCS_APPID = "cyrE7gU83"` 畅言的注册后的appid
+ `SOHUCS_CONF = "prod_1f3b1e3a86d5da44e0295ab22fb27033"` 畅言注册后的conf

#### users.py配置说明：

`content/users.py`是一个全局配置文件，程序启动的时候优先寻找`content/user_users.py`文件，当查找不到得时候会加载`users.py`。即我们可以配置自己的`user_users.py`,也可以在`users.py`的基础上更改。这个配置文件是用来配置登录信息的。可以支持多用户。

    {
      "jack": {
        "active": true,
        "authentication_method": "cleartext",
        "password": "123456",
        "authenticated": false,
        "roles": "admin"
      }
    }

#### About 信息配置

位置：/static/jsterm/config.js

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
##### About的ls gimp cat配置

位置：/static/jsterm/sample.js

    {
        "name": "~",
        "type": "dir",
        "contents": [
          {
             "name": "jack",
             "type": "img",
             "contents": "/static/jsterm/jack.png",
             "caption": "Yes! me!"
          },
          {
             "name": "Technology",
             "type": "dir",
             "contents": [
                {
                   "name": "Python",
                   "type": "text",
                   "contents": "Tornado, Flask, PyQt, 科学计算"
                },
                {
                   "name": "NodeJS",
                   "type": "text",
                   "contents": "NodeJS express plus plus..."
                },
                {
                   "name": "Linux-C",
                   "type": "text",
                   "contents": "Linux-C开发，网络开发，PowerPC，驱动开发"
                },
                {
                   "name": "Golang",
                   "type": "text",
                   "contents": "Golang深度学习者"
                },
                {
                   "name": "FrontEnd",
                   "type": "text",
                   "contents": "初学者，水深，设计"
                },
                {
                   "name": "OPS",
                   "type": "dir",
                   "contents": [
                      {
                         "name": "Docker",
                         "type": "text",
                         "contents": "Docker"
                      },
                      {
                         "name": "OpenStack",
                         "type": "text",
                         "contents": "OpenStack"
                      }
                   ]
                }
             ]
          },
          {
             "name": "Live",
             "type": "dir",
             "contents": [
                {
                   "name": "Self",
                   "type": "text",
                   "contents": "身高：180 cm\n体重：80 kg\n职业：程序员\n爱好：篮球\n运动：骑行\n居住：武汉\n籍贯：内蒙古\n民族：蒙古族"
                },
                {
                   "name": "Family",
                   "type": "dir",
                   "contents": [
                      {
                         "name": "Daughter",
                         "type": "text",
                         "contents": "我爱你，么么哒"
                      },
                      {
                         "name": "Mother",
                         "type": "text",
                         "contents": "我爱你，么么哒"
                      },
                      {
                         "name": "Wife",
                         "type": "text",
                         "contents": "我爱你，么么哒"
                      }
                   ]
                }
             ]
          }
        ]
    }


+ `"jack"` 用户名 
+ `password` 密码
+ 其他字段 保留字段，暂时不需要更改

## LICENSE

    MIT

## Example online

[http://demo.zwiki.link-pub.cn](http://demo.zwiki.link-pub.cn)
