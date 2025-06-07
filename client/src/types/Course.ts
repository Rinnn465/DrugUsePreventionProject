import { Lesson, sqlLesson } from './Lesson';

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  audience: string;
  duration: string;
  lesson: Lesson[];
  imageUrl: string;
  enrolledCount: number;
  isCertified: boolean;
  risk: string;
}

//////////////////////////////////////////////////////////////////
//real course from db 
export interface SqlCourse {
  CourseID: number;        // matches CourseID int primary key
  CourseName: string;
  Duration: number    // matches CourseName nvarchar(255)
  Risk: string;            // matches Risk nvarchar(10)
  Audience?: string;       // matches Audience nvarchar(100), optional if nullable
  Description?: string;    // matches Description nvarchar(1000), optional if nullable
  EnrollCount: number;     // matches EnrollCount int (non-negative)
  ImageUrl?: string;       // matches ImageUrl nvarchar(300), optional if nullable
  Status: string;          // matches Status nvarchar(40)
  IsDisabled: boolean;     // matches IsDisabled BIT
  Lessons: sqlLesson[];
}


