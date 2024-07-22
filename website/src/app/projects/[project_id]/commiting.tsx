"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CommitingProps = {
    project_id: string,
    project_name: string,
    task_id: string,
    stat: string,
    server_action: (project_id: string, status: string) => Promise<void>
}

export default function Commiting(
    { project_name,
      task_id,
      stat,
      server_action,
      project_id
     }: CommitingProps
) {
    const router = useRouter();
    const [status, setStatus] = useState(stat);
    const [message, setMessage] = useState<any>(null);
    const get_status = process.env.NEXT_PUBLIC_SERVICE_URL;
    if (!get_status) {
        throw new Error("Service URL not found");
    }


    if (status === "commited") {
        router.refresh();
    }

    const get_status_url = status === "commiting" ? `${get_status}/commit-status/${task_id}` : `${get_status}/init-repo-status/${task_id}`;
  
    // check api after every 3 secons and update the status
    useEffect(() => {
        const interval = setInterval(async () => {
          console.log("Checking status", task_id);
            const res = await fetch(get_status_url);
            const data = await res.json();
            if (data.status === "commited") {
                router.push(`/projects/${project_name}`);
            }
            setStatus(data.task_status);
            setMessage(data.task_result);
          console.log("Response:", data);
            if (status !== "PROGRESS") {
                clearInterval(interval);
                server_action(project_id, data.status).then(() => {
                    router.refresh();
                });
            }
        }, 3000);
        return () => clearInterval(interval);
    });

  return (
    <div>
      <div className="text-lg">{"Commiting the project."}</div>
      <div className="text-sm">{"Please wait while we commit the project to your repository..."}</div>
      <div className="text-sm">{message}</div>
    </div>
  );
}
