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

export interface CreateArticleData {
    Title: string;
    Content: string;
    Author?: string;
}

export interface UpdateArticleData {
    Title?: string;
    Content?: string;
    Author?: string;
    IsDisabled?: boolean;
}


