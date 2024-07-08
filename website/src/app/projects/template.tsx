"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BreadCrumb from "@/components/breadcrumb";
import { usePathname } from 'next/navigation'
import { ProjectContext } from "@/context/project_name";
import { useContext } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const urlArray = pathname.split("/").filter((item) => item !== "");
    const { projectName } = useContext(ProjectContext);

    return <>
        <div className = "flex flex-row my-2">
            <BreadCrumb urlArray = {urlArray}/>
        </div>
        {projectName ?
        <div className = "">
                <div className="flex flex-row my-2">
                    <h2 className = "flex-grow text-xl p-1"> {projectName}</h2>
                    <Button  className="">Edit</Button>
                </div>
                <Separator />
            </div>
            : null
            }
        {children}
    </>
  }