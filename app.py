# -*- coding: utf-8 -*-
import os
import json
from functools import wraps
from flask import (Flask, render_template, flash, redirect, url_for, request)
from werkzeug.utils import secure_filename
from flask.ext.login import (LoginManager, login_required, current_user, login_user, logout_user)
from flask.ext.script import Manager

from model import Wiki, UserManager
from form import URLForm, SearchForm, EditorForm, LoginForm, AddLnkForm
from utils import make_salted_hash, check_hashed_password, allowed_file, get_save_name, get_md5, save_uploadfile_to_backup


import sys
reload(sys)
sys.setdefaultencoding('utf-8')


def get_default_authentication_method():
    return app.config.get('DEFAULT_AUTHENTICATION_METHOD', 'cleartext')


def protect(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if app.config.get('PRIVATE') and not current_user.is_authenticated():
            return loginmanager.unauthorized()
        return f(*args, **kwargs)
    return wrapper


def showprotect(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if app.config.get('SHOWPRIVATE') and not current_user.is_authenticated():
            return loginmanager.unauthorized()
        return f(*args, **kwargs)
    return wrapper


app = Flask(__name__)

if os.path.exists("content/user_config.py"):
    config_filename = "user_config.py"
elif os.path.exists("content/config.py"):
    config_filename = "config.py"
else:
    print ("Startup Failure: You need to place a "
           "config.py or user_config.py in your content directory.")
    exit(1)

app.config['CONTENT_DIR'] = 'content'
app.config['TITLE'] = 'wiki'

app.config['TITLELNK'] = []

app.config.from_pyfile(
    os.path.join(app.config.get('CONTENT_DIR'), config_filename)
)

manager = Manager(app)

loginmanager = LoginManager()
loginmanager.init_app(app)
loginmanager.login_view = 'user_login'

wiki = Wiki(app.config.get('CONTENT_DIR'))

users = UserManager(app.config.get('USER_CONFIG_DIR'))

if not os.path.exists(app.config.get('UPLOAD_DIR')):
    os.makedirs(app.config.get('UPLOAD_DIR'))


@loginmanager.user_loader
def load_user(name):
    return users.get_user(name)


@app.route('/')
@showprotect
def home():
    page = wiki.get('home')
    if page:
        return display('home')
    return render_template('home.html')


@app.route('/index/')
@showprotect
def index():
    pages = wiki.index()
    return render_template('index.html', pages=pages)


@app.route('/<path:url>/')
@showprotect
def display(url):
    page = wiki.get_or_404(url)
    return render_template('page.html', page=page)


@app.route('/create/', methods=['GET', 'POST'])
@protect
def create():
    form = URLForm()
    if form.validate_on_submit():
        return redirect(url_for('edit', url=form.clean_url(form.url.data)))
    return render_template('create.html', form=form)


@app.route('/edit/<path:url>/', methods=['GET', 'POST'])
@protect
def edit(url):
    page = wiki.get(url)
    form = EditorForm(obj=page)
    if form.validate_on_submit():
        if not page:
            page = wiki.get_bare(url)
        form.populate_obj(page)
        page.save()
        flash('"%s" was saved.' % page.title, 'success')
        return redirect(url_for('display', url=url))
    return render_template('editor.html', form=form, page=page)


@app.route('/preview/', methods=['POST'])
@showprotect
def preview():
    a = request.form
    data = {}
    processed = Processors(a['body'])
    data['html'], data['body'], data['meta'] = processed.out()
    return data['html']


@app.route('/move/<path:url>/', methods=['GET', 'POST'])
@protect
def move(url):
    page = wiki.get_or_404(url)
    form = URLForm(obj=page)
    if form.validate_on_submit():
        newurl = form.url.data
        wiki.move(url, newurl)
        return redirect(url_for('.display', url=newurl))
    return render_template('move.html', form=form, page=page)


@app.route('/delete/<path:url>/')
@protect
def delete(url):
    page = wiki.get_or_404(url)
    wiki.delete(url)
    flash('Page "%s" was deleted.' % page.title, 'success')
    return redirect(url_for('home'))


@app.route('/tags/')
@showprotect
def tags():
    tags = wiki.get_tags()
    return render_template('tags.html', tags=tags)


@app.route('/tag/<string:name>/')
@showprotect
def tag(name):
    tagged = wiki.index_by_tag(name)
    return render_template('tag.html', pages=tagged, tag=name)


@app.route('/search/', methods=['GET', 'POST'])
@showprotect
def search():
    form = SearchForm()
    if form.validate_on_submit():
        results = wiki.search(form.term.data)
        return render_template('search.html', form=form,
                               results=results, search=form.term.data)
    return render_template('search.html', form=form, search=None)


@app.route('/user/login/', methods=['GET', 'POST'])
def user_login():
    form = LoginForm()
    if form.validate_on_submit():
        user = users.get_user(form.name.data)
        login_user(user)
        user.set('authenticated', True)
        flash('Login successful.', 'success')
        return redirect(request.args.get("next") or url_for('index'))
    return render_template('login.html', form=form)


@app.route('/user/logout/')
@login_required
def user_logout():
    current_user.set('authenticated', False)
    logout_user()
    flash('Logout successful.', 'success')
    return redirect(url_for('index'))


@app.route('/about/')
@showprotect
def about():
    return render_template('about.html')


@app.route('/upload/', methods=['GET'])
@showprotect
def show_upload():
    tags = wiki.get_tags()
    if os.path.exists(os.path.join(app.config.get('CONTENT_DIR'), "uploads.json")):
        fd = open(os.path.join(app.config.get('CONTENT_DIR'), "uploads.json"), "r")
        _s = fd.read()
        fd.close()
        uploads = json.loads(_s)
    else:
        uploads = {}
    return render_template('upload.html', uploads=uploads)


@app.route('/upload/', methods=['POST'])
@protect
def post_upload():
    file = request.files['file']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        savename = get_save_name(filename)
        filepath = os.path.join(app.config.get('UPLOAD_DIR'), savename)
        file.save(filepath)
        staticfilepath = filepath[1:].replace("\\", "/")
        bobj = {"filename":filename, "url":staticfilepath, "error": False}

        if os.path.exists(os.path.join(app.config.get('CONTENT_DIR'), "uploads.json")):
            fd = open(os.path.join(app.config.get('CONTENT_DIR'), "uploads.json"), "r")
            _s = fd.read()
            fd.close()
            _os = json.loads(_s)
        else:
            _os = {}

        _os[savename] = filename
        _s = json.dumps(_os)
        fd = open(os.path.join(app.config.get('CONTENT_DIR'), "uploads.json"), "w")
        fd.write(_s)
        fd.close()

    else:
        bobj =  {'error':True}

    if not bobj['error']:
        save_uploadfile_to_backup(filepath)
    return json.dumps(bobj)


@app.route('/addlnk/', methods=['GET', 'POST'])
@protect
def addlnk():
    form = AddLnkForm()
    if form.validate_on_submit():
        url = form.clean_url(form.url.data)
        app.config['TITLELNK'].append({"title":form.title.data, "url":url})
        return redirect(url_for('edit', url=url))
    return render_template('addLnk.html', form=form)


@app.route('/user/')
@protect
def user_index():
    pass


@app.route('/user/create/')
@protect
def user_create():
    pass


@app.route('/user/<int:user_id>/')
@protect
def user_admin(user_id):
    pass


@app.route('/user/delete/<int:user_id>/')
@protect
def user_delete(user_id):
    pass


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    manager.run()
