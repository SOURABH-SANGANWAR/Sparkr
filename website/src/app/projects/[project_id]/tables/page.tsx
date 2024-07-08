import Table from "@/models/Table";

type Props = {
    params: {
        project_id: string
    }
}

export default async function page({ params }: Props){

    const response = await Table.find({ projectId: params.project_id});
    const tables = JSON.stringify(response);
    return (
        <div>
            <h1>Tables: </h1>
            <div>
            {tables}
            </div>
        </div>
    )
}