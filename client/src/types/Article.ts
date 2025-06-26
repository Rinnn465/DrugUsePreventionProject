export interface Article {
    BlogID: number;
    AccountID: number;
    ArticleTitle: string;
    PublishedDate: string; // ISO date-time string
    ImageUrl?: string | undefined;
    Author: string;
    Status: string;
    Description?: string | null;
    Content: string;
    IsDisabled: boolean;
}


