# -*- coding: utf-8 -*-
import os
import re
import markdown
import json
from flask import (url_for ,abort)


class Processors(object):
    def __init__(self, content=""):
        self.content = self.pre(content)

    def wikilink(self, html):
        link = r"((?<!\<code\>)\[\[([^<].+?) \s*([|] \s* (.+?) \s*)?]])"
        compLink = re.compile(link, re.X | re.U)
        for i in compLink.findall(html):
            title = [i[-1] if i[-1] else i[1]][0]
            url = self.clean_url(i[1])
            formattedLink = u"<a href='{0}'>{1}</a>".format(url_for('display', url=url), title)
            html = re.sub(compLink, formattedLink, html, count=1)
        return html

    def clean_url(self, url):
        pageStub = re.sub('[ ]{2,}', ' ', url).strip()
        pageStub = pageStub.lower().replace(' ', '_')
        pageStub = pageStub.replace('\\\\', '/').replace('\\', '/')
        return pageStub

    def pre(self, content):
        return content

    def post(self, html):
        return self.wikilink(html)

    def out(self):
        md = markdown.Markdown(['codehilite', 'fenced_code', 'meta', 'tables'])
        html = md.convert(self.content)
        phtml = self.post(html)
        body = self.content.split('\n\n', 1)[1]
        meta = md.Meta
        return phtml, body, meta


class Page(object):
    def __init__(self, path, url, new=False):
        self.path = path
        self.url = url
        self._meta = {}
        if not new:
            self.load()
            self.render()

    def load(self):
        with open(self.path, 'rU') as f:
            self.content = f.read().decode('utf-8')

    def render(self):
        processed = Processors(self.content)
        self._html, self.body, self._meta = processed.out()

    def save(self, update=True):
        folder = os.path.dirname(self.path)
        if not os.path.exists(folder):
            os.makedirs(folder)
        with open(self.path, 'w') as f:
            for key, value in self._meta.items():
                line = u'%s: %s\n' % (key, value)
                f.write(line.encode('utf-8'))
            f.write('\n'.encode('utf-8'))
            f.write(self.body.replace('\r\n', '\n').encode('utf-8'))
        if update:
            self.load()
            self.render()

    @property
    def meta(self):
        return self._meta

    def __getitem__(self, name):
        item = self._meta[name]
        if len(item) == 1:
            return item[0]
        return item

    def __setitem__(self, name, value):
        self._meta[name] = value

    @property
    def html(self):
        return self._html

    def __html__(self):
        return self.html

    @property
    def title(self):
        return self['title']

    @title.setter
    def title(self, value):
        self['title'] = value

    @property
    def tags(self):
        return self['tags']

    @tags.setter
    def tags(self, value):
        self['tags'] = value


class Wiki(object):
    def __init__(self, root):
        self.root = root

    def path(self, url):
        return os.path.join(self.root, url + '.md')

    def exists(self, url):
        path = self.path(url)
        return os.path.exists(path)

    def get(self, url):
        path = os.path.join(self.root, url + '.md')
        if self.exists(url):
            return Page(path, url)
        return None

    def get_or_404(self, url):
        page = self.get(url)
        if page:
            return page
        abort(404)

    def get_bare(self, url):
        path = self.path(url)
        if self.exists(url):
            return False
        return Page(path, url, new=True)

    def move(self, url, newurl):
        os.rename(
            os.path.join(self.root, url) + '.md',
            os.path.join(self.root, newurl) + '.md'
        )

    def delete(self, url):
        path = self.path(url)
        if not self.exists(url):
            return False
        os.remove(path)
        return True

    def index(self, attr=None):
        def _walk(directory, path_prefix=()):
            if not os.path.isdir(directory):
                os.makedirs(directory)
                return
            for name in os.listdir(directory):
                fullname = os.path.join(directory, name)
                if os.path.isdir(fullname) and fullname != "upload":
                    _walk(fullname, path_prefix + (name,))
                elif name.endswith('.md'):
                    if not path_prefix:
                        url = name[:-3]
                    else:
                        url = os.path.join(path_prefix[0], name[:-3])
                    if attr:
                        pages[getattr(page, attr)] = page
                    else:
                        if name != "home.md":
                            pages.append(Page(fullname, url.replace('\\', '/')))
        if attr:
            pages = {}
        else:
            pages = []
        _walk(self.root)
        if not attr:
            return self._return_indexs_by_sorted(pages)
        return pages

    def get_by_title(self, title):
        pages = self.index(attr='title')
        return pages.get(title)

    def get_tags(self):
        pages = self.index()
        tags = {}
        for page in pages:
            pagetags = page.tags.split(',')
            for tag in pagetags:
                tag = tag.strip()
                if tag == '':
                    continue
                elif tags.get(tag):
                    tags[tag].append(page)
                else:
                    tags[tag] = [page]
        return tags

    def index_by_tag(self, tag):
        pages = self.index()
        tagged = []
        for page in pages:
            if tag in page.tags:
                tagged.append(page)
        return self._return_indexs_by_sorted(tagged)

    def search(self, term, attrs=['title', 'tags', 'body']):
        pages = self.index()
        regex = re.compile(term)
        matched = []
        for page in pages:
            for attr in attrs:
                if regex.search(getattr(page, attr)):
                    matched.append(page)
                    break
        return self._return_indexs_by_sorted(matched)

    def _return_indexs_by_sorted(self, indexs):
        return sorted(indexs, key=lambda x: x.url.lower(), reverse=True)


class UserManager(object):
    def __init__(self, path):
        if os.path.exists("content/user_users.json"):
            self.file = os.path.join(path, 'user_users.json')
        else:
            self.file = os.path.join(path, 'users.json')

    def read(self):
        if not os.path.exists(self.file):
            return {}
        with open(self.file) as f:
            data = json.loads(f.read())
        return data

    def write(self, data):
        with open(self.file, 'w') as f:
            f.write(json.dumps(data, indent=2))

    def add_user(self, name, password,
                 active=True, roles=[], authentication_method=None):
        users = self.read()
        if users.get(name):
            return False
        if authentication_method is None:
            from utils import get_default_authentication_method
            authentication_method = get_default_authentication_method()
        new_user = {
            'active': active,
            'roles': roles,
            'authentication_method': authentication_method,
            'authenticated': False
        }
        if authentication_method == 'hash':
            new_user['hash'] = make_salted_hash(password)
        elif authentication_method == 'cleartext':
            new_user['password'] = password
        else:
            raise NotImplementedError(authentication_method)
        users[name] = new_user
        self.write(users)
        userdata = users.get(name)
        return User(self, name, userdata)

    def get_user(self, name):
        users = self.read()
        userdata = users.get(name)
        if not userdata:
            return None
        return User(self, name, userdata)

    def delete_user(self, name):
        users = self.read()
        if not users.pop(name, False):
            return False
        self.write(users)
        return True

    def update(self, name, userdata):
        data = self.read()
        data[name] = userdata
        self.write(data)


class User(object):
    def __init__(self, manager, name, data):
        self.manager = manager
        self.name = name
        self.data = data

    def get(self, option):
        return self.data.get(option)

    def set(self, option, value):
        self.data[option] = value
        self.save()

    def save(self):
        self.manager.update(self.name, self.data)

    def is_authenticated(self):
        return self.data.get('authenticated')

    def is_active(self):
        return self.data.get('active')

    def is_anonymous(self):
        return False

    def get_id(self):
        return self.name

    def check_password(self, password):

        authentication_method = self.data.get('authentication_method', None)
        if authentication_method is None:
            from utils import get_default_authentication_method
            authentication_method = get_default_authentication_method()
        if authentication_method == 'hash':
            result = check_hashed_password(password, self.get('hash'))
        elif authentication_method == 'cleartext':
            result = (self.get('password') == password)
        else:
            raise NotImplementedError(authentication_method)
        return result
