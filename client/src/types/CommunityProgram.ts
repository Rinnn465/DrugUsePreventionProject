export interface CommunityProgram {
    ProgramID: number;
    ProgramName: string;
    Type?: string; // 'online'
    Date: string; // ISO date string
    Description?: string | null;
    Content ?: string | null;
    Organizer?: string | null;
    Url: string;
    ImageUrl?: string | null;
    IsDisabled: boolean;
    Status: string; // 'upcoming' | 'ongoing' | 'completed'
};

export interface EnrollmentStatus {
    isEnrolled: boolean;
    status: string | null;
    registrationDate: string | null;
    SurveyBeforeCompleted: boolean;
    SurveyAfterCompleted: boolean;
}