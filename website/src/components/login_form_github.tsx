"use client";

import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function SignInComponent() {
    const [loading, setLoading] = useState(false);
    const [ error, setError ] = useState("");
    const { data : session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const code = searchParams.get('code');

    useEffect(() => {
        if (session) {
            router.push('/');
        }

        if (code) {
            setLoading(true);
            signIn("credentials", { code, redirect: false }
            ).then((response) => {
                if (response && response.error) {
                    console.error(response.error);
                    setError(response.error);
                    setLoading(false);
                    return;
                }
                else{
                    console.log("Logged in");
                    setLoading(false);
                    router.push('/');
                }
            });
        }
    }, []);

    if (session) {
        router.push('/');
    }

    


    
    const handleGithubLogin = () => {
        router.push('https://github.com/login/oauth/authorize?client_id=Iv23liDjiqtR8nCTZ9qi');
    }
    
    return (
        <div>
            <div className = "shadow-lg px-4 py-10 rounded-lg border">
                <h1 className="text-2xl font-bold justify-center text-center">Login</h1>
                <p className="text-center text-red-500">{error}</p>
                <Button className="w-72 mx-auto my-4 block" onClick = {handleGithubLogin} disabled = {loading}>
                    {loading?"Logging In...":
                    <>
                        <Github className="inline" />&nbsp;Login with GitHub
                    </>}
                </Button>
            </div>
        </div>
    )
}
