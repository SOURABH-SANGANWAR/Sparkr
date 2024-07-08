from .generate_mapping import list_to_dict_mapping

def snake_to_camel_case(snake_str):
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

def get_tables_with_foreign_key_references_updated(apps, tables):
    tables_dict = list_to_dict_mapping(tables)
    apps_dict = list_to_dict_mapping(apps)

    for table in tables:
        table['reverse_references'] = []
        table['model_name'] = snake_to_camel_case(table['name'])
        table['import_path'] = f'from {apps_dict[table["appId"]]["name"]}.models import  {table["model_name"]}'
    
    for table in tables:
        for field in table['fields']:
            if field['type'] in ['ForeignKey', 'OneToOneField', 'ManyToManyField']:
                reference_table_id = field['options']['to']
                reference_table = tables_dict.get(reference_table_id)
                if reference_table:
                    app_id = reference_table['appId']
                    app = apps_dict.get(app_id)
                    field['options']['to'] = f'{app["name"]}.{reference_table["model_name"]}'
                    related_name = field['options'].get('related_name')
                    if related_name == '' or related_name is None:
                        related_name =  f'{table["model_name"].lower()}_set'
                        field['options']['related_name'] = related_name

                    reference_table['reverse_references'].append({
                        'table': table['name'],
                        'field': field['options']['related_name']
                    })

                else: 
                    raise Exception(f"Reference table with id {reference_table_id} not found")
    
    return tables
