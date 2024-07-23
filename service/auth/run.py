
import os
from .jwt import setup_jwt

def setup_auth(project, directory, state_variable, mutex, task, task_id):
    if project['authenticationType'] == 'jwt':
        try:
            setup_jwt(project, directory)
            if task:
                with mutex:
                    state_variable['auth'] = True
                    task.update_state(task_id = task_id, state='PROGRESS', meta=state_variable)
            return True
        except Exception as e:
            print(f"An error occurred in auth: {e}")
            if task:
                with mutex:
                    state_variable['auth'] = f"An error occurred: {e}"
                    state_variable['error_state'] = 'auth'
                    task.update_state(task_id = task_id, state='Error', meta=state_variable)
            return False
    else:
        pass