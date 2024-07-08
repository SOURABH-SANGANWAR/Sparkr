"use server";

import Table from "@/models/Table";

export default async function onAdd(data: TableSchema) {
    console.log("Data: ", JSON.stringify(data));
    try{
        const table = new Table({
            "state": "updated",
            ...data
        });
        await table.save();
        return {
            success: true,
            message: "Table saved successfully"
        }
    }
    catch(err : unknown){
        console.log("Error while saving table. ", err);
        if (err instanceof Error) {
            return {
                success: false,
                message: err.message
            }
        }
        if (typeof err === "string") {
            return {
                success: false,
                message: err
            }
        }
        return {
            success: false,
            message: "Error while saving table."
        }
    }
}