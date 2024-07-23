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
import threading

celery_app = flask_app.extensions["celery"] #-Line 3

@celery_app.task(bind=True)
def long_running_task(self) -> str:
    sleep(10)
    self.update_state(state='PROGRESS', meta={'current': 10, 'total': 100})
    return 'Task completed'

@celery_app.task(bind=True)
def make_commit(self, repo_url: str, commit_message, apps, models, serializers, routes, project):
    task_id = self.request.id
    repo = None
    dir = None
    state_variable = {
        'state': 'PROGRESS',
        "error_state": None,
        "cloning": False,
        "cleaning": False,
        "auth": False,
        "commiting": False,
        'app_code_status': {
            app["name"] : {
                "models": False,
                "serializers": False,
                "routes": False
            } for app in apps
        }
    }
    mutex = threading.Lock()
    sleep(5)
    try:
        with ThreadPoolExecutor() as executor:
            clone_task = executor.submit(clone_repo, repo_url, state_variable, mutex, self, task_id)
            cleaning_task = executor.submit(clean_data, apps, models, serializers, routes, state_variable, mutex, self, task_id)
            status, dir, repo = clone_task.result()
            if not status:
                return False
            status, data = cleaning_task.result()
            if not status:
                return False
            
            setup_apps(apps, dir)
            setup_auth(project, dir, state_variable, mutex, self, task_id)
            model_threads = []
            serializer_threads = []
            route_threads = []
            cleaned_models = data['cleaned_models']
            cleaned_serializers = data['cleaned_serializers']
            cleaned_routes = data['cleaned_routes']
            sleep(10)
            for app in apps:
                app_models = [i for i in cleaned_models if i['appId'] == app['_id']]
                app_serializers = [i for i in cleaned_serializers if i['appId'] == app['_id']]
                app_routes = [i for i in cleaned_routes if i['appId'] == app['_id']]
                model_threads.append(executor.submit(create_models, app_models, app['name'], dir, state_variable, mutex, self, task_id))
                serializer_threads.append(executor.submit(add_serializer, app_serializers, app['name'], dir, state_variable, mutex, self, task_id))
                route_threads.append(executor.submit(setup_routes, app_routes, app['name'], dir, state_variable, mutex, self, task_id))
            for thread in model_threads:
                thread.result()
            for thread in serializer_threads:
                thread.result()
            for thread in route_threads:
                thread.result()
            with mutex:
                if state_variable['error_state']:
                    self.update_state(state='Error', meta=state_variable)
                    return False
            commit_repo(repo, commit_message)
            with mutex:
                state_variable['commiting'] = True
                self.update_state(state='Success', meta=state_variable)
            return True
    except Exception as e:
        print(f"An error occurred outer: {e}")
        with mutex:
            state_variable['error_status'] = str(e)
            self.update_state(state='Error', meta=state_variable)
        return False


@celery_app.task(bind=True)
def init_repo(self, repo_url: str):
    status, err = load_template(repo_url)
    if status:
        self.update_state(state='Success', meta={'status': 'Commited'})
        return True
    self.update_state(state='Error', meta={'status': err})
    return False
