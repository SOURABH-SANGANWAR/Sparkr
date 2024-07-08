from .generate_mapping import list_to_dict_mapping

def get_cleaned_serializers(serializers, tables, apps):
    tables_dict = list_to_dict_mapping(tables)
    serializers_dict = list_to_dict_mapping(serializers)
    apps_dict = list_to_dict_mapping(apps)

    for serializer in serializers:
        app_name = apps_dict.get(serializer['appId'])
        if app_name:
            serializer['import_path'] = f'from {app_name["name"]}.serializers import {serializer["name"]}'
        else:
            raise Exception(f"App with id {serializer['appId']} not found")

    for serializer in serializers:
        table_id = serializer['tableId']
        table = tables_dict.get(table_id)
        if table:
            serializer['table_import_path'] = table['import_path']
            serializer['model_name'] = table['model_name']
            for field in serializer['fields']:
                field["options"]["read_only"] = field["options"]["read_only"] == 'true'
                field["options"]["write_only"] = field["options"]["write_only"] == 'true'
                if field['type'] in ['serializer-one', 'serializer-many']:
                    field_serializer_id = field['options']['serializer_id']
                    field_serializer = serializers_dict.get(field_serializer_id)
                    if field_serializer:
                        field['options']['serializer_name'] = field_serializer['name']
                        field['options']['serializer_import_path'] = field_serializer['import_path']
                        field['options']['many'] = field['type'] == 'serializer-many'
                        field['options']['source'] = field['options']['source'] + ( '.all' if (field['type'] == 'serializer-many') else '')
                    else:
                        raise Exception(f"Serializer with id {field_serializer_id} not found")
        else:
            raise Exception(f"Table with id {table_id} not found")
    return serializers