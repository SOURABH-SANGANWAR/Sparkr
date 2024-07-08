"use client";

import  { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormEventHandler } from "react";
import { useRouter } from 'next/navigation';

type ProjectData = {
  name: string,
  description: string,
  framework: string,
  database: string,
  authenticationType: string,
  repositoryName: string
}

type Props = {
  createProject: (data: ProjectData) => Promise<void>,
  className?: string
}

const formSchema = z.object({
  name: z.string(),
  description: z.string(),
  framework: z.string(),
  database : z.string(),
  authenticationType : z.string(),
  // Repository name should be a valid github repository name Add validation using regex
  repositoryName: z.string().regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, { message: "Invalid repository name" })

});


export default function CreateNewProject({ createProject, className }: Props) {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [ open, setOpen ] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "New Project",
      description: "This is a new project",
      framework: "django",
      authenticationType: "jwt",
      database: "postgres",
      repositoryName: "new-project"
    },
  })

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const data = form.getValues();
    try {
      await createProject(data);
      form.reset();
      // redirect to the project page
      // refresh the page to show the new project
      setOpen(false);
      router.refresh();

    }
    catch (error : any) {
      console.error(error);
      setError(error.message);
    }
  }
  
  if (!session) {
    return <></>;
  }



  return (
    <Dialog open = {open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className = {className}>
          <Plus size={24} /> Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new project</DialogTitle>
          <DialogDescription>
            This action initiates a new project. This will create a repository in your GitHub account to store the project code.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormMessage>{error}</FormMessage>
          <form onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="name"
              render = {({field} ) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input {...field} />
                  <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                </FormItem>
              )  
            }/>
            <FormField
              control={form.control}
              name="description"
              render = {({field} ) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <Input {...field} />
                  <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                </FormItem>
              )  
            }/>
            <FormField
              control={form.control}
              name="framework"
              render = {({field} ) => (
                <FormItem>
                  <FormLabel htmlFor="framework">Framework</FormLabel>
                  <Input {...field} />
                  <FormMessage>{form.formState.errors.framework?.message}</FormMessage>
                </FormItem>
              )  
            }/>
            <FormField
              control={form.control}
              name="authenticationType"
              render = {({field} ) => (
                <FormItem>
                  <FormLabel htmlFor="authenticationType">Authentication Type</FormLabel>
                  <Input {...field} />
                  <FormMessage>{form.formState.errors.authenticationType?.message}</FormMessage>
                </FormItem>
              )  
            }/>
            <FormField
              control={form.control}
              name="database"
              render = {({field} ) => (
                <FormItem>
                  <FormLabel htmlFor="database">Database</FormLabel>
                  <Input {...field} />
                  <FormMessage>{form.formState.errors.database?.message}</FormMessage>
                </FormItem>
              )  
            }/>
            <FormField
              control={form.control}
              name="repositoryName"
              render = {({field} ) => (
                <FormItem>
                  <FormLabel htmlFor="repositoryName">Repository Name</FormLabel>
                  <Input {...field} />
                  <FormMessage>{form.formState.errors.repositoryName?.message}</FormMessage>
                </FormItem>
              )  
            }/>
            <Button className = "w-full my-5" type="submit">Create Project</Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


