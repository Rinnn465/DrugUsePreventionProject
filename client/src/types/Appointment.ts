export interface Appointment {
    AppointmentID?: number; // Optional if it's auto-generated
    ConsultantID: number;
    AccountID: number;
    Time: string; // Format: 'HH:mm:ss'
    Date: string; // Format: 'YYYY-MM-DD'
    MeetingURL?: string;
    Status: string;
    Description?: string;
    Duration: number; // in minutes
    RejectedReason?: string; // Reason for rejection when status is 'rejected'
}
