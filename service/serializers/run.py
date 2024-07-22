from utils.fetcher import find_variable_definition
import ast
from yapf.yapflib.yapf_api import FormatCode
from utils.imports import check_imports

def field_to_node(field):
    field_name = field['fieldName']
    field_type = field['type']
    field_node = None
    if field_type != 'default':
        field_node = ast.Assign(
            targets=[ast.Name(id=field_name, ctx=ast.Store())],
            value=ast.Call(
                func = ast.Name(id=field['options']['serializer_name'], ctx=ast.Load()),
                args=[],
                keywords=[
                    ast.keyword(arg='many', value=ast.Constant(value=field['options']['many'])),
                    ast.keyword(arg='read_only', value=ast.Constant(value=field['options']['read_only'])),
                    ast.keyword(arg='source', value=ast.Constant(value=field['options']['source']))
                ]
            ),
            lineno=0
        )
    return field_node, ast.Constant(value=field_name, ctx = ast.Load())

def generate_serializer_node(serializer):
    print(serializer)
    serializer_node = ast.ClassDef(
        name=serializer['name'],
        bases=[ast.Name(id='serializers.ModelSerializer', ctx=ast.Load())],
        keywords=[],
        body=[],
        decorator_list=[],
        lineno=0
    )

    default_fields = []

    for field in serializer['fields']:
        field_node, field_name = field_to_node(field)
        if field_node:
            serializer_node.body.append(field_node)
        default_fields.append(field_name)
    
    metaNode = ast.ClassDef(
        name='Meta',
        bases=[],
        keywords=[],
        body=[
            ast.Assign(
                targets=[ast.Name(id='model', ctx=ast.Store())],
                value=ast.Name(id=serializer['model_name'], ctx=ast.Load()),
                lineno=0
            ),
            ast.Assign(
                targets=[ast.Name(id='fields', ctx=ast.Store())],
                value=ast.List(elts=default_fields, ctx=ast.Load()),
                lineno=0
            )
        ],
        decorator_list=[],
        lineno=0
    )
    serializer_node.body.append(metaNode)

    return serializer_node


def add_serializer(serializers, app_name ,directory):
    path = f'{directory}/{app_name}/serializers.py'
    with open(path, 'r') as file:
        content = file.read()
    
    imports = {}

    for serializer in serializers:
        imports.update(serializer['dependencies'])
        serializer_node = generate_serializer_node(serializer)
        pre, current, post = find_variable_definition(content, serializer['name'])
        content = pre + '\n' + ast.unparse(serializer_node) + '\n' + post
    
    content = check_imports(content, list(imports.keys()), list(imports.values()))

    # formatted_content = FormatCode(content, style_config='pep8')[0]

    with open(path, 'w') as file:
        file.write(content)