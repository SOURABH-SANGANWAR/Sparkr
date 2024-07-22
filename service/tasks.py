from config import create_app #-Line 1
from time import sleep
from process_data.run import clean_data
from clone_commit.clone import clone_repo
from clone_commit.commit import commit_repo
from clone_commit.load_template import load_template
from concurrent.futures import ThreadPoolExecutor
from app.run import setup_apps
from auth.run import setup_auth
from flask_app import flask_app
from models.run import create_models
from serializers.run import add_serializer
from routes.run import setup_routes


celery_app = flask_app.extensions["celery"] #-Line 3

@celery_app.task(bind=True)
def long_running_task(self) -> str:
    sleep(10)
    self.update_state(state='PROGRESS', meta={'current': 10, 'total': 100})
    return 'Task completed'

@celery_app.task(bind=True)
def make_commit(self, repo_url: str, commit_message, apps, models, serializers, routes, project):
    repo = None
    dir = None
    try:
        with ThreadPoolExecutor() as executor:
            clone_task = executor.submit(clone_repo, repo_url)
            cleaning_task = executor.submit(clean_data, apps, models, serializers, routes)
            status, dir, repo = clone_task.result()
            if status:
                self.update_state(state='PROGRESS', meta={'status': 'Cloned!. Cleaning data...'})
            else:
                self.update_state(state='Error', meta={'status': dir})
                return False
            status, data = cleaning_task.result()
            if (status == False):
                self.update_state(state='Error', meta={'status': data})
                return False
            self.update_state(state='PROGRESS', meta={'status': data})
            # return True
            
            self.update_state(state='PROGRESS', meta={'status': 'Data cleaned!. Updating files...'})
            setup_apps(apps, dir)
            self.update_state(state='PROGRESS', meta={'status': 'Apps created. Updating files...'})
            setup_auth(project, dir)
            self.update_state(state='PROGRESS', meta={'status': 'Authentication setup. Commiting changes...'})
            model_threads = []
            serializer_threads = []
            route_threads = []
            cleaned_models = data['cleaned_models']
            cleaned_serializers = data['cleaned_serializers']
            cleaned_routes = data['cleaned_routes']
            for app in apps:
                app_models = [i for i in cleaned_models if i['appId'] == app['_id']]
                app_serializers = [i for i in cleaned_serializers if i['appId'] == app['_id']]
                app_routes = [i for i in cleaned_routes if i['appId'] == app['_id']]
                model_threads.append(executor.submit(create_models, app_models, app['name'], dir))
                serializer_threads.append(executor.submit(add_serializer, app_serializers, app['name'], dir))
                route_threads.append(executor.submit(setup_routes, app_routes, app['name'], dir))
            for thread in model_threads:
                thread.result()
            for thread in serializer_threads:
                thread.result()
            for thread in route_threads:
                thread.result()
            commit_repo(repo, commit_message)
    except Exception as e:
        print(f"An error occurred: {e}")
        self.update_state(state='Error', meta={'status': str(e)})
        return False

    self.update_state(state='Success', meta={'status': 'Commited'})
    return True

@celery_app.task(bind=True)
def init_repo(self, repo_url: str):
    status, err = load_template(repo_url)
    if status:
        self.update_state(state='Success', meta={'status': 'Commited'})
        return True
    self.update_state(state='Error', meta={'status': err})
    return False
