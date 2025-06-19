export type Account = {
  AccountID: number;
  Username: string;
  Email: string;
  Password: string;
  FullName: string;
  DateOfBirth: Date | null; // ISO date string
  RoleID: string;
  CreatedAt: Date; // ISO datetime string
  IsDisabled: boolean;
  ResetToken?: string | null;
  ResetTokenExpiry: string | null; // ISO datetime string
};

export type Course = {
  CourseID: number;
  CourseName: string;
  Risk: string;
  Audience?: string | null;
  Duration?: number | null;
  Description?: string | null;
  EnrollCount: number;
  ImageUrl?: string | null;
  Status: string;
  IsDisabled: boolean;
};

export type Enrollment = {
  EnrollmentID: number;
  CourseID: number;
  AccountID: number;
  EnrollmentDate: string; // ISO datetime
  Status: string;
};
export type Category = {
  CategoryID: number;
  CategoryName: string;
};
export type CourseCategory = {
  CategoryID: number;
  CourseID: number;
};
export type Lesson = {
  LessonID: number;
  CourseID: number;
  Title: string;
  BriefDescription?: string | null;
  Content?: string | null;
  Duration?: number | null;
  VideoUrl?: string | null;
  Status?: string | null;
  IsDisabled: boolean;
};
export type LessonQuestion = {
  QuestionID: number;
  LessonID: number;
  QuestionText?: string | null;
  Type: string;
  IsDisabled: boolean;
};
export type LessonAnswer = {
  AnswerID: number;
  QuestionID: number;
  AnswerText?: string | null;
  IsCorrect: boolean;
  IsDisabled: boolean;
};
export type Consultant = {
  ConsultantID: number;
  Name: string;
  Bio?: string | null;
  Title?: string | null;
  Specialties?: string | null;
  Qualifications?: string | null;
  ImageUrl?: string | null;
  IsDisabled: boolean;
};
export type ConsultantSchedule = {
  ScheduleID: number;
  ConsultantID: number;
  Date: string; // ISO date
  StartTime: string; // HH:mm:ss
  EndTime: string;
};
export type Appointment = {
  AppointmentID: number;
  ConsultantID: number;
  AccountID: number;
  Time: string; // HH:mm:ss
  Date: string; // ISO date
  MeetingURL?: string | null;
  Status: string;
  Description?: string | null;
  Duration: number; // in minutes
};
export type Article = {
  BlogID: number;
  AccountID: number;
  ArticleTitle?: string | null;
  PublishedDate: string; // ISO date
  ImageUrl?: string | null;
  Author: string;
  Status: string;
  Content: string;
  IsDisabled: boolean;
};
export type CommunityProgram = {
  ProgramID: number;
  ProgramName: string;
  Type?: string | null; // "online" | "offline"
  Date: string; // ISO date
  Description?: string | null;
  Organizer?: string | null;
  Location?: string | null;
  Url?: string | null;
  ImageUrl?: string | null;
  IsDisabled: boolean;
};
export type CommunityProgramAttendee = {
  ProgramID: number;
  AccountID: number;
  RegistrationDate: string; // ISO datetime
  Status: string;
};
export type SurveyCategory = {
  SurveyCategoryID: number;
  SurveyCategoryName?: string | null;
};
export type Survey = {
  SurveyID: number;
  Description: string;
  Type: boolean; // true for content, false for checkbox
  SurveyCategoryID?: number | null;
};
export type SurveyResponse = {
  SurveyResponseID: number;
  Reply: string;
  SurveyID: number;
};
export type CommunityProgramSurvey = {
  SurveyID: number;
  ProgramID: number;
};

export type CommunityProgramSurveyDTO = {
  ProgramID: number;
  Name: string;
  Description: string;
  surveys: Survey[];
};
