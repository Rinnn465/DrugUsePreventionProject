export interface User {
    AccountID: number;
    FullName: string;
    Email: string;
    Password: string;
    Username: string; // Unique username
    DateOfBirth: Date | null; // ISO date string
    RoleID: string; // e.g., "manager", "user", etc.
    CreatedAt: string; // ISO date string
    IsDisabed: boolean; // true if the account is disabled
    ResetToken: string | null; // Token for password reset, if applicable
    ResetTokenExpiry: Date | null; // Expiry date for the reset token
}