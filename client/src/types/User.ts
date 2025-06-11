export interface User {
    AccountID: number;
    Fullname: string;
    Email: string;
    Password: string;
    Username: string; // Unique username
    DateOfBirth: string; // ISO date string
    Role: string; // e.g., "manager", "user", etc.
    CreatedAt: string; // ISO date string
    IsDisabed: boolean; // true if the account is disabled
    ResetToken: string | null; // Token for password reset, if applicable
    ResetTokenExpiry: Date | null; // Expiry date for the reset token
}