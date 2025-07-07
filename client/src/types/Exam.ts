export interface ExamQuestion {
    QuestionID: number;
    ExamID: number;
    QuestionText: string;
    Type: 'multiple' | 'single';
    IsDisabled: boolean;
    Answers: ExamAnswer[];
}

export interface ExamAnswer {
    AnswerID: number;
    QuestionID: number;
    AnswerText: string;
    IsCorrect: boolean;
    IsDisabled: boolean;
}

export interface CourseExam {
    ExamID: number;
    CourseID: number;
    ExamTitle: string;
    ExamDescription?: string;
    PassingScore: number;
    IsDisabled: boolean;
    Questions: ExamQuestion[];
}

export interface ExamAnswerDetail {
    questionId: number;
    selectedAnswers: number[];
    correctAnswers: number[];
    isCorrect: boolean;
}

export interface ExamAnswerData {
    answers: ExamAnswerDetail[];
    totalQuestions: number;
    correctCount: number;
    startTime: string;
    endTime: string;
    timeTaken: number; // in seconds
}

export interface ExamSubmission {
    examId: number;
    accountId: number;
    answers: Array<{
        questionId: number;
        selectedAnswers: number[];
    }>;
}

export interface ExamResult {
    ResultID: number;
    ExamID: number;
    AccountID: number;
    CorrectAnswers: number;
    IsPassed: boolean;
    AnswerData?: string; // JSON string chứa chi tiết câu trả lời
    CreatedAt?: string; // Timestamp khi tạo kết quả
    UpdatedAt?: string; // Timestamp khi cập nhật
}

export interface ExamSubmitResponse {
    message: string;
    resultId: number;
    correctAnswers: number;
    totalQuestions: number;
    isPassed: boolean;
    answerData: ExamAnswerData;
}

// Interface cho việc tạo mới ExamQuestion
export interface CreateExamQuestion {
    ExamID: number;
    QuestionText: string;
    Type: 'multiple' | 'single' | 'true_false';
    IsDisabled?: boolean;
}

// Interface cho việc tạo mới ExamAnswer
export interface CreateExamAnswer {
    QuestionID: number;
    AnswerText: string;
    IsCorrect: boolean;
    IsDisabled?: boolean;
}

// Interface cho việc tạo mới CourseExam
export interface CreateCourseExam {
    CourseID: number;
    ExamTitle: string;
    ExamDescription?: string;
    PassingScore?: number;
    IsDisabled?: boolean;
}

// Interface cho dữ liệu raw từ database (join tables)
export interface ExamQuestionAnswerRaw {
    // CourseExam fields
    ExamID: number;
    CourseID: number;
    ExamTitle: string;
    ExamDescription?: string;
    PassingScore: number;
    ExamIsDisabled: boolean;
    
    // ExamQuestion fields
    QuestionID?: number;
    QuestionText?: string;
    QuestionType?: string;
    QuestionIsDisabled?: boolean;
    
    // ExamAnswer fields
    AnswerID?: number;
    AnswerText?: string;
    IsCorrect?: boolean;
    AnswerIsDisabled?: boolean;
}
