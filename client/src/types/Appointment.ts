export interface Appointment {
    AppointmentID: number;
    ConsultantID: number;
    AccountID: number;
    Time: string;
    Date: string;
    MeetingURL?: string;
    Status: string;
    Description?: string;
    Duration: number;
    CustomerName?: string;
    CustomerEmail?: string;
    RejectedReason?: string;
    // Add video call fields
    VideoCallActive?: boolean;
    AgoraChannelName?: string;
    CallStartTime?: string;
    CallEndTime?: string;
}