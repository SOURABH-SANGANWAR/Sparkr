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


def config_to_node(config, attributes):

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

    return configNode

def build_class_node(route):
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
        node = config_to_node(config, attributes)
        classNode.body.append(node)
    
    return classNode
        

def setup_routes(routes, app_name, directory):
    with open(f'{directory}/{app_name}/views.py', 'r') as f:
        content = f.read()

    imports = {}

    for route in routes:
        pre, current, post = find_variable_definition(content, route['name'])

        imports.update(route['dependencies'])

        class_node = build_class_node(route)

        content = pre + '\n' + ast.unparse(class_node) + '\n' + post
    
    content = check_imports(content, imports.keys(), imports.values())

    with open(f'{directory}/{app_name}/views.py', 'w') as f:
        f.write(content)
