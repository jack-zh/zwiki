# -*- coding: utf-8 -*-
import binascii
import hashlib
import os
import shutil
import re
from hashlib import md5
import uuid

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'zip', 'rar', 'tar', 'gz', 'xz', '7z', 'md'])


def make_salted_hash(password, salt=None):
    if not salt:
        salt = os.urandom(64)
    d = hashlib.sha512()
    d.update(salt[:32])
    d.update(password)
    d.update(salt[32:])
    return binascii.hexlify(salt) + d.hexdigest()


def check_hashed_password(password, salted_hash):
    salt = binascii.unhexlify(salted_hash[:128])
    return make_salted_hash(password, salt) == salted_hash


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_save_name(filename):
    return (str(uuid.uuid1()) + "." + filename.rsplit('.', 1)[1]).lower()


def secure_filename(s):
    _s = s.rsplit('.', 1)[1]
    s = ".".join(s.split(".")[:-1])
    s = re.sub('[" "\/\--.]+', '-', s)
    s = re.sub(r':-', ':', s)
    s = re.sub(r'^-|-$', '', s)
    return s + "." + _s

 
def get_md5(name):
    m = md5()
    a_file = open(name, 'rb')
    m.update(a_file.read())
    a_file.close()
    return m.hexdigest()


def save_uploadfile_to_backup(filename):
    try:
        backupfilepath = os.path.join(app.config.get('CONTENT_DIR'), "upload")
        if not os.path.isdir(backupfilepath):
            os.makedirs(backupfilepath)
        shutil.copy(filename,  backupfilepath)
    except Exception, e:
        print e

