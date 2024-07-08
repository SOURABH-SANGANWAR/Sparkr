import { auth } from "@/lib/auth";
import LoginWithGithub  from "@/components/login_with_github";
import { redirect } from 'next/navigation'
import LoginForm from "@/components/login_form";

export default async function SignIn() {
    // Wait for 5 sec
    const session = await auth();
    // Redirect if user is already logged in
    if (session) {
        redirect('/')
    }
    return (
        <div>
            <LoginForm />
            {/* <LoginWithGithub /> */}
        </div>
    )
}
