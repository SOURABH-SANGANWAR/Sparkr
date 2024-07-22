// import mongoose from "mongoose"

type FieldType = {
    name: string,
    type: string,
    options: {
        [key: string]: string | number | boolean
    },
    reference?: string,
    dependencies?: string[]
}

type TableSchema = {
    name: string,
    _id ?: mongoose.Types.ObjectId,
    fields: FieldType[],
    projectId?: mongoose.Types.ObjectId,
    'state' ?: 'commited' | 'updated' | 'deleted'
    // appId: string
}

type AppType = {
    name : string,
    description : string,
    _id ?: mongoose.Types.ObjectId,
}

type ProjectType = {
    name : string,
    description : string,
    framework : string,
    database : string,
    authenticationType : string,
    repositoryName : string,
    _id ?: mongoose.Types.ObjectId,
    githubRepositoryUrl : string,
    apps : AppType[],
    status : 'commiting' | 'commited',
}