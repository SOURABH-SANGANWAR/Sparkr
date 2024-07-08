from utils.fetcher import find_variable_definition
import ast
from yapf.yapflib.yapf_api import FormatCode


def add_installed_apps(apps, directory):
    content = ''
    final_content = ''
    with open(f'{directory}/mysite/settings.py', 'r') as f:
        content = f.read()
        pre, current, post = find_variable_definition(content, 'INSTALLED_APPS')
        values_of_current = current.value.elts
        for app in apps:
            app_name = app['name']
            if app_name not in [constant.value for constant in values_of_current]:
                values_of_current.append(ast.Constant(value=app_name))
        
        final_content = pre + '\n' + ast.unparse(current) + '\n' + post
        formatted_content = FormatCode(final_content, style_config='pep8')[0]
    
    with open(f'{directory}/mysite/settings.py', 'w') as f:
        f.write(formatted_content)

if __name__ == "__main__":
    apps = [{"name": "app1"}, {"name": "app2"}]
    directory = 'F:\projects\backend-developer-tool\backend\test'
    add_installed_apps(apps, directory)