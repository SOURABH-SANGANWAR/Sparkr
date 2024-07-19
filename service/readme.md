This is a service worker to manage repository code based on request.

Built using Python AST trees for code generation, Flask for API and Celery to manage workers to create and push code to repository.

Steps: 

1. Create a virtual encironment
''' python -m venv myenv '''

2. Activate environment
''' source myenv/bin/activate '''

3. Install requirements
'''pip install -r requirements.txt'''    

4. Run celery worker
'''celery -A tasks worker --pool=solo -l info'''

5. Run flask app
'''python run.py''' 