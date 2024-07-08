"use client";
import React, { useCallback, useState } from "react";
import ReactFlow, { applyEdgeChanges, applyNodeChanges, addEdge, Connection, Node,  Edge, EdgeChange, NodeChange } from 'reactflow';
import { MiniMap, Background, BackgroundVariant, Controls } from 'reactflow';
import AddNewEdge from './edges/add_new_edge';

import 'reactflow/dist/style.css';
import TableNode from './nodes/table';``
import OneToOneEdge from './edges/one_to_one';
import ManyToOneEdge from './edges/many_to_one';
import ManyToManyEdge from './edges/many_to_many';
import { set } from "mongoose";

const nodeTypes = {
    table: TableNode,
};


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
    nodes: Node[];
    edges: Edge[];
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
};

function Flow({nodes, edges, setNodes, setEdges}: FlowProps) {
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

    const createEdge = (edge: newEdgeCreateType) => {
        let new_edge = {
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            data: { label: edge.label },
        } 

        const newEdges = addEdge(new_edge, edges);
        setEdges(newEdges);
        setOpenCreateEdge(false);
    }

  
    return (
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
            <Background variant={BackgroundVariant.Dots} />
            <MiniMap />
            <Controls />
            <AddNewEdge className="" newEdge={newEdge} open={openCreateEdge} setEdges={createEdge} setOpen={setOpenCreateEdge}/>
        </ReactFlow>
    );
  }
  
  export default Flow;