
github_pat = "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"

repo_url = "https://github.com/SOURABH-SANGANWAR/commit_check_github.git"
import os
import git
from tempfile import mkdtemp


def clone_repo_and_commit(repo_url, pat_token, input_filename="input.txt", output_filename="inx.txt"):
    """
    Clones a Git repository, adds a file from the local directory, commits, and pushes changes.

    Args:
        repo_url (str): The URL of the Git repository to clone.
        pat_token (str): A Personal Access Token (PAT) for authentication (if needed).
        input_filename (str, optional): The name of the input file to add to the repository. Defaults to "input.txt".
        output_filename (str, optional): The name of the output file in the repository. Defaults to "inx.txt".

    Returns:
        bool: True if successful, False otherwise.
    """
    temp_dir = mkdtemp()
    # Create a temporary directory
    # with mkdtemp() as temp_dir: 
    if temp_dir: 
        try:
            # Clone the repository using GitPython
            new_repo_url = repo_url.replace("https://", f"https://{pat_token}@")
            repo = git.Repo.clone_from(new_repo_url, temp_dir)
            input_path = input_filename
            if os.path.exists(input_filename):
                # Rename input file to output filename within the repo
                output_path = os.path.join(temp_dir, output_filename)
                with open(input_path, "r") as input_file, open(output_path, "w") as output_file:
                    output_file.write(input_file.read())

                # Add the updated file to the staging area
                repo.index.add([output_path])

                # Commit changes with a descriptive message
                commit_message = f"Added {output_filename} from local directory"
                repo.index.commit(commit_message)

                # Push changes to the remote repository
                repo.remote().push()

                return True
            else:
                print(f"Input file '{input_filename}' not found in the local directory.")
                return False


        except Exception as e:
            print("errrrr")
            print(f"An error occurred: {e}")
            return False
    else: 
        print("Could not create temporary directory.")

    # If the temporary directory couldn't be created, return False
    return True

success = clone_repo_and_commit(repo_url, github_pat)

if success:
    print("Successfully cloned, committed, and pushed changes!")
else:
    print("An error occurred. Please check the logs fordetails.")
