import os
import git
from tempfile import mkdtemp
from app import flask_app


def clone_repo( repo, commit_message, dir ):
    try:
        repo.git.add(all=True)
        repo.index.commit(commit_message)
        origin = repo.remote(name='origin')
        origin.push()
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False