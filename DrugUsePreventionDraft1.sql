CREATE DATABASE DrugUsePreventionDB
USE DrugUsePreventionDB
GO

CREATE TABLE Account (
    AccountID INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    DateOfBirth DATE,
    Role VARCHAR(50) NOT NULL,
    ManagedBy INT,
    CreatedAt DATETIME2 NOT NULL,
    IsDisabled BIT NOT NULL DEFAULT 0
);

CREATE TABLE Course (
    CourseID INT PRIMARY KEY IDENTITY(1,1),
    CourseName VARCHAR(100) NOT NULL,
    Risk VARCHAR(255),
    Audiences VARCHAR(255),
    Description TEXT,
    EnrollCount INT DEFAULT 0,
    Status VARCHAR(20) NOT NULL,
    IsDisabled BIT NOT NULL DEFAULT 0
);

CREATE TABLE Enrollment (
    CourseID INT NOT NULL,
    AccountID INT NOT NULL,
    EnrollmentDate DATETIME2 NOT NULL,
    PRIMARY KEY (CourseID, AccountID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

CREATE TABLE Category (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName VARCHAR(100) NOT NULL
);

CREATE TABLE CourseCategory (
    CategoryID INT NOT NULL,
    CourseID INT NOT NULL,
    PRIMARY KEY (CategoryID, CourseID),
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID),
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE Lesson (
    LessonID INT PRIMARY KEY IDENTITY(1,1),
    CourseID INT NOT NULL,
    Content TEXT NOT NULL,
    Status VARCHAR(20) NOT NULL,
    IsDisabled BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID)
);

CREATE TABLE LessonQuestion (
    QuestionID INT PRIMARY KEY IDENTITY(1,1),
    LessonID INT NOT NULL,
    QuestionText TEXT NOT NULL,
    Type VARCHAR(50) NOT NULL,
    IsDisabled BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (LessonID) REFERENCES Lesson(LessonID)
);

CREATE TABLE LessonAnswer (
    AnswerID INT PRIMARY KEY IDENTITY(1,1),
    QuestionID INT NOT NULL,
    AnswerText TEXT NOT NULL,
    IsCorrect BIT NOT NULL DEFAULT 0,
    IsDisabled BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (QuestionID) REFERENCES LessonQuestion(QuestionID)
);

CREATE TABLE Consultant (
    ConsultantID INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(100) NOT NULL,
    Bio TEXT,
    Title VARCHAR(100),
    Specialties VARCHAR(255),
    Qualifications VARCHAR(255),
    ImageUrl VARCHAR(255),
    IsDisabled BIT NOT NULL DEFAULT 0
);

CREATE TABLE ConsultantSchedule (
    ScheduleID INT PRIMARY KEY IDENTITY(1,1),
    ConsultantID INT NOT NULL,
    Date DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    FOREIGN KEY (ConsultantID) REFERENCES Consultant(ConsultantID)
);

CREATE TABLE Appointment (
    ConsultantID INT NOT NULL,
    AccountID INT NOT NULL,
    Time TIME NOT NULL,
    Date DATE NOT NULL,
    MeetingURL VARCHAR(255),
    Status VARCHAR(20) NOT NULL,
    PRIMARY KEY (ConsultantID, AccountID, Date, Time),
    FOREIGN KEY (ConsultantID) REFERENCES Consultant(ConsultantID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

CREATE TABLE Article (
    BlogID INT PRIMARY KEY IDENTITY(1,1),
    AccountID INT NOT NULL,
    PublishedDate DATETIME2 NOT NULL,
    ImageUrl VARCHAR(255),
    Author VARCHAR(100) NOT NULL,
    Status VARCHAR(20) NOT NULL,
    Content TEXT NOT NULL,
    IsDisabled BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

CREATE TABLE CommunityProgram (
    ProgramID INT PRIMARY KEY IDENTITY(1,1),
    EventName VARCHAR(100) NOT NULL,
    Date DATE NOT NULL,
    Description TEXT,
    Organizer VARCHAR(100),
    ImageUrl VARCHAR(255),
    IsDisabled BIT NOT NULL DEFAULT 0
);

CREATE TABLE CommunityProgramAttendee (
    ProgramID INT NOT NULL,
    AccountID INT NOT NULL,
    RegistrationDate DATETIME2 NOT NULL,
    Status VARCHAR(20) NOT NULL,
    PRIMARY KEY (ProgramID, AccountID),
    FOREIGN KEY (ProgramID) REFERENCES CommunityProgram(ProgramID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

CREATE TABLE Survey (
    SurveyID INT PRIMARY KEY IDENTITY(1,1),
    Type VARCHAR(20) NOT NULL,
    Expected TEXT,
    Improvement TEXT,
    IsDisabled BIT NOT NULL DEFAULT 0
);

CREATE TABLE CommunityProgramSurvey (
    SurveyID INT NOT NULL,
    ProgramID INT NOT NULL,
    Type VARCHAR(20) NOT NULL,
    PRIMARY KEY (SurveyID, ProgramID),
    FOREIGN KEY (SurveyID) REFERENCES Survey(SurveyID),
    FOREIGN KEY (ProgramID) REFERENCES CommunityProgram(ProgramID)
);

CREATE TABLE SurveyResponse (
    SurveyID INT NOT NULL,
    AccountID INT NOT NULL,
    PRIMARY KEY (SurveyID, AccountID),
    FOREIGN KEY (SurveyID) REFERENCES Survey(SurveyID),
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);