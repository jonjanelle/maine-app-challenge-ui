export interface IResource {
    id: number;
    name: string;
    description: string;
    url: string;
    resource_type_id: number;
    view_count: number;
    is_featured: boolean;
    is_approved: boolean;
    image_url?: string | null;
    created_at?: Date;
    updated_at?: Date;
}