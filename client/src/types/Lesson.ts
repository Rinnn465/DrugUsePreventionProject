export interface QuizQuestion {
    id: number;
    question: string;
    type?: "single" | "multiple";
    options: QuizOptions[];
    correctAnswer?: string;
    correctAnswers?: string[];
    explanation?: string;
};

export interface QuizOptions {
    id: string | number;
    text: string,
    value: number
}

export interface Lesson {
    id: number;
    title: string;
    briefDescription: string;
    content: string;
    duration?: number;
    videoUrl?: string;
    quiz: QuizQuestion[];
};
