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
