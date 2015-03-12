var COMMANDS = COMMANDS || {};

COMMANDS.cat =  function(argv, cb) {
   var filenames = this._terminal.parseArgs(argv).filenames,
       stdout;

   this._terminal.scroll();
   if (!filenames.length) {
      this._terminal.returnHandler = function() {
         stdout = this.stdout();
         if (!stdout)
            return;
         stdout.innerHTML += '<br>' + stdout.innerHTML + '<br>';
         this.scroll();
         this.newStdout();
      }.bind(this._terminal);
      return;
   }
   filenames.forEach(function(filename, i) {
      var entry = this._terminal.getEntry(filename);

      if (!entry)
         this._terminal.write('cat: ' + filename + ': No such file or directory');
      else if (entry.type === 'dir')
         this._terminal.write('cat: ' + filename + ': Is a directory.');
      else
         this._terminal.write(entry.contents);
      if (i !== filenames.length - 1)
         this._terminal.write('<br>');
   }, this);
   cb();
}

COMMANDS.ls = function(argv, cb) {
   var result = this._terminal.parseArgs(argv),
       args = result.args,
       filename = result.filenames[0],
       entry = filename ? this._terminal.getEntry(filename) : this._terminal.cwd,
       maxLen = 0,
       writeEntry;

   writeEntry = function(e, str) {
      this.writeLink(e, str);
      if (args.indexOf('l') > -1) {
         if ('description' in e)
            this.write(' - ' + e.description);
         this.write('<br>');
      } else {
         this.write(Array(maxLen - e.name.length + 2).join('&nbsp') + ' ');
      }
   }.bind(this._terminal);

   if (!entry)
      this._terminal.write('ls: cannot access ' + filename + ': No such file or directory');
   else if (entry.type === 'dir') {
      var dirStr = this._terminal.dirString(entry);
      maxLen = entry.contents.reduce(function(prev, cur) {
         return Math.max(prev, cur.name.length);
      }, 0);

      for (var i in entry.contents) {
         var e = entry.contents[i];
         if (args.indexOf('a') > -1 || e.name[0] !== '.')
            writeEntry(e, dirStr + '/' + e.name);
      }
   } else {
      maxLen = entry.name.length;
      writeEntry(entry, filename);
   }
   cb();
}

COMMANDS.gimp = function(argv, cb) {
   var filename = this._terminal.parseArgs(argv).filenames[0],
       entry,
       imgs;

   if (!filename) {
      this._terminal.write('gimp: please specify an image file.');
      cb();
      return;
   }
   entry = this._terminal.getEntry(filename);
   if (!entry || entry.type !== 'img') {
      this._terminal.write('gimp: file ' + filename + ' is not an image file.');
   } else {
      this._terminal.write('<img src="' + entry.contents + '"/>');
      imgs = this._terminal.div.getElementsByTagName('img');
      imgs[imgs.length - 1].onload = function() {
         this.scroll();
      }.bind(this._terminal);
      if ('caption' in entry)
         this._terminal.write('<br/>' + entry.caption);
   }
   cb();
}

COMMANDS.clear = function(argv, cb) {
   this._terminal.div.innerHTML = '';
   cb();
}

COMMANDS.sudo = function(argv, cb) {
   var count = 0;
   this._terminal.returnHandler = function() {
      if (++count < 3) {
         this.write('<br/>Sorry, try again.<br/>');
         this.write('[sudo] password for ' + this.config.username + ': ');
         this.scroll();
      } else {
         this.write('<br/>sudo: 3 incorrect password attempts');
         cb();
      }
   }.bind(this._terminal);
   this._terminal.write('[sudo] password for ' + this._terminal.config.username + ': ');
   this._terminal.scroll();
}


COMMANDS.python = function(argv, cb) {
   
   this._terminal.config.username = CONFIG.username;
   var myDate = new Date();
   var timestr = myDate.toLocaleDateString() + ' '+myDate.toLocaleTimeString()
   this._terminal.scroll();
   this._terminal.write(
CONFIG.python_version + ' (default, '+ timestr +')<br>'+
'['+ CONFIG.gcc_version +'] on '+ CONFIG.sys_platform +'<br>'+
'Type "import ' + CONFIG.username + '" for more information.');
   cb();
}

COMMANDS.import = function(argv, cb) {
  var modulename = this._terminal.parseArgs(argv).filenames[0];
  if (modulename) {
      if (modulename==CONFIG.username) {
        this._terminal.write(
          '***************************************************************************************<br>'+
          '我的网络ID为'+ CONFIG.username +'。现在居住地<i class="fa fa-map-marker">武汉</i><br>'+
          '目前是一名pythoner。之前一直用c做嵌入式的网络设备开发。后来因为换工作开始使用python来做web app。<br>'+
          '从此喜欢上了python的简捷,快速和<span class="prettytext">There is only one way to do it</span> 的编程思想。<br>'+
          '目前的技术栈是 python, C, tornado， flask, mongodb， redis， nodejs， golang, mysql, git, linux。网站部署常用的是supervisord+nginx+git<br>'+
          '这个是我的个人网站。当然你可以从<a href="'+ CONFIG.github +'" target="_blank">GitHub</a>上面看到我之前写的一些乱七八糟的项目。<br>'+
          '你可以通过邮件联系我 <a href="mailto:'+ CONFIG.email +'">'+ CONFIG.email +'</a> 或者QQ: 715443050 或者<a target="_blank" href="'+ CONFIG.weibo +'">微博</a><br>'+
          '最后你可以试着输入 <span class="prettytext">'+ CONFIG.username +'.__doc__</span> 看看这个module有哪些属性和方法以便您更好的了解和使用它<br>'+
          '你可以点击命令输出结果中的任何绿色文字连接。在输入命令的时候如果你想中途退出，请输入Ctrl+D或者Ctrl+C。<br>'+
          '你可以输入&uarr;或者&darr;查看之前输入的命令<br>'+
          '***************************************************************************************<br>'
        );
      }else if(modulename == "cd"){
          this._terminal.write("你可以试着输入:<br>");
          this._terminal.write("进入Blog\t\t:\tcd.blog<br>");
          this._terminal.write("进入Github\t:\tcd.github<br>");
          this._terminal.write("进入微博\t\t:\tcd.weibo");
      }else{
        this._terminal.write(
              'Traceback (most recent call last):<br>'+
              ' File "<stdin>", line 1, in <module><br>'+
              'ImportError: No module named '+modulename
          );
      }
  }else{
    this._terminal.write(
              'File "<stdin>", line 1<br>'+
              ' import<br>'+
              '       ^<br>'+
              'SyntaxError: invalid syntax'
          );
  }
   cb();
}



COMMANDS.__username__action__ = function(argv, cb) {
  var attr = this._terminal.parseArgs(argv).filenames[0];
  if (attr=='weibo') {
    this._terminal.write('weibo上主要关注了一些大牛的账户，没做什么有意义的微博。id:<br><a target="_blank" href="'+ CONFIG.weibo +'">'+ CONFIG.weibo +'</a>');
  }else if(attr=='github'){
    this._terminal.write('自己特别喜欢逛github和分享自己的项目,就跟老婆逛淘宝的感觉一样样的, 发现了好玩的项目就忍不住偷看人间的源码。id:<br><a href="'+ CONFIG.github +'" target="_blank">'+ CONFIG.github +'</a>');
  }else if (attr=='blog') {
    this._terminal.write('博客，主要记录一些平时忽视的小细节和坑，目前内容不多。url:<br><a href="'+ CONFIG.blog +'" target="_blank">'+ CONFIG.blog +'</a>');
  }else if (attr=='realname') {
    this._terminal.write('张志贺');
  }else if (attr=='sendmail()') {
    this._terminal.write('由于gmail的频繁抽风(F**k GFW)，换成了万恶的QQ邮箱');
    window.location.href='mailto:'+ CONFIG.email;
  }else if (attr=='sendmail') {
    this._terminal.write('&#x3c;function loads at 0x107e73c80&#x3e;');
  }else if (attr=='__doc__') {
    this._terminal.write(
      '微博账户\t\t<span class="pythonattr">属性</span>'+ CONFIG.username +'.weibo<br>'+
      'github\t\t<span class="pythonattr">属性</span>'+ CONFIG.username +'.github<br>'+
      '博客\t\t<span class="pythonattr">属性</span>'+ CONFIG.username +'.blog<br>'+
      '自己的真实名字\t<span class="pythonattr">属性</span>'+ CONFIG.username +'.realname<br>'+
      '给我发邮件\t<span class="pythonmethod">方法</span>'+ CONFIG.username +'.sendmail()<br>'
      );
  }else{
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in <module><br>'+
        "AttributeError: 'module' object has no attribute '"+attr+"'"
      );
  }  
   cb();
}

COMMANDS.login = function(argv, cb) {
   this._terminal.returnHandler = function() {
      var username = this.stdout().innerHTML;

      this.scroll();
      if (username)
         this.config.username = username;
      this.write('<br>Password: ');
      this.scroll();
      this.returnHandler = function() { cb(); }
   }.bind(this._terminal);
   this._terminal.write('Username: ');
   this._terminal.newStdout();
   this._terminal.scroll();
}

COMMANDS.tree = function(argv, cb) {
   var term = this._terminal, home;

   function writeTree(dir, level) {
      dir.contents.forEach(function(entry) {
         var str = '';

         if (entry.name.startswith('.'))
            return;
         for (var i = 0; i < level; i++)
            str += '|  ';
         str += '|&mdash;&mdash;';
         term.write(str);
         term.writeLink(entry, term.dirString(dir) + '/' + entry.name);
         term.write('<br>');
         if (entry.type === 'dir')
            writeTree(entry, level + 1);
      });
   };
   home = this._terminal.getEntry('~');
   this._terminal.writeLink(home, '~');
   this._terminal.write('<br>');
   writeTree(home, 0);
   cb();
}

COMMANDS.help = function(argv, cb) {
   this._terminal.write(
       'import thiswebsite<br>' + 
       'You can navigate either by clicking on anything that ' +
       '<a href="javascript:void(0)">underlines</a> when you put your mouse ' +
       'over it, or by typing commands in the terminal. '+
       '<br>If there is a command you want to get ' +
       'out of, press Ctrl+C or Ctrl+D.<br><br>');
   this._terminal.write('Commands are:<br>');
   for (var c in this._terminal.commands) {
      if (this._terminal.commands.hasOwnProperty(c) && !c.startswith('_'))
         this._terminal.write(c + '  ');
   }
   cb();
}

COMMANDS.exit = function(argv, cb) {
   this._terminal.write("Goto index page.");
   window.location.href='/';
   cb();
}

COMMANDS.cd = function(argv, cb) {
  var cdname = this._terminal.parseArgs(argv).filenames[0];
  if (cdname) {
      if (cdname=="blog") {
        this._terminal.write("goto blog");
        window.location.href=''+ CONFIG.blog +'';
      }else if(cdname=="github"){
        this._terminal.write("goto github");
        window.location.href=''+ CONFIG.github +'';
      }else if(cdname=="weibo"){
        this._terminal.write("goto weibo");
        window.location.href=''+ CONFIG.weibo +'';
      }else if(cdname=="index"){
        window.location.href='/';
      }else{
        this._terminal.write(
              'Traceback (most recent call last):<br>'+
              ' File "<stdin>", line 1, in <module><br>'+
              'ImportError: No module named '+cdname
          );
      }
  }else{
    this._terminal.write("你可以试着输入:<br>");
    this._terminal.write("进入Blog\t\t:\tcd.blog<br>");
    this._terminal.write("进入Github\t:\tcd.github<br>");
    this._terminal.write("进入微博\t\t:\tcd.weibo");
  }
   cb();
}
