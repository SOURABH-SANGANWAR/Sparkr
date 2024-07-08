import ast

def auth(config, route_body):
    body = []
    if config['permission_type'] == 'role':
        body.append(
            ast.Assign(
                targets=[ ast.Tuple(elts=[ast.Name(id='auth', ctx=ast.Store()), ast.Name(id='queryset', ctx=ast.Store())], ctx=ast.Store())],

                value=ast.Call(
                    func=ast.Name(id='verify_role_based_auth', ctx=ast.Load()),
                    args=[
                        ast.Name(id='request', ctx=ast.Load()),
                        ast.List(elts=[ast.Constant(value=role) for role in config['permissions_roles']], ctx=ast.Load()),
                        ast.Name(id='self.queryset', ctx=ast.Load())
                    ],
                    keywords=[]
                ),
                lineno=0
            )
        )
    elif config['permission_type'] == 'user':
        body.append(
            ast.Assign(
                targets=[ ast.Tuple(elts=[ast.Name(id='auth', ctx=ast.Store()), ast.Name(id='queryset', ctx=ast.Store())], ctx=ast.Store())],
                value=ast.Call(
                    func=ast.Name(id='verify_user_based_auth', ctx=ast.Load()),
                    args=[
                        ast.Name(id='request', ctx=ast.Load()),
                        ast.List(elts=[ast.Constant(value=role) for role in config['permissions_user_relation_field']], ctx=ast.Load()),
                        ast.Name(id='self.queryset', ctx=ast.Load())
                    ],
                    keywords=[]
                ),
                lineno=0
            )
        )
    elif config['permission_type'] == 'none':
        body.append(
            ast.Assign(
                targets=[ ast.Tuple(elts=[ast.Name(id='auth', ctx=ast.Store()), ast.Name(id='queryset', ctx=ast.Store())], ctx=ast.Store())],
                value = ast.Tuple(elts=[ast.Constant(value=True), ast.Name(id='self.queryset', ctx=ast.Load())], ctx=ast.Load()),
                lineno=0
            )
        )
    else:
        raise Exception('Invalid permission type')
    body.append(
        ast.If(
            test=ast.Name(id='auth', ctx=ast.Load()),
            body= route_body,
            orelse=[
                # return Response({'error': 'Forbidden'}, status= status.HTTP_401_UNAUTHORIZED)
                ast.Return(
                    value = ast.Call(
                        func=ast.Name(id='Response', ctx=ast.Load()),
                        args=[
                            ast.Dict(keys=[ast.Constant(value='error')], values=[ast.Constant(value='Forbidden')]),
                            ast.Attribute(value=ast.Name(id='status', ctx=ast.Load()), attr='HTTP_401_UNAUTHORIZED', ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
            ]
        )
    )

    return body

def list_body(config):
    code_lines = [f"serialized_data = {config['serializer']}(queryset, many=True)",
                  f"return Response({{'data': serialized_data.data}}, status=status.HTTP_200_OK)"]
    code = '\n'.join(code_lines)
    return ast.parse(code).body

def create_body(config):
    code_lines = ["data = request.data",
                    f"serializer = {config['serializer']}(data)",
                    "if serializer.is_valid():",
                    "    serializer.save()",
                    "    return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)",
                    "else:",
                    "    return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)"]
    if config.get('auto_fields'):
        auto_field_assignments = [f"    serializer.validated_data['{key}'] = {value}" for key, value in config['auto_fields'].items()]
        code_lines = code_lines[:3] +auto_field_assignments + code_lines[3:]
        
    code = '\n'.join(code_lines)
    node = ast.parse(code).body
    return ast.parse(code).body

    body = []
    body.append(
        ast.Assign(
            targets=[ast.Name(id='data', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Attribute(value=ast.Name(id='request', ctx=ast.Load()), attr='data', ctx=ast.Load()),
                args=[],
                keywords=[]
            ),
            lineno=0
        )
    )
    if config['auto_fields']:
        for key, value in config['auto_fields'].items():
            body.append(
                ast.Assign(
                    targets=[ast.Attribute(value=ast.Name(id='data', ctx=ast.Load()), attr=key, ctx=ast.Store())],
                    value = ast.Name(id=value, ctx=ast.Load()),
                    lineno=0
                )
            )
    body.append(
        ast.Assign(
            targets=[ast.Name(id='serializer', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id=config["serializer"], ctx=ast.Load()),
                args=[ast.Name(id='data', ctx=ast.Load())],
                keywords=[]
            ),
            lineno=0
        )
    )
    body.append(
        ast.If(
            test=ast.Call(
                func=ast.Attribute(value=ast.Name(id='serializer', ctx=ast.Load()), attr='is_valid', ctx=ast.Load()),
                args=[],
                keywords=[]
            ),
            body=[
                ast.Assign(
                    targets=[ast.Name(id='serializer', ctx=ast.Store())],
                    value=ast.Call(
                        func=ast.Attribute(value=ast.Name(id='serializer', ctx=ast.Load()), attr='save', ctx=ast.Load()),
                        args=[],
                        keywords=[]
                    ),
                    lineno=0
                ),
                ast.Return(
                    value=ast.Call(
                        func=ast.Name(id='Response', ctx=ast.Load()),
                        args=[
                            ast.Dict(keys=[ast.Constant(value='data')], values=[ast.Name(id='serializer.data', ctx=ast.Load())]),
                            ast.Attribute(value=ast.Name(id='status', ctx=ast.Load()), attr='HTTP_201_CREATED', ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
            ],
            orelse=[
                ast.Return(
                    value=ast.Call(
                        func=ast.Name(id='Response', ctx=ast.Load()),
                        args=[
                            ast.Dict(keys=[ast.Constant(value='error')], values=[ast.Name(id='serializer.errors', ctx=ast.Load())]),
                            ast.Attribute(value=ast.Name(id='status', ctx=ast.Load()), attr='HTTP_400_BAD_REQUEST', ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
            ]
        )
    )
    return body

def update_body(config):
    body = []
    body.append(
        ast.Assign(
            targets=[ast.Name(id='data', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Attribute(value=ast.Name(id='request', ctx=ast.Load()), attr='data', ctx=ast.Load()),
                args=[],
                keywords=[]
            ),
            lineno=0
        )
    )
    if config['auto_fields']:
        for key, value in config['auto_fields'].items():
            body.append(
                ast.Assign(
                    targets=[ast.Attribute(value=ast.Name(id='data', ctx=ast.Load()), attr=key, ctx=ast.Store())],
                    value = ast.Name(id=value, ctx=ast.Load()),
                    lineno=0
                )
            )
    
    body.append(
        ast.Assign(
            targets=[ast.Name(id='instance', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Attribute(value=ast.Name(id='queryset', ctx=ast.Load()), attr='get', ctx=ast.Load()),
                args=[
                    ast.Assign(
                        targets=[ast.Name(id=config['id_field'], ctx=ast.Store())],
                        value = ast.Name(id= config['id_value'], ctx=ast.Load()),
                        lineno=0
                    )
                ],
                keywords=[]
            ),
            lineno=0
        )
    )
    body.append(
        ast.If(
            test=ast.UnaryOp(op=ast.Not(), operand=ast.Name(id='instance', ctx=ast.Load())),
            body = [
                ast.Return(
                    value=ast.Call(
                        func=ast.Name(id='Response', ctx=ast.Load()),
                        args=[
                            ast.Dict(keys=[ast.Constant(value='error')], values=[ast.Constant(value='Not Found')]),
                            ast.Attribute(value=ast.Name(id='status', ctx=ast.Load()), attr='HTTP_404_NOT_FOUND', ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
            ],
            orelse=[]
        )
    )
        
    body.append(
        ast.Assign(
            targets=[ast.Name(id='serializer', ctx=ast.Store())],
            value=ast.Call(
                func=ast.Name(id=config["serializer"], ctx=ast.Load()),
                args=[ast.Name(id='instance', ctx=ast.Load()), ast.Name(id='data', ctx=ast.Load())],
                keywords=[ast.keyword(arg='partial', value=ast.Constant(value=True))]
            ),
            lineno=0
        )
    )
    body.append(
        ast.If(
            test=ast.Call(
                func=ast.Attribute(value=ast.Name(id='serializer', ctx=ast.Load()), attr='is_valid', ctx=ast.Load()),
                args=[],
                keywords=[]
            ),
            body=[
                ast.Assign(
                    targets=[ast.Name(id='serializer', ctx=ast.Store())],
                    value=ast.Call(
                        func=ast.Attribute(value=ast.Name(id='serializer', ctx=ast.Load()), attr='save', ctx=ast.Load()),
                        args=[],
                        keywords=[]
                    ),
                    lineno=0
                ),
                ast.Return(
                    value=ast.Call(
                        func=ast.Name(id='Response', ctx=ast.Load()),
                        args=[
                            ast.Dict(keys=[ast.Constant(value='data')], values=[ast.Name(id='serializer.data', ctx=ast.Load())]),
                            ast.Attribute(value=ast.Name(id='status', ctx=ast.Load()), attr='HTTP_200_OK', ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
            ],
            orelse=[
                ast.Return(
                    value=ast.Call(
                        func=ast.Name(id='Response', ctx=ast.Load()),
                        args=[
                            ast.Dict(keys=[ast.Constant(value='error')], values=[ast.Name(id='serializer.errors', ctx=ast.Load())]),
                            ast.Attribute(value=ast.Name(id='status', ctx=ast.Load()), attr='HTTP_400_BAD_REQUEST', ctx=ast.Load())
                        ],
                        keywords=[]
                    )
                )
            ]
        )
    )
    return body




def genrate_route_body(config):
    routes = {
        'list': list_body,
        'create': create_body,
        'update': update_body,
        # 'delete': delete_body,
        # 'retrieve': retrieve_body
    }
    return routes[config['type']](config)

        


if __name__ == "__main__":
    config = {
            "name": "list_base_model",
            "type": "create",
            "method": "POST",
            "permission_type": "role",
            "permissions_user_relation_field": ['user__id'],
            "permissions_roles": ["admin", "user"],
            "queryset": "BaseModel.objects.all()",
            "serializer": "BaseModelSerializer",
            "auto_fields": {
                "owner": "request.user.id",
                "draft": "True",
            },
            # Added by cleaner
            "serializer_import_path": "from app1.serializers import BaseModelSerializer",
            "id_field": "id",
            "id_value": "data.get('id')"
        }
    temp = [
                ast.Return(
                    value=ast.Name(id='queryset', ctx=ast.Load())
                )
            ]
    body = genrate_route_body(config)
    code = auth(config, body)
    with open('test.py', 'w') as f:
        f.write(ast.unparse(code) + '\n')
        # for line in create_body(config):
        #     f.write(ast.unparse(line) + '\n')
    # create_body(config)