from utils.fetcher import find_variable_definition
import ast
from yapf.yapflib.yapf_api import FormatCode

def snake_to_camel_case(snake_str):
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

def check_imports(content, imports, paths):
    for imp, path  in zip(imports, paths):
        _, current, _ = find_variable_definition(content, imp)
        if not current:
            content = f'{path}\n' + content
    return content

field_option_data_types = {
    'max_length': 'number',
    "auto_now_add": 'boolean',
    "auto_now": 'boolean',
    "max_digits": 'number',
    "decimal_places": 'number'
}

def arg_value_with_type(field_option, field_value):
    type = field_option_data_types.get(field_option)
    if type == 'number':
        return ast.Constant(value=int(field_value))
    elif type == 'boolean':
        return ast.Constant(value=field_value == 'true')
    else:
        return ast.Constant(value=field_value)



def field_args_ast_node(options):
    field_args = []
    for option in options.items():
        field_args.append(ast.keyword(arg=option[0], value=arg_value_with_type( option[0], option[1] )))
    return field_args

def ast_field_node(field):
    field_name = field['name']
    field_type = field['type']
    field_options = field['options']
    field_args = field_args_ast_node(field_options)
    field_node = ast.Assign(
        targets=[ast.Name(id=field_name, ctx=ast.Store())],
        value=ast.Call(
            func=ast.Attribute(
                value=ast.Name(id='models', ctx=ast.Load()),
                attr=field_type,
                ctx=ast.Load()
            ),
            args=field_args,
            keywords=[]
        ),
        lineno=0
    )
    return [field_node]

def create_models(models, app_name, directory, state_variable, mutex, task, task_id):
    try:
        with open(f'{directory}/{app_name}/models.py', 'r') as f:
            content = f.read()

        # Check if models are imported from django.db
        content = check_imports(content, ['models'], ['from django.db import models'])

        for model in models:
            
            modelName = snake_to_camel_case(model['name'])
            # Check if model already exists. Helps to replace that code.
            pre, current, post = find_variable_definition(content, modelName)
            if pre == '' and current == '':
                raise Exception(f"Model {modelName} not found in models.py")
            # create model
            model_node = generate_model_code(model, modelName)
            # update code
            content = pre + '\n' + ast.unparse(model_node) + '\n' + post
        
        formatted_content = FormatCode(content, style_config='pep8')[0]

        with open(f'{directory}/{app_name}/models.py', 'w') as f:
            f.write(formatted_content)
        
        with mutex:
            state_variable['app_code_status'][app_name]['models'] = True
            task.update_state(task_id = task_id, state='PROGRESS', meta=state_variable)
    except Exception as e:
        with mutex:
            state_variable['app_code_status'][app_name]['models'] = str(e)
            state_variable['error_state'] = f'app_code_status,{app_name},models'
            task.update_state(task_id = task_id, state='PROGRESS', meta=state_variable)

    

def generate_model_code(table, modelName):
    model_node = ast.ClassDef(name=modelName, bases=[
        ast.Attribute(
            value=ast.Name(id='models', ctx=ast.Load()),
            attr='Model',
            ctx=ast.Load()
        )
    ], keywords=[], decorator_list=[], body=[])
    model_node.body = []
    for field in table['fields']:
        nodes = ast_field_node(field)
        for node in nodes:
            model_node.body.append(node)
    return model_node

