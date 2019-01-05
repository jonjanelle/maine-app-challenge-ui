import { IResource } from "../../interfaces/IResource";
import { ICategory } from "src/app/interfaces/ICategory";

export interface IAddResourceDialogData {
    title: string; 
    resource: IResource;
    categories: ICategory[];
}