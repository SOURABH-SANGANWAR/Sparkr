"use client";
import React, { useCallback, useEffect, useState, createContext, useContext } from "react";
import ReactFlow, { applyEdgeChanges, applyNodeChanges, addEdge, Connection, Node,  Edge, EdgeChange, NodeChange } from 'reactflow';
import { MiniMap, Controls, ControlButton } from 'reactflow';
import AddNewEdge from './edges/add_new_edge';
import { useRouter } from "next/navigation";
import { Map } from 'lucide-react';
import 'reactflow/dist/style.css';
import TableNode from './nodes/table';``
import OneToOneEdge from './edges/one_to_one';
import ManyToOneEdge from './edges/many_to_one';
import ManyToManyEdge from './edges/many_to_many';
import tablesToNodeEdge from "./handler";

const nodeTypes = {
  table: TableNode,
};

type contextType = {
    updateTable?: (data: TableSchema) => Promise<{ success: boolean, message: string }>;
    UpdateComponent? : React.FunctionComponent< {
        input_table: TableSchema,
        onUpdate: (data: TableSchema) => Promise<{ success: boolean, message: string }>,
        isOpen: boolean,
        ButtonComponent: any
    }>;
    deleteTable?: (id: string) => Promise<{ success: boolean, message: string }>;
};

export const TableNodeContext = createContext<contextType>({});

type newEdgeCreateType = {
    source: string;
    target: string;
    type: EdgeTypes;
    label: string;
  };

  enum EdgeTypes {
    one_to_one = "one_to_one",
    many_to_one = "many_to_one",
    many_to_many = "many_to_many",
    one_to_many = "one_to_many",
  }

const edgeTypes = {
    one_to_one: OneToOneEdge,
    many_to_one: ManyToOneEdge,
    many_to_many: ManyToManyEdge,
};

type FlowProps = {
    tables : TableSchema[],
    addTable : ( data:TableSchema ) =>  Promise<{ success: boolean, message: string }>;
    updateTable: ( data:TableSchema ) =>  Promise<{ success: boolean, message: string }>;
    AddComponent : React.FunctionComponent<{ 
      onAdd : ( data:TableSchema ) =>  Promise<{ success: boolean, message: string }>,
      project_id: string,
      ButtonComponent?: any
     }>;
    UpdateComponent : React.FC<any>;
    project_id: string;
    deleteTable : (id: string) => Promise<{ success: boolean, message: string }>; 
};

function Flow({
      tables,
      addTable,
      updateTable,
      UpdateComponent,
      AddComponent,
      project_id,
      deleteTable
        }: FlowProps) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [showMap, setShowMap] = useState<boolean>(true);
    const router = useRouter();
    useEffect(() => {
        const {nodes, edges} = tablesToNodeEdge({tables});
        setNodes(nodes);
        setEdges(edges);
    }
    , [tables]);

    const [ openCreateEdge, setOpenCreateEdge ] = useState(false);
    const [ newEdge, setNewEdge ] = useState({
        source: '',
        target: '',
    });

    const onNodesChange = useCallback(
      (changes: NodeChange[]) => {
        changes.forEach((change) => {
            if (change.type === 'add' || change.type === 'reset') {
                change.item.type = 'table';
            }
        });
        const updatedNodes = applyNodeChanges(changes, nodes);
        setNodes(updatedNodes);
        return updatedNodes;},
      [nodes, setNodes]
    );


    const onEdgesChange = useCallback(
      (changes:EdgeChange[]) => {
        changes.forEach((change:any) => {
          if (change.type === 'add' && change.type === 'reset') {
            change.item.type = 'smoothstep';
          }
        });
        console.log(changes);
        const updatedEdges = applyEdgeChanges(changes, edges);
        setEdges(updatedEdges);
        return updatedEdges;
      },
      [edges, setEdges]
    );

    const onConnect = useCallback(
      (connection:Connection) => {
        if (!connection.source || !connection.target) {
          return;
        }
        setNewEdge({
            source: connection.source ,
            target: connection.target ,
        });
        setOpenCreateEdge(true);
      },
      []
    );

    const createEdge = async (edge: newEdgeCreateType) => {

      console.log("Creating Edge: ", edge);

        const table_1 = tables.find((table) => table.name === edge.source);

      console.log("Table 1: ", table_1);

        table_1?.fields.push({
            name: edge.label,
            type: edge.type === 'one_to_one'?"OneToOneField":"ManyToManyField",
            options: {
              to : edge.target,
            }
        });

        const response = await updateTable(table_1 as TableSchema);

        if (!response.success) {
          console.log("Failed to update table", response);
            return;
        }

        console.log("qill refresh now", response);

        router.refresh();
        // let new_edge = {
        //     id: `${edge.source}-${edge.target}`,
        //     source: edge.source,
        //     target: edge.target,
        //     type: edge.type,
        //     data: { label: edge.label },
        // } 

        // const newEdges = addEdge(new_edge, edges);
        // setEdges(newEdges);
        // setOpenCreateEdge(false);
    }
  
    return (
      <TableNodeContext.Provider value={{
        updateTable: updateTable,
        UpdateComponent: UpdateComponent,
        deleteTable: deleteTable
      }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left">
            {showMap?<MiniMap />:<></>}
            <Controls >
              <AddComponent onAdd = {addTable} project_id = {project_id} ButtonComponent = {<ControlButton className = "dark:text-gray-700">N </ControlButton>}/>
              <ControlButton className = "dark:text-gray-700" onClick = {() => setShowMap(!showMap)}> <Map/></ControlButton>
            </Controls>
            <AddNewEdge className="" newEdge={newEdge} open={openCreateEdge} setEdges={createEdge} setOpen={setOpenCreateEdge}/>
        </ReactFlow>
      </TableNodeContext.Provider>
    );
  }
  
  export default Flow;