"use server";

import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button"; 
type Props = {}

export default async function LoginWithGithub({}: Props) {
  return (
              <form
                action={async () => {
                  "use server"
                  await signIn("github")
                }}
                >
                <Button type="submit">Signin with GitHub</Button>
            </form>
  )
}