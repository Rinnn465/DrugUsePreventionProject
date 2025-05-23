export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string; // e.g., "manager", "user", etc.
    courseTaken?: string[]; // List of courses taken by the user
    appointment?: string; // Appointment details
    eventTaken?: string[]; // Event details
}