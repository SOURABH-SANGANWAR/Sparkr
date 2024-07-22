import ast

def find_variable_definition(code, var_name):
    try:
        # Create an AST representation of the code
        tree = ast.parse(code)

        # Visitor class to track variable assignments and declaration locations
        class VariableVisitor(ast.NodeVisitor):
            def __init__(self, var_name, code):
                self.var_name = var_name
                self.pre = code
                self.var_code = None
                self.post = ""
                self.found = False
                self.updated_post = False

            def visit_Assign(self, node):
                for target in node.targets:
                    if target.id == self.var_name:
                        self.var_code = node
                        self.found = True
                        self.pre = "\n".join(code.splitlines()[:node.lineno - 1])
                        self.post = "\n".join(code.splitlines()[node.end_lineno:])

            def visit_FunctionDef(self, node):
                if node.name == self.var_name:
                    self.var_code = node
                    self.found = True
                    self.pre = "\n".join(code.splitlines()[:node.lineno - 1])
                    self.post = "\n".join(code.splitlines()[node.end_lineno:])


            def visit_ClassDef(self, node):
                if node.name == self.var_name:
                    self.var_code = node
                    self.found = True
                    self.pre = "\n".join(code.splitlines()[:node.lineno - 1])
                    self.post = "\n".join(code.splitlines()[node.end_lineno:])
            
            def visit_Import(self, node):
                for name in node.names:
                    if name.name == self.var_name:
                        self.var_code = node
                        self.found = True
                        self.pre = "\n".join(code.splitlines()[:node.lineno - 1])
                        self.post = "\n".join(code.splitlines()[node.end_lineno:])
                
            def visit_ImportFrom(self, node):
                for name in node.names:
                    if name.name == self.var_name:
                        self.var_code = node
                        self.found = True
                        self.pre = "\n".join(code.splitlines()[:node.lineno - 1])
                        self.post = "\n".join(code.splitlines()[node.end_lineno:])
                

        # Create the visitor instance and traverse the AST
        visitor = VariableVisitor(var_name, code)
        visitor.visit(tree)

        return visitor.pre, visitor.var_code, visitor.post


    except Exception as e:
        # Handle potential code errors
        return "", "", f"Error parsing code: {str(e)}"
    
if __name__ == "__main__":
    with open("F:\\projects\\backend-developer-tool\\backend\\test\\rest_framework_template\\settings.py", "r") as f:
        code = f.read()
        pre, current, post = find_variable_definition(code, "timedelta")
        with open("F:\\projects\\backend-developer-tool\\backend\\test\\rest_framework_template\\pre.py", "w") as f:
            f.write(pre)
        with open("F:\\projects\\backend-developer-tool\\backend\\test\\rest_framework_template\\current.py", "w") as f:
            if current:
                f.write(ast.unparse(current))
        with open("F:\\projects\\backend-developer-tool\\backend\\test\\rest_framework_template\\post.py", "w") as f:
            f.write(post)