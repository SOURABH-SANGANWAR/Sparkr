
type Props = {
    urlArray : string[]
}

import { Home } from "lucide-react";

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function addSlashes(inputArray: string[]) {
    if (!inputArray.length) {
        return [];
    }

    const outputArray = [];
    let currentPath = "";
    for (const item of inputArray) {
    currentPath += `/${item}`;
    outputArray.push(currentPath);
    }

    return outputArray;
}
  


export default function BreadCrumb({urlArray}: Props) {

    const linkArray = addSlashes(urlArray);

  return (
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem>
                <BreadcrumbLink href = "/">
                    <Home size = {15} />
                </BreadcrumbLink>
                <BreadcrumbSeparator />
            </BreadcrumbItem>
            {urlArray.map((url, index) => {
                return (
                    <BreadcrumbItem key = {index}>
                        <BreadcrumbLink href = {linkArray[index]}>
                            {url}
                        </BreadcrumbLink>
                        {index === urlArray.length - 1 ? null : <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                )
            })}
        </BreadcrumbList>
    </Breadcrumb>
    
  )
}