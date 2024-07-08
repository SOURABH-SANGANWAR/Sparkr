import { Node, Edge, Position } from 'reactflow';


export default function tablesToNodeEdge({
    tables
}:{
    tables: TableSchema[]
}): {nodes: Node[], edges: Edge[]} {
    let nodes: Node[] = [];
    let edges: Edge[] = [];
    let count = 0;
    let edgeCount = 0;
    let maxNumFields = 0;
    for (let table of tables) {
        if (table.fields.length > maxNumFields) {
            maxNumFields = table.fields.length;
        }
    }
    for (let table of tables) {
        nodes.push({
            id: table.name,
            type: 'table',
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            data: {
                ...table
            },
            position: {x: count*350, y: 100}
        });
        count++;
        const numFields = table.fields.length;
        let field: FieldType;
        for (field of table.fields) {
            console.log(field.type);
            if (field.type === 'ManyToManyField' || field.type === 'OneToOneField') {
                edges.push({
                    id: `${table.name}-${field.options.to}`,
                    source: table.name,
                    target: field.options.to as string,
                    type: field.type === 'ManyToManyField'? 'many_to_many': 'one_to_one',
                    data: {label: field.name, offset : 50 + maxNumFields*36 - numFields*18 + 30*edgeCount},
                });
                edgeCount++;
        
            }
        }
    }
    console.log(nodes);
    console.log("Edges\n\n\n:", edges);
    return {nodes, edges};
}