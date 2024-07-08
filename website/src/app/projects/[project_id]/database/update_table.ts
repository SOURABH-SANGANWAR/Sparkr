"use server";

import Table from "@/models/Table";

export default async function onUpdate(data: TableSchema) {
    console.log("Data: ", JSON.stringify(data));
    try{
        
        const filter = { _id: data._id };
        const update: TableSchema = data;
        update["state"] = "updated";
        const table: TableSchema | null = await Table.findOneAndUpdate(filter, update);
        console.log("Table updated: ", table);
        return {
            success: true,
            message: "Table updated successfully."
        }
    }
    catch(err : unknown){
        console.log("Error while updating table. ", err);
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
            message: "Error while updating table."
        }
    }
}