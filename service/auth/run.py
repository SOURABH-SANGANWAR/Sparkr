
import os
from .jwt import setup_jwt

def setup_auth(project, directory):
    if project['authenticationType'] == 'jwt':
        setup_jwt(project, directory)
    else:
        pass
        # setup_sessions(project, directory)