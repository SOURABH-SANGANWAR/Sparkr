import { auth } from "@/lib/auth";
import { ProjectNameProvider } from "@/context/project_name";
export default async function ProjectLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();

    if (!session) {
        return <div className="flex flex-col items-center justify-center w-full">
            <div className="text-lg">{"You are not authenticated."}</div>
            <div className="text-sm">Please login to access the project.</div>
        </div>
    }

    return (
        <div className = "w-full flex flex-col m-2">
            <ProjectNameProvider>
                {children}
            </ProjectNameProvider>
        </div>
    );
}