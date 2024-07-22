import { auth } from "@/lib/auth";
import Project from "@/models/Project";
import Commiting from "./commiting";
import updateProjectStatus  from "./commit_server_action";

export default async function ProjectLayout({
    children,
    params
}: Readonly<{
    children: React.ReactNode;
    params: {
        project_id: string;
    };
}>) {
    const session = await auth();
    if (!session) {
        return <div className="flex flex-col items-center justify-center w-full">
            <div className="text-lg">{"You are not authenticated."}</div>
            <div className="text-sm">Please login to access the project.</div>
        </div>
    }
    const project = await Project.findOne({ _id: params.project_id, owner: session.user?._id});


    if (!project) {
        return <div className="flex flex-col items-center justify-center w-full">
            <div className="text-lg">{"Project not found or you don't have access to this project."}</div>
            <div className="text-sm">Please check the url and try again.</div>
        </div>
    }


    if (project.status !== "commited") {
        return (
            <Commiting project_name={project.name} task_id={project.taskId} stat={project.status} server_action={updateProjectStatus} project_id={project._id} />
        )
    }


    return (
        <>
            {children}
        </>
    );
}