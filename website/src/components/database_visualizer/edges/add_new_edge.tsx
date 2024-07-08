"use client";

import React from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


// Define edge types as an enum
enum EdgeTypes {
  one_to_one = "one_to_one",
  many_to_one = "many_to_one",
  many_to_many = "many_to_many",
  one_to_many = "one_to_many",
}

const formSchema = z.object({
    type: z.string().nonempty().refine((type) => {
        return Object.values(EdgeTypes).includes(type as EdgeTypes);
        }, "Invalid edge type"),
    label: z.string().nonempty(),
  })
  

type newEdgeCreateType = {
  source: string;
  target: string;
  type: EdgeTypes;
  label: string;
};

type Props = {
  className?: string;
  newEdge: {
    source: string;
    target: string;
  };
  setEdges: (edge: newEdgeCreateType) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddNewEdge({
  className,
  newEdge,
  open,
  setEdges,
  setOpen,
}: Props) {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "one-to-one",
            label: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await setEdges({
            source: newEdge.source,
            target: newEdge.target,
            type: data.type as EdgeTypes,
            label: data.label,
         });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Adding New Relation.</DialogTitle>
            <DialogDescription>Add a new relation between 2 schemas.</DialogDescription>
            </DialogHeader>
            <div>
                Source: {newEdge.source}
                <br />
                Destination: {newEdge.target}
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name="type"
                        control={form.control}
                        render = {({ field }) => (
                            <FormItem>
                                <FormLabel>Type</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Choose kind of relation.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="label"
                        control={form.control}
                        render = {({ field }) => (
                            <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Label for the relation.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Add</Button>
                </form>

            </Form>
        </DialogContent>
        </Dialog>
    );
}
