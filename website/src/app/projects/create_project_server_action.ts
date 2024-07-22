"use server";

import Project  from "@/models/Project";
import { auth } from "@/lib/auth";
import GithubApiFetcher from "@/utils/github_fetcher";

type ProjectData = {
    name: string,
    description: string,
    framework: string,
    database: string,
    authenticationType: string,
    repositoryName: string
}

export default async function createProject(data: ProjectData) {
    const session = await auth();
    if (!session) {
        throw new Error("Not authenticated");
    }

    // create github repository
    const url = "https://api.github.com/user/repos";
    const response = await GithubApiFetcher(url, {}, "POST", JSON.stringify({
        name: data.repositoryName,
        description: data.description,
        private: true
    }));

    if (!response || response.status !== 201) {
        console.log("github response error", response);
        throw new Error("Github repository not created. Please check if repository with same name already exists.");
    }

    const response_json = await response.json();

    try{
        if (!process.env.GITHUB_ACCOUNT_USERNAME){
            throw new Error("GITHUB_ACCOUNT_USERNAME is not given in environment to add as collabarator!!")
        }
        const account_username = process.env.GITHUB_ACCOUNT_USERNAME
        const collabarator_url = `${response_json.url}/collaborators/${account_username}`; 

        const collabarator_response = await GithubApiFetcher(collabarator_url, {}, "PUT", JSON.stringify({
            permission: "write"
        }));

        if (!collabarator_response || collabarator_response.status !== 201) {
            console.log("github collabarator response error", collabarator_response);
            throw new Error("Unable to add collabarator to the repository. Please try again later.");
        }

        const collabarator_response_json = await collabarator_response.json();
        console.log("collabarator_response_json", collabarator_response_json);

        const collabaration_accept_url = collabarator_response_json.url;

        const collabaration_accept_response = await fetch(collabaration_accept_url, {
            method: "PATCH",
            headers: {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `Bearer ${process.env.GITHUB_COLLABARATOR_ACCESS_TOKEN}`
            }
        });

        if (!collabaration_accept_response || collabaration_accept_response.status !== 204) {
            console.log("github collabaration_accept_response error", collabaration_accept_response);
            const coll_response = await collabarator_response.json();
            console.log("coll_response", coll_response); 
            throw new Error("Unable to accept collabaration to the repository. Please try again later.");
        }

        // Get service URL from environment
        const service_url = process.env.NEXT_PUBLIC_SERVICE_URL;
        if (!service_url){
            throw new Error("SERVICE_URL is not given in environment to add as webhook!!")
        }

        const response = await fetch(`${service_url}/init-repo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                repo_url: response_json['html_url'],
            })
        });

        const service_response_data = await response.json();

        if (!response || response.status !== 202) {
            console.log("Unable to load template", response);
            throw new Error("Unable to load template. Please try again later. Check console for full log.");
        }
        console.log("service_response_data", service_response_data);

        const project = new Project({
            name: data["name"],
            description: data["description"],
            framework: data["framework"],
            githubRepositoryUrl: response_json.html_url,
            githubRepositoryId: response_json.id,
            githubRepositoryApiUrl: response.url,
            database: data["database"],
            authenticationType: data["authenticationType"],
            owner: session.user._id,
            status: "creating",
            taskId: service_response_data.task_id
        });
        
        await project.save();

        if (!project){
            throw new Error("Project not created");
        }
    }
    catch (error : any) {
        // delete the repository if project creation fails
        const delte_repo_response = await GithubApiFetcher(response_json.url, {}, "DELETE");
        console.log("delete_repo_response", delte_repo_response);
        throw error;
    }

}