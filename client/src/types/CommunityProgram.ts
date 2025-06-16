export interface CommunityProgram {
    ProgramID: number;
    ProgramName: string;
    Type: string; // 'online' | 'offline'
    Date: string; // ISO date string
    Description?: string | null;
    Organizer?: string | null;
    Location?: string | null;
    Url: string;
    ImageUrl?: string | null;
    IsDisabled: boolean;
}

export interface EnrollmentStatus {
    isEnrolled: boolean;
    status: string | null;
    registrationDate: string | null;
}