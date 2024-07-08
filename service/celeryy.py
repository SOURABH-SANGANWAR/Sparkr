
from auth.run import setup_auth
from routes.run import setup_routes
from app.run import setup_apps
from models.run import create_models
from serializers.run import add_serializer
from utils.clean_tables import get_tables_with_foreign_key_references_updated
from utils.clean_serializers import get_cleaned_serializers


# app = Celery('my_app', broker='redis://localhost:6379/0')  # Replace with your broker if needed

tables = [{"_id":"668023afba1b7aa3f2753690", "appId":"1","name":"cars","projectId":"66757d94c4e9f71d1902878c","fields":[{"name":"id","type":"AutoField","options":{},"_id":"668023afba1b7aa3f2753691"},{"name":"name","type":"CharField","options":{"max_length":"256"},"_id":"668023afba1b7aa3f2753692"},{"name":"owner","type":"ManyToManyField","options":{"to":"667df6a376c211c2de0a7d52"},"_id":"66802438ba1b7aa3f27536cd"},{"name":"carer","type":"ManyToManyField","options":{"to":"667df6a376c211c2de0a7d52", "related_name": "cars"},"_id":"6680bf9ca0eb2d74ce80e1b4"},{"name":"buying_date","type":"DateField","options":{"auto_now":"true"},"_id":"6680c371a0eb2d74ce80e345"},{"name":"value","type":"IntegerField","options":{},"_id":"6680eca2a0eb2d74ce80e6d4"},{"name":"nanu","type":"AutoField","options":{},"_id":"6680ecbda0eb2d74ce80e6ee"},{"name":"basu","type":"AutoField","options":{},"_id":"6680ecffa0eb2d74ce80e727"}],"createdAt":"2024-06-29T15:09:35.659Z","updatedAt":"2024-06-29T15:09:35.659Z","__v":0, "status":"commited"},
          {"_id":"667df6a376c211c2de0a7d52","name":"user","appId":"2", "projectId":"66757d94c4e9f71d1902878c","fields":[{"name":"id","type":"AutoField","options":{},"_id":"667df6a376c211c2de0a7d53"},{"name":"name","type":"CharField","options":{"max_length":"256"},"_id":"667df6a376c211c2de0a7d54"},{"name":"nana","type":"OneToOneField","options":{"to":"668023afba1b7aa3f2753690"},"_id":"6680c05aa0eb2d74ce80e1e3"},{"name":"care_taker","type":"OneToOneField","options":{"to":"668023afba1b7aa3f2753690"},"_id":"66833e0d15cac581a948cfa4"}],"createdAt":"2024-06-27T23:32:51.416Z","updatedAt":"2024-06-27T23:32:51.416Z","__v":0, "status":"updated"},]

serializers = [
    {
        "_id": "2",
        "appId": "2",
        "tableId": "667df6a376c211c2de0a7d52",
        "name": "UserSerializer",
        "status": "updated",
        "fields": [
            {
                "fieldName": "id",
                "type": "default",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                },
            },
            {
                "fieldName": "name",
                "type": "default",
                "options": {
                    "read_only": 'false',
                    "write_only": 'false',
                },
            },
            {
                "fieldName": "Nana",
                "type": "serializer-one",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                    "serializer_id": "1",
                    "source": "user_set",
                },
            },
            {
                "fieldName": "CareTaker",
                "type": "serializer-one",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                    "serializer_id": "1",
                    "source": "user_set",
                },
            }
        ],
    },
    {
        "_id": "1",
        "appId": "1",
        "tableId": "668023afba1b7aa3f2753690",
        "name": "CarSerializer",
        "status": "updated",
        "fields": [
            {
                "fieldName": "id",
                "type": "default",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                },
            },
            {
                "fieldName": "name",
                "type": "default",
                "options": {
                    "read_only": 'false',
                    "write_only": 'false',
                },
            },
            {
                "fieldName": "Owner",
                "type": "serializer-many",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                    "serializer_id": "2",
                    "source": "owner",
                },
            },
            {
                "fieldName": "Carer",
                "type": "serializer-many",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                    "serializer_id": "2",
                    "source": "carer",
                },
            },
            {
                "fieldName": "basu",
                "type": "default",
                "options": {
                    "read_only": 'true',
                    "write_only": 'false',
                },
            }
        ],
    }
]


routes = [ {
    "name": "BaseModelView", # CamelCase
    "app_name": "app1", # CamelCase 
    "authentications": ["JWTAuthentication"], # CamelCase
    "path" : "/<int:id>", # kebab-case,
    "model": "BaseModel", # CamelCase
    # Added by cleaner
    "model_import_path": "from app1.models import BaseModel", 
    "queryset": "BaseModel.objects.all()", # CamelCase
    "route_configs" : [
        {
            "name": "list_base_model",
            "type": "list",
            "method": "GET",
            "permission_type": "user",
            "permissions_user_relation_field": ['user__id'],
            "queryset": "BaseModel.objects.all()",
            "serializer": "BaseModelSerializer",
            # Added by cleaner
            "serializer_import_path": "from app1.serializers import BaseModelSerializer"
        },
        {
            "name": "create_base_model",
            "type": "create",
            "method": "POST",
            "permission_type": "role",
            "permissions_roles": ["admin", "user"],
            "auto_fields": {
                "owner": "request.user.id",
                "draft": "True",
            },
            "serializer": "BaseModelSerializer",
            "serializer_import_path": "from app1.serializers import BaseModelSerializer",
        },
        {
            "name": "update_base_model",
            "type": "update",
            "method": "PUT",
            "permission_type": "user",
            "permissions_user_relation_field": ['user__id'],
            "queryset": "BaseModel.objects.all()",
            "serializer": "BaseModelSerializer",
            "serializer_import_path": "from app1.serializers import BaseModelSerializer",
            "auto_fields": {
                "owner": "request.user.id",
                "draft": "True",
            },
            "id_field": "id",
            "id_value": "id"
        },
        {
            "name": "delete_base_model",
            "type": "delete",
            "method": "DELETE",
            "permission_type": "user",
            "permissions_user_relation_field": ['user__id'],
            "queryset": "BaseModel.objects.all()",
            "id_value": "request.data.id",
            "id_field": "id"

        },
        {
            "name": "retrieve_base_model",
            "type": "retrieve",
            "method": "GET",
            "permission_type": "user",
            "permissions_user_relation_field": ['user__id'],
            "queryset": "BaseModel.objects.all()",
            "serializer": "BaseModelSerializer",
            "serializer_import_path": "from app1.serializers import BaseModelSerializer",
            "id_value": "request.data.id",
            "id_field": "id"
        }
    ],
}
]

# @app.task(bind=True)
def make_changes(self, repo_url, changes):
    apps = [{"name": "app1", "path": "app1", "_id":"1"}, {"name": "app2",  "path": "app2", "_id":"2" }]
    directory = 'F:\\projects\\backend-developer-tool\\backend\\test'
    project = {
        "name": "test",
        "authenticationType": "jwt",
        "authConfig": {
            "algorithm": "HS256",
            "accessExpiration": 3600,
            "refreshExpiration": 604800,
            "rotate": False,
            "blacklist": False,
        },
    }
    # self.update_state(state='PROGRESS', meta={'status': 'Setting up auth'})
    setup_auth(project, directory)
    # self.update_state(state='PROGRESS', meta={'status': 'Setting up apps'})
    setup_apps(apps, directory)
    # self.update_state(state='PROGRESS', meta={'status': 'Setting up models'})
    new_tables = get_tables_with_foreign_key_references_updated(apps, [i for i in tables if i.get("status") != "deleted"])
    for app in apps:
        create_models([i for i in new_tables if (i['appId'] == app['_id'] and i.get("status") != "commited")], app['name'], directory)
    # self.update_state(state='PROGRESS', meta={'status': 'Setting up serializers'})
    cleaned_serializers = get_cleaned_serializers([i for i in serializers if i.get("status") != "deleted"], new_tables, apps)
    for app in apps:
        add_serializer([i for i in cleaned_serializers if i['appId'] == app['_id']], app['name'], directory)
    
    for app in apps:
        setup_routes([i for i in routes if i['app_name'] == app['name']], app['name'], directory)
    



make_changes(None, None, None)

