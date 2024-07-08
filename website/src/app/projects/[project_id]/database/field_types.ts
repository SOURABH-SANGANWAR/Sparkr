
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

export const common_boolean_fields = [
    "null",
    "blank",
    "primary_key",
    "unique",
]