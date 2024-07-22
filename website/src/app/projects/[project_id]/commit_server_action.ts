"use server";

import Project  from "@/models/Project";

export default async function updateProjectStatus(project_id: string, status: string) {
    const project = await Project.findOne({ _id: project_id });
    if (!project) {
        throw new Error("Project not found");
    }
    project.status = "commited";
    await project.save();
}
