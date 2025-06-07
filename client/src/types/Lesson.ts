export interface LessonQuestion {
    id: number;
    lessonId: number;
    questionText: string;
    type: 'multiple' | 'single';
    answers: LessonAnswer[];
}

export interface LessonAnswer {
    id: number;
    questionId: number;
    answerText: string;
    isCorrect: boolean;
}
export interface Lesson {
    id: number;
    title: string;
    briefDescription: string;
    content: string;
    duration?: number;
    videoUrl?: string;
    question: LessonQuestion[];
};

//////////////////////////////////////////////////////////

export interface sqlLesson {
    LessonID: number;           // matches LessonID
    CourseID: number;
    Title: string        // foreign key to Course
    BriefDescription: string;  // optional if nullable in DB
    Content: string;           // optional if nullable in DB
    Duration?: number;           // in minutes (int)
    VideoUrl?: string;          // optional if nullable
    Status: string;             // e.g., 'Published', 'Draft'
    IsDisabled: boolean;        // whether the lesson is disabled
    Questions: slqLessonQuestion[]; // nested lesson questions (optional)
}


export interface slqLessonQuestion {
    QuestionID: number;       // matches QuestionID
    LessonID: number;         // foreign key to Lesson
    QuestionText: string;     // the actual question
    Type: 'single' | 'multiple'; // from nvarchar(20) - use union for valid values
    IsDisabled: boolean;      // whether this question is disabled
    Answers: sqlLessonAnswer[]; // nested answers (optional)
}
export interface sqlLessonAnswer {
    AnswerID: number;         // matches AnswerID
    QuestionID: number;       // foreign key to LessonQuestion
    AnswerText: string;       // text of the answer
    IsCorrect: boolean;       // whether this is the correct answer
    IsDisabled: boolean;      // whether this answer is disabled
}
