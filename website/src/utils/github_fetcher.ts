"use server";

import { auth } from "@/lib/auth";

export default async function GithubApiFetcher(url: string, headers: any, method: string = "GET", body: any = null, params: any = null) {
    const session = await auth();
    let new_url = new URL(url);

    if (params) {
        new_url.search = new URLSearchParams(params).toString();
    }

    if (!session) {
        throw new Error("Not authenticated");
    }
    const response = await fetch( new_url.toString(), {
        method: method,
        headers: {
            ...headers,
            
            "Accept": "application/vnd.github.v3+json",
            "Authorization": `Bearer ${session.user.token.access_token}`
        },
        body: body
    });

    console.log("GIthub obj response: ", response.body, " url ", new_url.toString(), " method ", method);
    if(response.body === null) {
        return null;
    }
    return response;
}