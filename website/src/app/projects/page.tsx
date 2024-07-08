import  { Separator } from "@/components/ui/separator";
import ProjectsList from "@/app/projects/list_projects";
import CreateNewProject from "./create_new_project";
import createProject from "./create_project_server_action";

export default function Projects() {

    return (
        <div className="flex flex-col mt-3 mb-3 px-4 w-full">
            <div className="flex flex-row w-full">
                <h1 className="text-2xl flex-grow bold py-2">Projects</h1>
                <CreateNewProject createProject={createProject} className={"pl-2 pr-4 my-2 flex"}/>
            </div>
            <Separator />
            <ProjectsList />
        </div>
  )
}