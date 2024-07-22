from tasks import long_running_task, make_commit, init_repo
from celery.result import AsyncResult
from flask import request,jsonify 
from flask_app import flask_app 

app = flask_app

@app.route('/create-task', methods=['POST'])
def create_task():
    task = long_running_task.apply_async()
    return jsonify({'task_id': task.id}), 202

@app.route('/task-status/<task_id>', methods=['GET'])
def task_status(task_id):
    task = long_running_task.AsyncResult(task_id)
    response = {
        'task_id': task.id,
        'task_status': task.status,
        'task_result': task.result
    }
    return jsonify(response), 200

@app.route('/commit', methods=['POST'])
def commit():
    data = request.json
    task = make_commit.apply_async(args=[data['repo_url'], data['commit_message'], data['apps'], data['models'], data['serializers'], data['routes'], data['project']])
    return jsonify({'task_id': task.id}), 202


@app.route('/commit-status/<task_id>', methods=['GET'])
def commit_status(task_id):
    task = make_commit.AsyncResult(task_id)
    response = {
        'task_id': task.id,
        'task_status': task.status,
        'task_result': task.result
    }
    return jsonify(response), 200

@app.route('/init-repo', methods=['POST'])
def init_repo_route():
    data = request.json
    task = init_repo.apply_async(args=[data['repo_url']])
    return jsonify({'task_id': task.id}), 202

@app.route('/init-repo-status/<task_id>', methods=['GET'])
def init_repo_status(task_id):
    task = init_repo.AsyncResult(task_id)
    response = {
        'task_id': task.id,
        'task_status': task.status,
        'task_result': task.result
    }
    return jsonify(response), 200

if __name__ == "__main__":
    flask_app.run()
