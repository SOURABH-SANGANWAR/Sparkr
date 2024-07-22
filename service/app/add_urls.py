from utils.fetcher import find_variable_definition
import ast
from yapf.yapflib.yapf_api import FormatCode  # reformat a string of code

def check_and_add_urls(app_name, app_path, paths):
    if app_path[-1] != '/':
        app_path += '/'
    path_occupied = False
    for path in paths:
        if isinstance(path, ast.Call) and path.func.id == 'path':
            for arg in path.args:
                if isinstance(arg, ast.Constant) and arg.value == app_path:
                    path_occupied = True

                if (isinstance(arg, ast.Call) 
                    and arg.func.id == 'include' and 
                    arg.args[0].value == f'{app_name}.urls'):
                    return paths
    if path_occupied:
        raise Exception(f'Path {app_path} for app {app_name} is already occupied. Please check code.')
                
    new_path = ast.Call(func=ast.Name(id='path', ctx=ast.Load()), 
                        args=[ast.Constant(value=app_path), 
                              ast.Call(func=ast.Name(id='include', ctx=ast.Load()), 
                                       args=[ast.Constant(value=f'{app_name}.urls')], 
                                       keywords=[])], 
                        keywords=[])
    paths.append(new_path)
    

def add_urls(apps, directory):
    content = ''
    final_content = ''
    page = f'{directory}/rest_framework_template/urls.py'
    with open(page, 'r') as f:
        content = f.read()
        # Validate if path and include are imported
        _, current, _ = find_variable_definition(content, 'path')
        if not current:
            content = 'from django.urls import path\n' + content
        _, current, _ = find_variable_definition(content, 'include')
        if not current:
            content = 'from django.urls import include\n' + content
        _, current, _ = find_variable_definition(content, 'admin')
        if not current:
            content = 'from django.contrib import admin\n' + content
        
        # Add urls for each app
        pre, current, post = find_variable_definition(content, 'urlpatterns')
        
        if not current:
            raise Exception('urlpatterns not found. Please check code.')
        
        paths = current.value.elts
        for app in apps:
            app_name = app['name']
            app_path = app['path']
            check_and_add_urls(app_name, app_path, paths)
        
        current.value.elts = paths

        final_content = pre + '\n' + ast.unparse(current) + '\n' + post
        formatted_content = FormatCode(final_content, style_config='pep8')[0]
    
    with open(page, 'w') as f:
        f.write(formatted_content)