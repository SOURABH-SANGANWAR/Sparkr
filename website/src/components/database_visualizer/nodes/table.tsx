"use client";
import { Handle, Position, NodeToolbar } from 'reactflow';
import { Separator } from '@/components/ui/separator';
import {  useContext } from 'react';
import { Expand, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import { TableNodeContext } from '../visualizer';
import { useRouter } from 'next/navigation';


type Props = {
    id: string,
    data: TableSchema,
    sourcePosition?: Position,
    targetPosition?: Position,
    };

 
export default function TableNode({
    id,
    sourcePosition = Position.Left,
    targetPosition = Position.Right,
    data,
    }: Props) {

    const update_data = useContext(TableNodeContext);
    const UpdateComponent = update_data.UpdateComponent;
    const updateTable = update_data.updateTable;
    const deleteTable = update_data.deleteTable;
    const router = useRouter();
    const onDelete = async () => {
      if (deleteTable === undefined) {
        return;
      }
      const response = await deleteTable(data._id);
      console.log(response);
      if (response.success) {
        router.refresh();
      }
    }
 
  return (


    <>
    <NodeToolbar isVisible={true}>
      <div className='text-lg flex flex-row'>
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Button size = "icon" className = "mx-1" onClick={onDelete}><Trash size={15}/></Button>
          </TooltipTrigger>
          <TooltipContent>
            Delete
          </TooltipContent>
        </Tooltip>
        </TooltipProvider>
        
        { UpdateComponent !== undefined && updateTable !== undefined ? <TooltipProvider><Tooltip>
            <TooltipTrigger>
              <UpdateComponent
                input_table = {data}
                onUpdate = {updateTable}
                isOpen = {false}
                ButtonComponent = {(<Button size = "icon" className = "mx-1"><Expand size={15}/></Button>)}
                />
            </TooltipTrigger>
            <TooltipContent>
              Expand and Edit
            </TooltipContent>
          </Tooltip></TooltipProvider>:<></>}
        
        
      </div>
      </NodeToolbar>
      <div className='rounded-lg px-1 pt-1 pb-2 border shadow-md hover:shadow-xl red'>
        <div className='text-xl font-semibold pb-1 text-center'>
            {data.name} &nbsp;
        </div>
        <Separator />
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='border-r p-0 m-0 text-center'>Name</TableHead>
                    <TableHead className='p-0 m-0 text-center'>Type</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.fields.map((column, index) => (
                    <TableRow className='px-5 mx-2 border-0' key={index}>
                        <TableCell className='border-r'>{column.name} </TableCell>
                        <TableCell>{column.type}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <Handle
          style={{ opacity: "40%" }}
          position={sourcePosition}
          type="source"
        />
        <Handle
          style={{ opacity: "40%" }}
          position={targetPosition}
          type="target"
        />
      </div>
    </>

  );
}
