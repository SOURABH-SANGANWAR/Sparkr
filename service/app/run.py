import os
from .add_installed_apps import add_installed_apps
from .add_urls import add_urls
from .add_files import add_files

def setup_apps(apps, directory):
    for app in apps:
        app_name = app['name']
        # Create app directory
        add_files(app_name, directory)


    add_installed_apps(apps, directory)
    add_urls(apps, directory)


if __name__ == "__main__":
    apps = [{"name": "app1"}, {"name": "app2"}]
    directory = 'F:\\projects\\backend-developer-tool\\backend\\test'
    setup_apps(apps, directory)