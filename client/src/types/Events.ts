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

export interface CommunityProgram {
    ProgramID: number;
    EventName: string;
    Date: string; // ISO date string
    Description?: string | null;
    Organizer?: string | null;
    ImageUrl?: string | null;
    IsDisabled: boolean;
}