from utils.generate_mapping import list_to_dict_mapping

def get_cleaned_routes(serializers, tables, apps, routes):
    routes_not_deleted = [i for i in routes if i.get("status") != "deleted"]
    tables_dict = list_to_dict_mapping(tables)
    serializers_dict = list_to_dict_mapping(serializers)
    apps_dict = list_to_dict_mapping(apps)

    for route in routes_not_deleted:
        app = apps_dict.get(route['appId'])
        route['dependencies'] = {
            "Response": "from rest_framework.response import Response",
            "APIView": "from rest_framework.views import APIView",
            "status": "from rest_framework import status",
            "JWTAuthentication": "from rest_framework_simplejwt.authentication import JWTAuthentication",
            "Q" : "from django.db.models import Q",
            "IsAuthenticated": "from rest_framework.permissions import IsAuthenticated",
            "AllowAny": "from rest_framework.permissions import AllowAny",
            "verify_role_based_auth": "from utils.auth import verify_role_based_auth",
            "verify_user_based_auth": "from utils.auth import verify_user_based_auth",
        }
        if app:
            route['import_path'] = f'from {app["name"]}.views import {route["name"]}'
            route['app_name'] = app['name']
        else:
            raise Exception(f"App with id {route['appId']} not found")
        
        modelId = route['modelId']
        table = tables_dict.get(modelId)
        if table:
            route['dependencies'][table['model_name']] = table['import_path']
            route['model_name'] = table['model_name']
        else:
            raise Exception(f"Table with id {modelId} not found")
        
        for config in route['route_configs']:
            if 'serializerId' not in config:
                continue
            serializer = serializers_dict.get(config.get('serializerId'))
    
            if serializer:
                if serializer['tableId'] != modelId:
                    raise Exception(f"Serializer with id {config['serializerId']} is not for model {table['name']}") 
                route['dependencies'][serializer['name']] = serializer['import_path']
                config['serializer'] = serializer['name']
            else:
                raise Exception(f"Serializer with id {config['serializerId']} not found")
            
    return routes_not_deleted, [i for i in routes if i.get("status") == "deleted"]