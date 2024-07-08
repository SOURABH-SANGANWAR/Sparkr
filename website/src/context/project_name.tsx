"use client";

import { createContext, useState, useContext } from 'react';

const ProjectContext = createContext<{ projectName: string, setProjectName: (projectName: string) => void }>({
    projectName: "",
    setProjectName: () => { }
});

const ProjectNameProvider = ({ children }: { children: React.ReactNode }) => {
    const [projectName, setProjectName] = useState<string>("");
    return (
        <ProjectContext.Provider value={{projectName, setProjectName}}>
            {children}
        </ProjectContext.Provider>
    )
}

function SetProject( {projectName}: {projectName: string}) {
    const {setProjectName} = useContext(ProjectContext);
    setProjectName(projectName);
    return null;
}


export { ProjectContext, ProjectNameProvider,SetProject };


