export interface Account {
    AccountID: number;
    Username: string;
    Email: string;
    Password: string;
    FullName: string;
    DateOfBirth: Date | null;
    RoleID: number;
    RoleName: string;
    CreatedAt: string;
    IsDisabled: boolean;
    ResetToken?: string | null;
    ResetTokenExpiry: Date | null;
}

export interface AccountRole {
    RoleID: number;
    RoleName: string;
}

export interface CreateAccountData {
    Username: string;
    Email: string;
    Password: string;
    FullName: string;
    DateOfBirth: Date | null;
    RoleID: number;
}

export interface UpdateAccountData {
    Username?: string;
    Email?: string;
    FullName?: string;
    DateOfBirth?: Date | null;
    RoleID?: number;
    IsDisabled?: boolean;
}
