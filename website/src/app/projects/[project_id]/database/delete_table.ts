"use server";


import Table from "@/models/Table";


export default async function onDelete(id: string) {
    console.log("Data: ", id);
    try{
        
        const filter = { _id: id };
        const table = await Table.findOneAndDelete(filter);
        console.log("Table deleted: ", table);
        return {
            success: true,
            message: "Table deleted successfully."
        }
    }
    catch(err : unknown){
        console.log("Error while deleting table. ", err);
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
            message: "Error while deleting table."
        }
    }
}