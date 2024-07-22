import git
from tempfile import mkdtemp
from flask_app import flask_app
import shutil
import os

def remove_all_except_git(directory):
    for item in os.listdir(directory):
        item_path = os.path.join(directory, item)
        if item == '.git':
            continue
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)


def load_template( repo_url: str) -> str:
    pat_token = flask_app.config['PAT_TOKEN']
    import_url = flask_app.config['TEMPLATE_REPO_URL']

    temp_dir = mkdtemp()
    if temp_dir:
        try:
            repo = git.Repo.clone_from(import_url, temp_dir)
        except Exception as e:
            print(f"An error occurred: {e}")
            return ( False, f"An error occurred: {e}", None )
    else:
        print("Could not create temporary directory.")
        return ( False, "Could not create temporary directory.", None )
    
    new_temp_dir = mkdtemp()
    if new_temp_dir:
        try:
            new_repo_url = repo_url.replace("https://", f"https://{pat_token}@")
            code_source = f"{temp_dir}/rest_framework_template"
            code_destination = new_temp_dir
            new_repo = git.Repo.clone_from(new_repo_url, new_temp_dir)
            remove_all_except_git(new_temp_dir)
            # copy the code from the template directory to the new temp directory
            shutil.copytree(code_source, code_destination, dirs_exist_ok=True)
            new_repo.git.add(all=True)
            new_repo.index.commit("Load template")
            new_repo.git.push()
            return ( True, None )

        except Exception as e:
            print(f"An error occurred: {e}")
            return ( False, f"An error occurred: {e}")
    else:
        print("Could not create temporary directory.")
        return ( False, "Could not create temporary directory.")


if __name__ == "__main__":
    load_template("https://github.com/SOURABH-SANGANWAR/new-project-3")