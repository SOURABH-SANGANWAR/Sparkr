from config import create_app #-Line 1
from time import sleep
from process_data.run import clean_data
from service.clone_commit.clone import clone_repo
from service.clone_commit.commit import commit_repo
from service.clone_commit.load_template import load_template
from concurrent.futures import ThreadPoolExecutor
from app import flask_app

celery_app = flask_app.extensions["celery"] #-Line 3

@celery_app.task(bind=True)
def long_running_task(self) -> str:
    sleep(10)
    self.update_state(state='PROGRESS', meta={'current': 10, 'total': 100})
    return 'Task completed'

@celery_app.task(bind=True)
def make_commit(self, repo_url: str, commit_message, apps, models, serializers, routes):
    repo = None
    dir = None
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
        if status:
            self.update_state(state='PROGRESS', meta={'status': 'Data cleaned!. Updating files...'})
            self.update_state(state='PROGRESS', meta={'status': 'Files updated!. Committing...', "data": data})
        else:
            self.update_state(state='Error', meta={'status': data})
            return False
    return True

@celery_app.task(bind=True)
def init_repo(self, repo_url: str):
    status, err = load_template(repo_url)
    if status:
        self.update_state(state='Success', meta={'status': 'Commited'})
        return True
    self.update_state(state='Error', meta={'status': err})
    return False
