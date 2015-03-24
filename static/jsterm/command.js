var COMMANDS = COMMANDS || {};

COMMANDS.cat =  function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "cat"
    );
  }else{
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
 }
 cb();
}

COMMANDS.ls = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "ls"
    );
  }else{
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
 }
 cb();
}

COMMANDS.gimp = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "gimp"
    );
  }else{
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
 }
 cb();
}

COMMANDS.clear = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "clear"
    );
  }else{
   this._terminal.div.innerHTML = '';
 }
 cb();
}

COMMANDS.sudo = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "sudo"
    );
    cb();
  }else{
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
}


COMMANDS.python = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "python"
    );
  }else{
     CONFIG.ipython = true;
     this._terminal.config.username = CONFIG.username;
     var myDate = new Date();
     var timestr = myDate.toLocaleDateString() + ' '+myDate.toLocaleTimeString()
     this._terminal.scroll();
     this._terminal.write(
        CONFIG.python_version + ' (default, '+ timestr +')<br>'+
        '['+ CONFIG.gcc_version +'] on '+ CONFIG.sys_platform +'<br>'+
        'Type "import ' + CONFIG.username + '" for more information.');
   }
   cb();
}

COMMANDS.import = function(argv, cb) {
  if(!CONFIG.ipython){
    this._terminal.write("zsh: command not found: import<br>");
  }else{
    var modulename = this._terminal.parseArgs(argv).filenames[0];
    if (modulename) {
        if (modulename==CONFIG.username) {
          this._terminal.write(
            AboutMeStr
          );
        }else if(modulename == "cd"){
            var writeStr = writeContactInformationDoc();
            this._terminal.write(
              writeStr
              );
        }else{
          this._terminal.write(
                'Traceback (most recent call last):<br>'+
                ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
                'ImportError: No module named '+modulename
            );
        }
    }else{
      this._terminal.write(
                'File "&#x3c;stdin&#x3e;", line 1<br>'+
                ' import<br>'+
                '       ^<br>'+
                'SyntaxError: invalid syntax'
            );
    }
  }
  cb();
}

function writeContactInformation(dict){
  var writeStr = "";
  if (dict['type'] == "lnk"){
    if("info" in dict){
      writeStr += dict['info'] + " ID:<br><a target='_blank' href='" + dict['value'] + "'>" + dict['value'] + "</a>";
    }else{
      writeStr += " ID:<br><a target='_blank' href='" + dict['value'] + "'>" + dict['value'] + "</a>";
    }
  }else{
    if("info" in dict){
      writeStr += dict['info'] + " :<br>" + dict['value'] + "</a>";
    }else{
      console.log(3)
      writeStr += dict['value'];
    }
  }
  return writeStr;
}

function writeContactInformationDoc(){
  var writeStr = "";
  for(ci in ContactInformation){
    var dict  = ContactInformation[ci];
    if(ci == "email"){
      writeStr += dict['showStr'] + "\t:<span class='pythonmethod'>method</span>\t\t"+ CONFIG.username +"."+ ci +"()<br>";
    }else{
      writeStr += dict['showStr'] + "\t:<span class='pythonattr'>attribute</span>\t"+ CONFIG.username +"."+ ci +"<br>";
    }
  }
  return writeStr;
}


COMMANDS.__username__action__ = function(argv, cb) {
  var attr = "";
  if (this._terminal.parseArgs(argv).filenames.length > 0){
    attr = this._terminal.parseArgs(argv).filenames[0];
  }
  if(!CONFIG.ipython){
    this._terminal.write("zsh: command not found: attr<br>");
  }else{
    if (this._terminal.parseArgs(argv).filenames.length > 0){
      var attr = this._terminal.parseArgs(argv).filenames[0];
      if (attr in ContactInformation){
        var writeStr = writeContactInformation(ContactInformation[attr]);
        this._terminal.write(writeStr);
      }else if (attr=='__doc__') {
        var writeStr = writeContactInformationDoc();
        this._terminal.write(
          writeStr
          );
      }else{
        this._terminal.write(
            'Traceback (most recent call last):<br>'+
            ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
            'ImportError: No module named '+ attr
        );
      }
    }else{
      this._terminal.write(
          "&#x3c;module '"+ CONFIG.username +"' from '/Home/"+ CONFIG.username +"/__init__.pyc'&#x3e;"
      );
    }
  }
  cb();
}

COMMANDS.login = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "login"
    );
    cb();
  }else{
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
}

COMMANDS.tree = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "tree"
    );
  }else{
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
   }
   cb();
}

COMMANDS.help = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "help"
    );
  }else{
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
  }
  cb();
}

COMMANDS.exit = function(argv, cb) {
  if(CONFIG.ipython){
    CONFIG.ipython = false;
    this._terminal.write("");
  }else{
   this._terminal.write("Goto index page.");
   window.location.href='/';
  }
  cb();
}

function gotoCommand(gotoname){
  var writeStr = "goto " + gotoname;
  window.location.href=''+ ContactInformation[gotoname]['lnk'] +'';
  return writeStr;
}

function gotoDoc(){
  var writeStr = "You can enter:<br>";
  for(ci in ContactInformation){
    var dict  = ContactInformation[ci];
    if(dict['type'] == "lnk")
      writeStr += "<strong> goto " + ci + "</strong><br>";
  }
  return writeStr;
}

COMMANDS.goto = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "goto"
    );
  }else{
    var gotoname = this._terminal.parseArgs(argv).filenames[0];
    if (gotoname) {
      if(gotoname in ContactInformation && ContactInformation[gotoname]['type']=='lnk'){
        var writeStr = gotoCommand(gotoname);
        this._terminal.write(
            writeStr
        );
      }else{
        this._terminal.write(
            "goto: no such file or directory: " + cdname
        );
      }
    }else{
      var writeStr = gotoDoc();
      this._terminal.write(
          writeStr
      );
    }
  }
  cb();
}


COMMANDS.who = function(argv, cb) {
  if(CONFIG.ipython){
    this._terminal.write(
        'Traceback (most recent call last):<br>'+
        ' File "&#x3c;stdin&#x3e;", line 1, in &#x3c;module&#x3e;<br>'+
        'ImportError: No module named '+ "who"
    );
  }else{
    this._terminal.write(
        AboutMeStr
    );
  }
  cb();
}