"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Github } from 'lucide-react';
import { useState } from "react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { set } from "mongoose";

const formSchema = z.object({
    email: z.string().email({
        message: "Invalid email address"
    }),
    password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one digit" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    });

export default function LoginForm() {
    const { data: session } = useSession();
    const router = useRouter();
    const [ loading, setLoading ] = useState(false);
    
    if (session) {
        router.push("/");
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
      })
     
      function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        console.log(values)
        signIn("credentials", {
            email: values.email,
            password: values.password,
            redirect: false
        }).then((response) => {
            if (response && response.error) {
                console.error("Failed to sign in")
                setLoading(false);
            } else {
                router.push("/")
            }
        })
      }

      function handleGithubLogin() {
        setLoading(true);
        signIn("github" , { callbackUrl: "/" });
        setLoading(false);
      }

    return (
        <div className = "shadow-lg px-4 py-10 rounded-lg border">
        <h1 className="text-2xl font-bold justify-center text-center">Login</h1>
        
            <Button className="w-full mx-auto my-4 block" onClick = {handleGithubLogin} disabled = {loading}>
                {loading?"Logging In...":
                <>
                    <Github className="inline" />&nbsp;Login with GitHub
                </>}
            </Button>
        <Separator className = "mb-2"/>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input className = "w-80" placeholder="Something@somewhere.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className = "w-full mx-auto block" type="submit" disabled = {loading}>{loading?"Logging In...":"Submit"}</Button>
          </form>
        </Form>
        </div>
      )
}

