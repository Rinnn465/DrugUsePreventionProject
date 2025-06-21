export interface SqlCourse {
  CourseID: number;
  CourseName: string;
  Risk: string;
  Description: string;
  ImageUrl: string;
  EnrollCount: number;
  Duration: number | null;
  IsDisabled?: boolean; // Optional if not always present
  Status?: string; // Optional if not always present
  Category: Category[];
}

export interface Category {
  CategoryID: number;      // matches CategoryID int primary
  CategoryName: string;    // matches CategoryName nvarchar(255)
}

export interface Enrollment {
  CourseID: number;        // matches CourseID int primary
  AccountID: number;          // matches UserID int primary
  EnrollDate: Date;        // matches EnrollDate datetime
  Status: string;         // matches Status nvarchar(50), e.g., 'enrolled', 'completed'
  CompletionDate?: Date;   // matches CompletionDate datetime, optional if not always present
}


