import os

def add_files(app_name, directory):
    app_directory = f'{directory}/{app_name}'
    os.makedirs(app_directory, exist_ok=True)
    files = [
        '__init__.py',
        'admin.py',
        'models.py',
        'serializers.py',
        'urls.py',
        'views.py',
    ]
    contents = [
        '',
        'from django.contrib import admin\n',
        'from django.db import models\n',
        'from rest_framework import serializers\n',
        'from django.urls import path\n',
        'from django.http import JsonResponse\n',
    ]

    for index, file in enumerate(files):
        if not os.path.exists(f'{app_directory}/{file}'):
            with open(f'{app_directory}/{file}', 'w') as f:
                f.write(contents[index])