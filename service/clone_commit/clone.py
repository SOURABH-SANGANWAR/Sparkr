import git
from tempfile import mkdtemp
from flask_app import flask_app


def clone_repo( repo_url: str, state_variable, mutex, task, task_id) -> str:
    pat_token = flask_app.config['PAT_TOKEN']
    temp_dir = mkdtemp()
    if temp_dir:
        try:
            new_repo_url = repo_url.replace("https://", f"https://{pat_token}@")
            repo = git.Repo.clone_from(new_repo_url, temp_dir)
            if task:
                with mutex:
                    state_variable['cloning'] = True
                    task.update_state(task_id = task_id, state='PROGRESS', meta=state_variable)
            return True, temp_dir, repo
        except Exception as e:
            print(f"An error occurred in cloning: {e}")
            if task:
                with mutex:
                    state_variable['cloning'] = f"An error occurred: {e}"
                    state_variable['error_state'] = 'cloning'
                    task.update_state(task_id = task_id, state='Error', meta=state_variable)
            return ( False, f"An error occurred: {e}", None )
    else:
        print("Could not create temporary directory.")
        if task:
            with mutex:
                state_variable['cloning'] = "Could not create temporary directory."
                state_variable['error_state'] = 'cloning'
                task.update_state(task_id = task_id, state='Error', meta=state_variable)
        return ( False, "Could not create temporary directory.", None )