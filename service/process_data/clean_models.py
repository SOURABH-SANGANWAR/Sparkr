from utils.generate_mapping import list_to_dict_mapping

def snake_to_camel_case(snake_str):
    components = snake_str.split('_')
    return ''.join(x.title() for x in components)

def get_cleaned_models(apps, tables):

    tables_not_deleted = [i for i in tables if i.get("status") != "deleted"]

    tables_dict = list_to_dict_mapping(tables_not_deleted)
    apps_dict = list_to_dict_mapping(apps)

    # add modelname and appname to tables
    for table in tables_not_deleted:
        table['dependencies'] = {}
        table['reverse_references'] = []
        table['model_name'] = snake_to_camel_case(table['name'])
        if table.get('appId'):
            table['app_name'] = apps_dict[table['appId']]['name']
        else:
            raise Exception(f"Invalid app Id in table {table['name']}. Check if app is deleted.")
        table['import_path'] = f'from {apps_dict[table["appId"]]["name"]}.models import {table["model_name"]}'

    # update references
    for table in tables_not_deleted:
        for field in table['fields']:
            if field['type'] in ['ForeignKey', 'OneToOneField', 'ManyToManyField']:
                reference_table_id = field['options']['to']
                reference_table = tables_dict.get(reference_table_id)
                if reference_table:
                    table['dependencies'][reference_table['model_name']] = reference_table['import_path']

                    field['options']['to'] = f'{reference_table["app_name"]}.{reference_table["model_name"]}'
                    related_name = field['options'].get('related_name')
                    if related_name == '' or related_name is None:
                        related_name =  f'{table["model_name"].lower()}_set'
                        field['options']['related_name'] = related_name

                    reference_table['reverse_references'].append({
                        'table': table['name'],
                        'field': field['options']['related_name']
                    })

                else: 
                    raise Exception(f"Reference table with id {reference_table_id} not found. Referred in table {table['name']}. Check if table is deleted.")
    return tables_not_deleted, [i for i in tables if i.get("status") == "deleted"]
