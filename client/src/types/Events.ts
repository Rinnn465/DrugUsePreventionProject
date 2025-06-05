export interface Event {
    id: number;
    name: string;
    date: Date;
    location: string;
    description?: string;
    organizer?: string;
    attendees?: number;
    tags?: string[];
    type?: string;
    url?: string;
    imageUrl?: string;
}