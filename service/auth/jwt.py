import os
from yapf.yapflib.yapf_api import FormatCode  # reformat a string of code
from utils.fetcher import find_variable_definition
import ast

def setup_jwt(project, directory):
    update_settings(project, directory)
    update_requirements(directory)

def update_requirements(directory):
    if not os.path.exists(f'{directory}/requirements.txt'):
        with open(f'{directory}/requirements.txt', 'w') as f:
            f.write('djangorestframework-simplejwt\n')
        return
    with open(f'{directory}/requirements.txt', 'r') as f:
        content = f.read()
        if 'djangorestframework-simplejwt' not in content:
            content += '\ndjangorestframework-simplejwt\n'
    
    with open(f'{directory}/requirements.txt', 'w') as f:
        f.write(content)

def update_settings(project, directory):
    current_dir = os.path.dirname(__file__)  # Get current module's directory
    template_path = os.path.join(current_dir, 'jwt_template.txt')
    config = project.get('authConfig')
    if not config:
        config = {
            "algorithm": "HS256",
            "accessExpiration": 3600,
            "refreshExpiration": 604800,
            "rotate": False,
            "blacklist": False,
        }

    with open(template_path, 'r') as f:
        jwt_config_string = f.read()
        jwt_config_string = jwt_config_string.replace('${ACCESS_TOKEN_LIFETIME}', str(config['accessExpiration']))
        jwt_config_string = jwt_config_string.replace('${REFRESH_TOKEN_LIFETIME}', str(config['refreshExpiration']))
        jwt_config_string = jwt_config_string.replace('${ALGORITHM}', f"'{config['algorithm']}'")
        jwt_config_string = jwt_config_string.replace('${ROTATE_REFRESH_TOKENS}', str(config['rotate']))
        jwt_config_string = jwt_config_string.replace('${BLACKLIST_AFTER_ROTATION}', str(config['blacklist']))
    
    # Read settings.py
    with open(f'{directory}/rest_framework_template/settings.py', 'r') as f:
        content = f.read()
    
    # Add rest_framework_simplejwt to INSTALLED_APPS
    pre, current, post = find_variable_definition(content, 'INSTALLED_APPS')
    values_of_current = current.value.elts
    if 'rest_framework_simplejwt' not in [constant.value for constant in values_of_current]:
        values_of_current.append(ast.Constant(value='rest_framework_simplejwt'))
    
    content = pre + '\n' + ast.unparse(current) + '\n' + post

    # Add JWT config
    pre, current, post = find_variable_definition(content, 'SIMPLE_JWT')
    if not current:
        content = content + '\n' + jwt_config_string
    else:
        content = pre + '\n' + jwt_config_string + '\n' + post

    # Add JWTAuthentication to REST_FRAMEWORK Default Authentication Classes
    pre, current, post = find_variable_definition(content, 'REST_FRAMEWORK')
    if not current:
        print("current not fount")
        content += '\nREST_FRAMEWORK = {\n    \'DEFAULT_AUTHENTICATION_CLASSES\': [\n        \'rest_framework_simplejwt.authentication.JWTAuthentication\',\n    ]\n}\n'
    else:
        found = False
        for index, key in enumerate(current.value.keys):
            if key.value == 'DEFAULT_AUTHENTICATION_CLASSES':
                found = True
                current.value.values[index] = ast.List(elts=[ast.Constant(value='rest_framework_simplejwt.authentication.JWTAuthentication')], ctx=ast.Load())
                break
        if not found:
            print("not found")
            current.value.keys.append(ast.Constant(value='DEFAULT_AUTHENTICATION_CLASSES'))
            current.value.values.append(ast.List(elts=[ast.Constant(value='rest_framework_simplejwt.authentication.JWTAuthentication')], ctx=ast.Load()))
    
    content = pre + '\n' + ast.unparse(current) + '\n' + post
    formatted_content = FormatCode(content, style_config='pep8')[0]

    with open(f'{directory}/rest_framework_template/settings.py', 'w') as f:
        f.write(formatted_content)

                



