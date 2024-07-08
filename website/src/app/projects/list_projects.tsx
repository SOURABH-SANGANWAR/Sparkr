import Project from "@/models/Project";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProjectCard from "./project_card";

export default async function ProjectsList() {
    const session = await auth();
    if (!session || !session.user) {
        redirect("/auth/github/login");
    }
    const user_id = session.user._id;
    const user_name = session.user.github_username;
    const projects = await Project.find({ owner: user_id });

    return (
        <>
        {projects.length == 0 && 
            <div className="flex flex-grow flex-col items-center justify-center w-full">
                <div className="text-lg">Hi {user_name?.toLocaleLowerCase()}! Start creating your first project. </div>
                <div className="text-sm" >Click Create New button to get started.</div>
            </div>
        }
        <div className= "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
            ))}
        </div>

    </>
  )
}