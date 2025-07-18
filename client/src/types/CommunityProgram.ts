export interface CommunityProgram {
    ProgramID: number;
    ProgramName: string;
    Type?: string; // 'online'
    Date: string; // ISO date string
    Description?: string | null;
    Content ?: string | null;
    Organizer?: string | null;
    ImageUrl?: string | null;
    IsDisabled: boolean;
    Status: string; // 'upcoming' | 'ongoing' | 'completed'
    MeetingRoomName?: string | null; // Zoom Meeting ID
    ZoomLink?: string | null; // Zoom Join URL
};

export interface EnrollmentStatus {
    isEnrolled: boolean;
    status: string | null;
    registrationDate: string | null;
    SurveyBeforeCompleted: boolean;
    SurveyAfterCompleted: boolean;
}