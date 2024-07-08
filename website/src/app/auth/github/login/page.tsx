"use client";

import { Suspense } from "react";
import  SignInComponent  from "@/components/login_form_github";


export default function SignInPage() {

    return (
        <Suspense>
            <SignInComponent />
        </Suspense>
    )
}
