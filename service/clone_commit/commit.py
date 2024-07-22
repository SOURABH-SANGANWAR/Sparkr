import git


def commit_repo( repo, commit_message ):
    try:
        repo.git.add(all=True)
        repo.index.commit(commit_message)
        origin = repo.remote(name='origin')
        origin.push()
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False