"use client";
import  { Button } from "@/components/ui/button";

export default function InstallGithubApp() {
  const redirectInstallationPage = () => {
    window.location.href = process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ?? '';
  }

    return (
        <div>
            <Button onClick={redirectInstallationPage}>Install Github App</Button>
        </div>
    )
}