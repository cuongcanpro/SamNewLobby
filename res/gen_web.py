import json
import os
import sys, getopt
import shutil
import distutils.dir_util
import time
import csv
import multiprocessing as mp
import os.path
import glob
import hashlib

g_data_code_folder = os.path.join('../src/Game')
g_list_ignore = ['.obj', '.py', '.js']

class AssetItem:
    def __init__(self):
        self.path = ""
        self.md5 = ""

def list_file_in_folder(folder, root_folder):
    for name in os.listdir(folder):
        file_path = os.path.join(folder, name)
        if os.path.isfile(file_path):
            relative_path = os.path.relpath(file_path, root_folder)
            file_name, file_ext = os.path.splitext(file_path)

            if any(file_ext in s for s in g_list_ignore):
                print 'No list file: ' + file_name
            else:
                item = AssetItem()
                item.path = relative_path.replace('\\', '/')
                item.md5 = hashlib.md5(open(file_path, 'rb').read()).hexdigest()
                g_list_assets.append(item)
        else:
            list_file_in_folder(file_path, root_folder)

def export_list_file_for_web():
    global g_list_assets
    g_list_assets = []
    list_file_in_folder('../res', '../')
    list_assets = []
    list_assets_md5 = {}
    for data in g_list_assets:
        if data.path.find('.svn') >= 0:
            continue
        list_assets.append(data.path)
        list_assets_md5[data.path] = data.md5

    data = 'g_resources = ' + json.dumps(list_assets) + ';'
    data = data + '\ng_hash_resources = ' + json.dumps(list_assets_md5) + ';'

    file_out = os.path.join(g_data_code_folder, 'WebResource.js')
    file_write = open(file_out, 'w')
    file_write.write(data)
    file_write.close()

export_list_file_for_web()