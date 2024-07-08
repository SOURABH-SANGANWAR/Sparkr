"use client";

import React from 'react'
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

type Props = {
    project : any
}

export default function ProjectCard({project}: Props) {

    const handleClick = () => {
        window.location.href = `/projects/${project._id}`;
    }

  return (
    <div onClick={handleClick} className="rounded-lg border p-3 shadow-md hover:shadow-lg block">
        <div className="flex flex-row py-1">
            <h2 className="flex flex-grow text-lg font-semibold">{project.name}</h2>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <a href={project.githubRepositoryUrl} rel="noreferrer">
                                <GitHubLogoIcon className="h-6 w-6" />
                            </a>
                        </TooltipTrigger>
                        <TooltipContent side="top">View on Github</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
            <div className="flex flex-row">
                <Badge className = "mr-2 py-1 hover:shadow" variant={"secondary"}>{project.framework}</Badge>
                <Badge className = "mr-2 py-1 hover:shadow" variant={"secondary"}>{project.database}</Badge>
                <Badge className = "mr-2 py-1 hover:shadow" variant={"secondary"}>{project.authenticationType}</Badge>
            </div>
            <p className="text-sm mt-2">
                {project.description.length > 180
                    ? project.description.slice(0, 180) + "..."
                    : project.description}.
            </p>
    </div>
  )
}