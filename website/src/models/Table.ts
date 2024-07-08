import mongoose from "mongoose";
import { Schema } from "mongoose";

const field_options = [
    "null",
    "blank",
    "primary_key",
    "unique",
]


export const field_types = [
    {
        "name": "AutoField",
        additional_options: {}
    },
    {
        "name": "BooleanField", 
        additional_options: {}
    },
    {
        "name": "CharField",
        additional_options: {
            "max_length": "number",
        }
    },
    {
        "name": "DateField",
        additional_options: {
            "auto_now": "boolean",
            "auto_now_add": "boolean"
        }
    },
    {
        "name": "DateTimeField",
        additional_options: {
            "auto_now": "boolean",
            "auto_now_add": "boolean"
        }
    },
    {
        "name": "DecimalField",
        additional_options: {
            "max_digits": "number",
            "decimal_places": "number"
        }
    },
    {
        "name": "EmailField",
        additional_options: {
            "max_length": "number"
        }
    },
    {
        "name": "FileField",
        additional_options: {
            "upload_to": "string",
            "max_length": "number"
        }
    },
    {
        "name": "FloatField",
        additional_options: {}
    },
    {
        "name": "IntegerField",
        additional_options: {}
    },
    {
        "name": "GenericIPAddressField",
        additional_options: {}
    },
    {
        "name": "TextField",
        additional_options: {}
    },
    {
        "name": "RichtextField",
        additional_options: {},
        reference: "ckeditor.fields",
        "dependencies": ["ckeditor"]
    },
    {
        "name": "TimeField",
        additional_options: {
            "auto_now": "boolean",
            "auto_now_add": "boolean"
        }
    },
    {
        "name": "URLField",
        additional_options: {
            "max_length": "number"
        }
    },
    {
        "name": "UUIDField",
        additional_options: {}
    },
    {
        "name": "ManyToManyField",
        additional_options:  {
            "to": "string",
        }
    },
    {
        "name": "OneToOneField",
        additional_options: {
            "to": "string",
            "on_delete": "string"
        }
    }

];

const States = [
    "commited",
    "updated",
    "deleted"
];

const TableFieldSchema = new Schema({
    name: {
        type: String,
        required: true

    },
    projectId : {
        type: Schema.Types.ObjectId,
        ref: "Project"
    },
    fields : [
        {
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true,
                enum: field_types.map(field => field.name)
            },
            options: {
                type: Map,
                of: String || Number || Boolean,
                required: true
            }

        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    state: {
        type: String,
        enum: States,
        default: "updated"
    }
});

TableFieldSchema.index({ projectId: 1, name: 1 }, { unique: true }, );

TableFieldSchema.pre("validate", function(next: any) {
    // Check if the table has atleast one field
    if (this.fields.length === 0) {
        next(new Error("Table must have atleast one field"));
    }
    // check if the table has only one primary key

    let count = 0;
    for (const field of this.fields) {
        console.log("verifying ", field, field.options.get('primary_key'));
        if (field.options.get('primary_key') as string == "true" ){
            count++;
        }
    }
    if (count > 1) {
        next(new Error("Table can have only one primary key"));
    }
    
    this.fields.forEach(field => {
        const field_type = field_types.find(type => type.name === field.type);
        if (field_type === null || field_type === undefined) {
            next(new Error(`Invalid field type ${field.type} for field ${field.name}`));
        }
        else{
            const additional_options = field_type.additional_options;
            const options = field.options;
            for (const key of Object.keys(additional_options)) {
                if (!options.has(key)) {
                    next(new Error(`Missing option ${key} for field type ${field.type}`));
                }
            }
            options.forEach((value, key) => {
                if (!(key in additional_options)) {
                    if (!field_options.includes(key)){
                        next(new Error(`Invalid option ${key} for field type ${field.type}`));
                    }
                }
            });
        }
    });
    next();
});



const TableField = mongoose.models.TableField ||  mongoose.model("TableField", TableFieldSchema);

export default TableField;