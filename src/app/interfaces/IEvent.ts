import { IAddress } from './IAddress';

export interface IEvent {
    id: number;
    name: string;
    description: string;
    max_participants: number | null;
    cost: number;
    start_date: Date;
    end_date?: Date;
    address: IAddress | null;
    contact_first?: string | null;
    contact_last?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    url?: string | null;
    is_approved?: boolean;
    is_featured?: boolean;
}