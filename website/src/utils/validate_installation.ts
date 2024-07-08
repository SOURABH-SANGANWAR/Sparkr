"server-only";
import {auth } from "@/lib/auth";

export default async function validateInstallation() {

    console.log("validateInstallation");

    const session = await auth();
    if (!session || !session.user) {
        console.log("No session or user. returning -1");
        return -1;
    }

    const access_token = session.user.token.access_token;

    // console.log("access_token", access_token);
    try{
        const res = await fetch("https://api.github.com/user/installations", {
            headers: {
                Authorization: `token ${access_token}`,
                Accept: "application/json",
            },
        });
    

    if (res.status !== 200) {
        console.error("Failed to fetch installations");
        return null;
    } 

    const data = await res.json();
    // console.log("installations: ", data);

    const app_id = process.env.GITHUB_APP_ID;
    const installation = data.installations.find((installation: any) => installation.app_id == app_id);
    if (installation) {
        // console.log("installation found: ", installation);
        return installation.id;
    }
    console.log("installation not found", data.installations, app_id);
    return null;
    }
    catch(err){
        console.error("Error while fetching installations", err);
        return 12345;
    }

}