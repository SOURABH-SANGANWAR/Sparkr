import mongoose from "mongoose";
import { Schema } from "mongoose";


const SerializerSchema = new Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    appId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'App',
        required: true
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "commiting",
        enum: ["commiting", "commited"]

    },
    fields: [{
        fieldName: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        options: {
            read_only: {
                type: Boolean,
                required: true
            },
            write_only: {
                type: Boolean,
                required: true
            },
            serializer_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Serializer'
            },
            source: {
                type: String
            }
        }
    }]
});

const Serializer = mongoose.model('Serializer', SerializerSchema);

export default Serializer;