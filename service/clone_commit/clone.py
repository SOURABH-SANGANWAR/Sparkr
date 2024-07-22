import git
from tempfile import mkdtemp
from flask_app import flask_app


def clone_repo( repo_url: str) -> str:
    pat_token = flask_app.config['PAT_TOKEN']
    temp_dir = mkdtemp()
    print(temp_dir)
    if temp_dir:
        try:
            new_repo_url = repo_url.replace("https://", f"https://{pat_token}@")
            repo = git.Repo.clone_from(new_repo_url, temp_dir)
            return True, temp_dir, repo
        except Exception as e:
            print(f"An error occurred: {e}")
            return ( False, f"An error occurred: {e}", None )
    else:
        print("Could not create temporary directory.")
        return ( False, "Could not create temporary directory.", None )