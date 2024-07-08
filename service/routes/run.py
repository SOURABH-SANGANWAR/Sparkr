from utils.fetcher import find_variable_definition
import ast
from .utils import genrate_route_body
from utils.imports import check_imports

def url_to_attribute(url):
    # input url like '/users/<number:id>/hello/<slug:name>
    # return ['number', 'slug'], ['id', 'name']
    url = url.split('/')
    types = []
    names = []
    for i in range(len(url)):
        if url[0] == '<':
            parts = url[i].split(':')
            types.append(parts[0][1:])
            names.append(parts[1][:-1])
    return types, names


def config_to_node(config, imports, attributes):
    if config.get('serializer'):
        imports[config['serializer']] = config['serializer_import_path']

    arg_list = [ ast.Name(id='self', ctx=ast.Param()),
                ast.Name(id='request', ctx=ast.Param())]+ [ast.arg(arg=attr, annotation=None) for attr in attributes]

    
    configNode = ast.FunctionDef(
        name = config['method'].lower(),
        args = ast.arguments(
            args=arg_list,
            vararg=None,
            kwonlyargs=[],
            posonlyargs=[],
            defaults=[],
        ),
        decorator_list=[],
        body=[],
        lineno=0
    )

    body = genrate_route_body(config)
    configNode.body.append(body)

    return configNode, imports

def build_class_node(route, imports):
    classNode = ast.ClassDef(
        name=route['name'],
        bases=[ast.Name(id='APIView', ctx=ast.Load())],
        keywords=[],
        body=[],
        decorator_list=[],
        lineno=0
    )
    classNode.body.append(
        ast.Assign(
            targets=[ast.Name(id='authentication_classes', ctx=ast.Store())],
            value=ast.List(
                elts=[ast.Name(id='JWTAuthentication', ctx=ast.Load())],
                ctx=ast.Load()
            ),
            lineno=0
        )
    ),
    classNode.body.append(
        ast.Assign(
            targets=[ast.Name(id='queryset', ctx=ast.Store())],
            value=ast.parse(route['queryset']).body[0].value,
            lineno=0
        )
    ),

    _, attributes = url_to_attribute(route['path'])

    for config in route['route_configs']:
        node, imports = config_to_node(config, imports, attributes)
        classNode.body.append(node)
    
    return classNode, imports
        

def setup_routes(routes, app_name, directory):
    with open(f'{directory}/{app_name}/views.py', 'r') as f:
        content = f.read()

    imports = {
        "Rsponse": "from rest_framework.response import Response",
        "APIView": "from rest_framework.views import APIView",
        "status": "from rest_framework import status",
        "JWTAuthentication": "from rest_framework_simplejwt.authentication import JWTAuthentication",
        "Q" : "from django.db.models import Q",
        "IsAuthenticated": "from rest_framework.permissions import IsAuthenticated",
        "AllowAny": "from rest_framework.permissions import AllowAny",
        "verify_role_based_auth": "from utils.auth import verify_role_based_auth",
        "verify_user_based_auth": "from utils.auth import verify_user_based_auth",
    }

    for route in routes:
        pre, current, post = find_variable_definition(content, route['name'])
        imports[route['model']] = route['model_import_path']

        class_node, imports = build_class_node(route, imports)

        content = pre + '\n' + ast.unparse(class_node) + '\n' + post
    
    content = check_imports(content, imports.keys(), imports.values())

    with open(f'{directory}/{app_name}/views.py', 'w') as f:
        f.write(content)
    
    # Handle imports



