# -*- coding: utf-8 -*-
import binascii
import hashlib
import os
import shutil
import re
from hashlib import md5
import uuid
import markdown
import json
from functools import wraps
from flask import (Flask, render_template, flash, redirect, url_for, request,
                   abort)

from flask.ext.login import (LoginManager, login_required, current_user,
                             login_user, logout_user)
from flask.ext.script import Manager



import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from flask.ext.wtf import Form
from wtforms import (TextField, TextAreaField, PasswordField)
from wtforms.validators import (InputRequired, ValidationError)

from handlerAction import Wiki, UserManager, Processors

class URLForm(Form):
    url = TextField('', [InputRequired()])

    def validate_url(form, field):
        from app import wiki
        if wiki.exists(field.data):
            raise ValidationError('The URL "%s" exists already.' % field.data)

    def clean_url(self, url):
        return Processors().clean_url(url)


class SearchForm(Form):
    term = TextField('', [InputRequired()])


class EditorForm(Form):
    title = TextField('', [InputRequired()])
    body = TextAreaField('', [InputRequired()])
    tags = TextField('')


class LoginForm(Form):
    name = TextField('', [InputRequired()])
    password = PasswordField('', [InputRequired()])

    def validate_name(form, field):
        user = users.get_user(field.data)
        if not user:
            raise ValidationError('This username does not exist.')

    def validate_password(form, field):
        user = users.get_user(form.name.data)
        if not user:
            return
        if not user.check_password(field.data):
            raise ValidationError('Username and password do not match.')

