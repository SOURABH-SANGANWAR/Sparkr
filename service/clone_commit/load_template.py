import git
from tempfile import mkdtemp
from flask_app import flask_app
import shutil


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
            print(new_temp_dir)
            new_repo_url = repo_url.replace("https://", f"https://{pat_token}@")
            code_source = f"{temp_dir}/rest_framework_template"
            code_destination = new_temp_dir
            # copy the code from the template directory to the new temp directory
            shutil.copytree(code_source, code_destination, dirs_exist_ok=True)
            # init the new repo
            new_repo = git.Repo.init(new_temp_dir)
            new_repo.git.checkout('-b', 'main')
            new_repo.git.add(all=True)
            new_repo.index.commit("Load template")
            print("commited")
            origin = new_repo.create_remote('origin', new_repo_url)
            print("origin added")
            origin.push("main")
            return ( True, None )

        except Exception as e:
            print(f"An error occurred: {e}")
            return ( False, f"An error occurred: {e}")
    else:
        print("Could not create temporary directory.")
        return ( False, "Could not create temporary directory.")


if __name__ == "__main__":
    load_template("https://github.com/Hello-2233/test.git")