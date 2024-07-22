from utils.generate_mapping import list_to_dict_mapping

def fields_list_to_set(fields, name_key='name'):
    return set([field[name_key] for field in fields])

def validate_fields(table_fields, serializer_fields, serializer_name):
    table_fields_set = fields_list_to_set(table_fields)

    for field in serializer_fields:
        if field['type'] not in ['serializer-one', 'serializer-many']:
            if field['fieldName'] not in table_fields_set:
                raise Exception(f"Invalid field {field['fieldName']} in '{serializer_name}' serializer. Check if field is deleted or renamed in table")
        else:
            references = field['options']['source'].split('.')
            if references[0] not in table_fields_set:
                raise Exception(f"Invalid field source for {field['fieldName']} in '{serializer_name}' serializer. Check if field is deleted or renamed in table")





def get_cleaned_serializers(serializers, tables, apps):
    serializers_not_deleted = [i for i in serializers if i.get("status") != "deleted"]
    tables_dict = list_to_dict_mapping(tables)
    serializers_dict = list_to_dict_mapping(serializers_not_deleted)
    apps_dict = list_to_dict_mapping(apps)

    for serializer in serializers_not_deleted:
        serializer['dependencies'] = {
            "ModelSerializer": "from rest_framework import serializers"
        }
        app_name = apps_dict.get(serializer['appId'])
        if app_name:
            serializer['import_path'] = f'from {app_name["name"]}.serializers import {serializer["name"]}'
        else:
            raise Exception(f"App with id {serializer['appId']} not found")

    for serializer in serializers_not_deleted:
        table_id = serializer['tableId']
        table = tables_dict.get(table_id)

        if table:
            serializer['dependencies'][table['model_name']] = table['import_path']
            serializer['model_name'] = table['model_name']
            
            for field in serializer['fields']:
                field["options"]["read_only"] = field["options"]["read_only"] == 'true'
                field["options"]["write_only"] = field["options"]["write_only"] == 'true'
                if field['type'] in ['serializer-one', 'serializer-many']:
                    field_serializer_id = field['options']['serializer_id']
                    field_serializer = serializers_dict.get(field_serializer_id)
                    if field_serializer:
                        serializer['dependencies'][field_serializer['name']] = field_serializer['import_path']
                        field['options']['serializer_name'] = field_serializer['name']
                        field['options']['many'] = field['type'] == 'serializer-many'
                        field['options']['source'] = field['options']['source'] + ( '.all' if (field['type'] == 'serializer-many') else '')
                    else:
                        raise Exception(f"Serializer with id {field_serializer_id} not found")
        else:
            raise Exception(f"Table with id {table_id} not found")
    return serializers_not_deleted, [i for i in serializers if i.get("status") == "deleted"]