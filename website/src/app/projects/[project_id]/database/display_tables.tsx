"use client";

import { Button } from "@/components/ui/button";
import {  Edit, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import AddNewSchema from "./add_table_component";
import onAdd from "./add_table";

export default function ListTables(
    {
        tables,
        onUpdate,
        UpdateSchema,
        project_id
    }:
    {
        tables: TableSchema[],
        onUpdate: (data: TableSchema) => Promise<{success: boolean, message: string}>,
        UpdateSchema: React.FunctionComponent<{
            input_table: TableSchema, 
            onUpdate: (data: TableSchema) => Promise<{success: boolean, message: string}>, 
            isOpen: boolean, 
            ButtonComponent: React.ReactNode
        }>,
        project_id: string
    }
) {
    const [ search , setSearch ] = useState<string>("");
    const [ filteredTables, setFilteredTables ] = useState<TableSchema[]>(tables);

    useEffect(() => {
        setFilteredTables(tables.filter(table => table.name.toLowerCase().includes(search.toLowerCase())));
    }, [search, tables]);

    return (
        <div className = "p-2 my-1">
            <div className = "flex flex-row">
                <Input 
                    placeholder = "Search tables"
                    value = {search}
                    onChange = {e => setSearch(e.target.value)}
                    className = "flex-grow mr-1"
                    />
                <AddNewSchema onAdd={onAdd} project_id={project_id} 
                // ButtonComponent={(
                //     <Button className="" size = 'icon'><Plus/></Button>
                // )}
                />
            </div>
             {filteredTables.map(table => (
                 <div className="flex justify-between my-3" key = {table.name}>
                     <div className="p-1">{table.name}</div>
                     <UpdateSchema 
                         input_table={table}
                         onUpdate={onUpdate}
                         isOpen = {false}
                         ButtonComponent = {(
                             <Button size={"icon"} className = "p-1" >
                                 <Edit size={20} />
                             </Button>
                         )}
                         />
                 </div>
             ))}
        </div>

    )
}