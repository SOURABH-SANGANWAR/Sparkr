"use server";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"  

import Table from "@/models/Table";
import Visualizer from "@/components/database_visualizer/visualizer";
import AddNewSchema from "./add_table_component";
import onAdd from "./add_table";
import onUpdate from "./update_table";
import onDelete from "./delete_table";
import UpdateSchema from "./update_table_component";
import ListTables  from './display_tables';

type Props = {
    params: {
        project_id: string
    }
}

export default async function page({ params }: Props){

    const response = await Table.find({ projectId: params.project_id});
    const tables = JSON.parse(JSON.stringify(response)) as TableSchema[];
    console.log("Tables: ", tables);

    return (
        <div className="h-full">
            <ResizablePanelGroup
                direction="horizontal"
                className=""
            >
                <ResizablePanel 
                    defaultSize={25}
                    minSize={20}
                >
                    <ListTables 
                        tables={tables}
                        onUpdate={onUpdate}
                        UpdateSchema={UpdateSchema}
                        project_id={params.project_id}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={75} minSize={10}>
                        <Visualizer 
                            tables={tables}
                            addTable={onAdd}
                            updateTable={onUpdate}
                            AddComponent = {AddNewSchema}
                            project_id= {params.project_id}
                            UpdateComponent = {UpdateSchema}
                            deleteTable = {onDelete}
                        />  
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )



}