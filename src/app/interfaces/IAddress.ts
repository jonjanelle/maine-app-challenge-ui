export interface IAddress {
    address_1: string;
    address_2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    lat?: number | null;
    lon?: number | null;
}