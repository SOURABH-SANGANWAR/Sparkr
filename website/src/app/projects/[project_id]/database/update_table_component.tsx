"use client";

import  {  useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Edit, CircleX, Trash2, Save, X } from 'lucide-react';
import { field_types } from "./field_types";
import { useRouter } from "next/navigation";
import { Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

type Props = {
    onUpdate: (data: TableSchema) => Promise<{ success: boolean, message: string }>;
    input_table: any;
    ButtonComponent: React.ReactNode;
    isOpen: boolean;
    };

export default function UpdateSchema({
    onUpdate,
    input_table,
    ButtonComponent,
    isOpen,
}: Props) {
    console.log("UpdateSchema", input_table);
    const [open ,setOpen] = useState(false);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [ name, setName ] = useState(input_table.name);
    const [ nameError, setNameError ] = useState<string >("");
    const [ fields, setFields ] = useState<FieldType[]>(input_table.fields);
    const [ newField, setNewField ] = useState<FieldType>({
        name: 'id',
        type: 'AutoField',
        options: {},
    });
    const [newFieldOptions, setNewFieldOptions] = useState<any>(field_types.find(field => field.name === "AutoField")?.additional_options);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("New field type changed", newField.type);
        const options = field_types.find(field => field.name === newField.type)?.additional_options;
        setNewFieldOptions(options);
    }
    , [newField.type]);

    useEffect(() => {
        setOpen(isOpen);
    }
    , [isOpen]);

    useEffect(() => {
        setName(input_table.name);
        setFields(input_table.fields);
    }
    , [input_table]);

    const updateField = (key: string, data: FieldType) => {
        console.log("Update field triggered", key, data);
      
        setFields(prevFields =>
          prevFields.map((field, index) => (field.name === key ? { ...field, ...data } : field))
        );
      
        console.log("Updated fields", fields);
      };

    const deleteField = (key: string) => {
        console.log("Delete field triggered", key);
        let schemaFields = fields;
        schemaFields = schemaFields.filter(field => field.name !== key);
        setFields(schemaFields);
        console.log("Updated fields", fields, schemaFields);
    }

    const addField = () => {
        console.log("Add field triggered", newField);
        if (!newField.name) {
            setNameError("Field name is required");
            return;
        }
        // Check if the field name is unique
        if (fields.find(field => field.name === newField.name)) {
            setNameError("Field name already exists");
            return;
        }
        setNameError("");
        let schemaFields = fields;
        schemaFields.push(newField);
        setFields(schemaFields);
        setNewField({
            name: '',
            type: 'AutoField',
            options: {},
        });
    }

    const addSchema = () => {
        console.log("Add schema triggered", name, fields);
        startTransition(async () => {
            onUpdate({
                ...input_table,
                name,
                fields
            }).then(resp => {
                console.log("Response from onAdd", resp);
                if (!resp.success) {
                    setError(resp.message);
                    return;
                }
                setOpen(false);
                setName('');
                setFields([]);
                setNewField({
                    name: '',
                    type: 'AutoField',
                    options: {},
                });
                router.refresh();
            });
        });
    }

    return (
        <Dialog open = {open} onOpenChange={setOpen}>
            <DialogTrigger>
                {ButtonComponent}
                {/* <Button size={"icon"} className = "p-2" >
                    <Edit size={20} />
                </Button> */}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Schema</DialogTitle>
                    <DialogDescription>
                        Add a new schema to the project database.
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-scroll hidescroll px-1" style={{
                    maxHeight: "70vh"
                }}>
                {error && <p className="text-red-500">{error}</p>}
                <Label className="block my-1">Schema Name</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Schema Name"
                    className = "w-full"
                />
                <Label className="block mt-4">Fields</Label>
                {
                    fields.length == 0 ? <p className="text-gray-500">No fields added yet.</p> :
                    <div className="border rounded-t-xl p-1 bg-gray-200 dark:bg-gray-800 flex">
                        <div className="flex-grow basis-0 mr-1 p-2">
                            FieldName
                        </div>
                        <div className="flex-grow basis-0 mr-1 p-2">
                            Field Type
                        </div>
                        <div className="flex-shrink-0 px-2"> {/* Buttons container */}
                            <Button size={"icon"} variant={null} className="p-2 mr-1" disabled >
                                <Edit size={24}/>
                            </Button>
                            <Button size={"icon"} variant={null} className="p-2 mr-1" disabled >
                                <Trash2 size={24}/>
                            </Button>
                        </div>
                    </div>
                }
                {fields.map(field => (
                    <div key = {field.name}>
                        <Field
                            input_field={field}
                            updateField={updateField}
                            deleteField={deleteField}
                        />
                    </div>
                ))
                    }
                <div className="border rounded-b-lg">
                    <Label className="my-1 p-1 pl-3 font-semibold">Add Field</Label>
                    <div className = "flex px-1 pb-1">
                        <Label className = "flex-grow py-1 px-3 " style={{whiteSpace: 'nowrap', width: "180px"}}>Field Name</Label>
                        {nameError && <p className="text-red-500">{nameError}</p>}
                        <Input
                            value={newField.name}
                            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                            placeholder="Field Name"
                            className = "flex-grow"
                        />
                    </div>
                    <div className = "flex px-1 pb-1">
                        <Label className = "flex-grow py-1 px-3 " style={{whiteSpace: 'nowrap', width: "180px"}}>Field Type</Label>
                        <Select onValueChange={(value) => setNewField({ ...newField, type: value })} value={newField.type}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {field_types.map(field => (
                                    <SelectItem key={field.name} value = {field.name} onSelect={() => setNewField({ ...newField, type: field.name })}>
                                        {field.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className = "pl-4 pr-1 pb-2 ">
                        <Label className = "font-semibold py-1" style={{whiteSpace: 'nowrap', width: "180px"}}>Field Options: </Label>
                    {newFieldOptions && Object.entries(newFieldOptions).map( ([fieldName, fieldValue]) => (
                        <div key={fieldName} className="flex ">
                            <Label className = "flex-grow p-2 pr-4 " style={{whiteSpace: 'nowrap', width: "180px"}}>{fieldName}</Label>
                            {fieldValue === 'boolean' ? (
                                <input
                                    type="checkbox"
                                    checked={newField.options[fieldName] == true}
                                    onChange={(e) => setNewField({ ...newField, options: { ...newField.options, [fieldName]: e.target.checked} })}
                                />
                            ) : ( fieldValue === 'number' ? (
                                <Input
                                    type="number"
                                    value={newField.options[fieldName] as number}
                                    onChange={(e) => setNewField({ ...newField, options: { ...newField.options, [fieldName]: e.target.value } })}
                                />
                            ) : (
                                <Input
                                    value={newField.options[fieldName] as string}
                                    onChange={(e) => setNewField({ ...newField, options: { ...newField.options, [fieldName]: e.target.value } })}
                                /> 
                            )
                            )}
                        </div>
                    ))}
                        <Button onClick={addField}>Add</Button>
                    </div>
                </div>
                <Button className="flex-grow w-full my-2" variant={isPending?"ghost":"default"} onClick={addSchema}>{isPending? "loading..":"Save Schema"}</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function Field({
    input_field,
    updateField,
    deleteField
}: {
    input_field: FieldType
    updateField: (key: string, data: FieldType) => void;
    deleteField: (key: string) => void;
}) {
    const [ open, setOpen ] = useState(false);
    const [currentName, setCurrentName] = useState(input_field.name);
    const [currentFieldType, setCurrentFieldType] = useState(input_field.type);
    const [currentOptions, setCurrentOptions] = useState(input_field.options);
    const [fieldTypeOptions, setFieldTypeOptions] = useState<any>(field_types.find(field => field.name === input_field.type)?.additional_options);

    useEffect(() => {
        const options = field_types.find(field => field.name === currentFieldType)?.additional_options;
        setFieldTypeOptions(options);
        setCurrentOptions({});
    }
    , [currentFieldType]);

    useEffect(() => {
        setCurrentName(input_field.name);
        setCurrentFieldType(input_field.type);
        setCurrentOptions(input_field.options);
    }
    , [input_field]);

    return (
    <div className="border">
        <div className="flex p-1">
            <div className="flex-grow basis-0 mr-1 p-2">  {/* Updated first div */}
                {input_field.name}
            </div>
            <div className="flex-grow basis-0 mr-1 p-2">  {/* Updated second div */}
                {input_field.type}
            </div>

            <div className="flex-shrink-0 px-2"> {/* Buttons container */}
                <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="p-2 mr-1">
                {open ? <CircleX size={24} /> : <Edit size={24} />}
                </Button>
                <Button size="icon" variant="destructive" onClick={() => deleteField(input_field.name)} className="p-2 mr-1">
                <Trash2 size={24} />
                </Button>
            </div>
        </div>
        <div className={`items-center ${open?"":"hidden"} m-2`}>
            <div className = "flex">
                <Label className = "flex-grow p-2 pr-4 " style={{whiteSpace: 'nowrap', width: "180px"}}>Field Name</Label>
                <Input
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    placeholder="Field Name"
                    className = "flex-grow "
                
                />
            </div>
            <div className = "flex">
                <Label className = "flex-grow p-2 pr-4 " style={{whiteSpace: 'nowrap', width: "180px"}}>Field Type</Label>
                <Select onValueChange={(value) => setCurrentFieldType( value )} defaultValue={currentFieldType} value={currentFieldType}
                >
                <SelectTrigger >
                    <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                    {field_types.map(field => (
                        <SelectItem key={field.name} value = {field.name}>
                            {field.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            </div>
            <div className = "pl-2 pr-1/2 py-2">
                <Label className = "font-semibold" style={{whiteSpace: 'nowrap', width: "180px"}}>Field Options: </Label>
                {fieldTypeOptions && Object.entries(fieldTypeOptions).map( ([fieldName, fieldValue]) => (
                    <div key={fieldName} className="flex">
                    <Label className = "flex-grow p-2 pr-4 " style={{whiteSpace: 'nowrap', width: "180px"}}>{fieldName}</Label>
                    {
                        fieldValue === 'boolean' ? (
                            <Input
                                type="checkbox"
                                checked={currentOptions[fieldName] == true}
                                onChange={(e) => setCurrentOptions({ ...currentOptions, [fieldName]: e.target.checked })}
                            />
                        ) : ( fieldValue === 'number' ? (
                            <Input
                                type="number"
                                value={currentOptions[fieldName] as number}
                                onChange={(e) => setCurrentOptions({ ...currentOptions, [fieldName]: e.target.value })}
                            />
                        ) : (
                            <Input
                                value={currentOptions[fieldName] as string}
                                onChange={(e) => setCurrentOptions({ ...currentOptions, [fieldName]: e.target.value })}
                            />
                        ))
                    }
                </div>
                ))}
            </div>
            <Button className = "mx-2" onClick={() => {updateField(input_field.name, {
                ...input_field,
                name: currentName,
                type: currentFieldType,
                options: currentOptions
            }); setOpen(false); }}><Save/>&nbsp;Save</Button>
            <Button className = "mx-2" variant = "destructive"  
                onClick={() => 
                    {updateField(input_field.name, input_field);setOpen(false);}
                }>
                <X/> &nbsp;Discard
            </Button>
        </div>
        </div>
    )
}


