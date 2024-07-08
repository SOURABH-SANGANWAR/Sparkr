from .fetcher import find_variable_definition

def check_imports(content, imports, paths):
    
    for imp, path  in zip(imports, paths):
        _, current, _ = find_variable_definition(content, imp)
        if not current:
            content = f'{path}\n' + content
    return content