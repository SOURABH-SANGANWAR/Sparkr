"use server";

import Project from "@/models/Project";
import { SetProject } from "@/context/project_name";
type Props = {
    params: {
        project_id: string
    }
}

export default async function page({ params }: Props) {

  const project: ProjectType | null = await Project.findOne({ _id: params.project_id });

  if (!project) {
    return {
      status: 404,
      data: { message: "Project not found" }
    }
  }

  return (
    <div>
      <SetProject projectName={project.name} />
      <p>{project.description}</p>
      <div className="flex flex-row">
        {project.apps.map(app => (
          <div key = {app.name}>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
          </div>
        ))}
      </div>

    </div>
  )
}