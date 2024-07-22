import mongoose from "mongoose";
import { Schema } from "mongoose";

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    framework : {
        type: String,
        required: true,
        enum: ["django"]
    },
    githubRepositoryUrl: {
        type: String,
        required: true
    },
    githubRepositoryId: {
        type: Number,
        required: true
    },
    githubRepositoryApiUrl: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    database: {
        type: String,
        required: true,
        enum: ["sqlite", "postgres"]
    },
    status : {
        type: String,
        required: true,
        enum: ["commiting", "commited", "creating"],
        default: "commiting"
    },
    taskId: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    authenticationType: {
        type: String,
        required: true,
        enum: ["jwt", "session"]
    },
    commitedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    apps : [
        {
            name : {
                type: String,
                required: true,
                validate: {
                    validator: function(v: string) {
                        return /^[a-z]+(?:_[a-z]+)*$/.test(v);
                    },
                    message: `Invalid app Name. App name must be in camel case.`
                }
            },
            description : {
                type: String,
                required: true
            },
        }
    ]
});

const Project = mongoose.models.Project ||  mongoose.model("Project", ProjectSchema);

export default Project;