from utils.fetcher import find_variable_definition 
import ast
from utils.imports import check_imports

def get_previous_defs(patterns):
    definations = {}
    for pattern in patterns:
        path = pattern.args[0].value
        include = pattern.args[1].func.value.id
        definations[include] = path
    
    return definations

def update_urls(routes, app_name, directory):
    imports = {
        'path': 'from django.urls import path',
    }
    for route in routes:
        imports[route['name']]  = route['import_path']
    
    paths = {
        route['name']: route['path'] for route in routes
    }
    content = ''
    with open(f'{directory}/{app_name}/urls.py', 'r') as f:
        content = f.read()
    pre, current, post = find_variable_definition(content, 'urlpatterns')
    if not current:
        current = ast.parse('urlpatterns = []').body[0]
    body_of_urlpatterns = current.value.elts
    previous_defs = get_previous_defs(body_of_urlpatterns)
    for class_name, path in paths.items():
        if class_name not in previous_defs.keys():
            body_of_urlpatterns.append(
                ast.parse(f"path('{path}', {class_name}.as_view())").body[0].value
            )
            previous_defs[class_name] = path
        else:
            if previous_defs[class_name] != path:
                raise Exception(f"Path for {class_name} is already occupied with different pathname.")
    current.value.elts = body_of_urlpatterns
    if pre and pre[-1] != '\n':
        pre += '\n'
    if pre == None:
        pre = ''

    formatted_content = pre + ast.unparse(current) + post
    formatted_content = check_imports(formatted_content, imports.keys(), imports.values())
    with open(f'{directory}/{app_name}/urls.py', 'w') as f:
        f.write(formatted_content)


