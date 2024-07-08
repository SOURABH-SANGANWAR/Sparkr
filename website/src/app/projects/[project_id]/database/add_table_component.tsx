"use client";

import  {  useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Plus, Edit, CircleX, Trash2, Save, X } from 'lucide-react';
import { field_types, common_boolean_fields } from "./field_types";
import { useRouter } from "next/navigation";
import { 
    Tooltip,
    TooltipTrigger,
    TooltipContent
 } from "@/components/ui/tooltip";
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
import { TooltipProvider } from "@radix-ui/react-tooltip";

type Props = {
    className?: string;
    onAdd: (data: TableSchema) => Promise<{ success: boolean, message: string }>;
    project_id: string;
    ButtonComponent?: React.ReactNode;
    };

function check_name_validity (name: string){
    var regex = /^[a-z]+(?:_[a-z]+)*$/
    return regex.test(name)
}

export default function AddNewSchema({
    className,
    onAdd,
    project_id,
    ButtonComponent
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [ name, setName ] = useState('');
    const [ schemaNameError, setSchemaNameError] = useState<string >("");
    const [ nameError, setNameError ] = useState<string >("");
    const [ fields, setFields ] = useState<FieldType[]>([]);
    const [ newField, setNewField ] = useState<FieldType>({
        name: 'id',
        type: 'AutoField',
        options: {},
    });
    const [newFieldOptions, setNewFieldOptions] = useState<any>(field_types.find(field => field.name === "AutoField")?.additional_options);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const options = field_types.find(field => field.name === newField.type)?.additional_options;
        setNewFieldOptions(options);
    }
    , [newField.type]);

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
            onAdd({
                name,
                fields,
                projectId: project_id
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
                {ButtonComponent?ButtonComponent:
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button className="" size = 'icon'><Plus/></Button>
                            </TooltipTrigger>
                            <TooltipContent sideOffset={5} align="center" side="top">
                                Add New Schema
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    // <Button> <Plus className="inline pr-2"/> Add New Schema </Button>
                }
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
                
                <div>{error && <p className="text-red-500">{error}</p>}</div>
                <Label className="block my-1">Schema Name</Label>
                <div className="text-red-500 text-sm">{schemaNameError}</div>
                <Input
                    value={name}
                    onChange={(e) =>{
                        if (!check_name_validity(e.target.value)){
                            setSchemaNameError("Name must be in camel case. Ex: car_name");
                        }
                        else{
                            setSchemaNameError("");
                        }
                        setName(e.target.value);
                    }}
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
                <div className="border">
                    <Label className="p-1 pl-3 font-semibold">Add Field</Label>
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
                        <div >
                            {common_boolean_fields.map(field => (
                                <div key={field} className="flex">
                                    <Label className = "flex-grow p-2 pr-4 " style={{whiteSpace: 'nowrap', width: "180px"}}>{field}</Label>
                                    <input
                                        type="checkbox"
                                        checked={newField.options[field] == true}
                                        onChange={(e) => setNewField({ ...newField, options: { ...newField.options, [field]: e.target.checked} })}
                                    />
                                </div>
                            ))}
                        </div>
                            
                        <Button onClick={addField}>Add</Button>
                    </div>
                </div>
                <Button className="flex-grow w-full my-2" variant={isPending?"ghost":"default"} onClick={addSchema}>{isPending? "loading..":"Add Schema"}</Button>
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
                {(input_field.options?.primary_key)?"*":""}{input_field.name}
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
                            <input
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
                {common_boolean_fields.map(field => (
                    <div key={field} className="flex">
                        <Label className = "flex-grow p-2 pr-4 " style={{whiteSpace: 'nowrap', width: "180px"}}>{field}</Label>
                        <input
                            type="checkbox"
                            checked={currentOptions[field] == true}
                            onChange={(e) => setCurrentOptions({ ...currentOptions, [field]: e.target.checked} )}
                        />
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


