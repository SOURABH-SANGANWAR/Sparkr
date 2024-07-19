from config import create_app
import environ

env = environ.Env()
environ.Env.read_env()

flask_app = create_app()  


# Add environment for pat token
flask_app.config['PAT_TOKEN'] = env('PAT_TOKEN')
flask_app.config['TEMPLATE_REPO_URL'] = env('TEMPLATE_REPO_URL')
flask_app.config['TEMPLATE_DIRECTORY'] = env('TEMPLATE_DIRECTORY')
