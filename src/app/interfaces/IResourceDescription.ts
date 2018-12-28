import { IResource } from "./IResource";
import { ICategory } from "./ICategory";

export interface IResourceDescription {
    resource: IResource;
    categories: ICategory[];
    likes: number;
    dislikes: number;
}