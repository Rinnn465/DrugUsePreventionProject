import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { sqlLesson, sqlLessonAnswer, sqlLessonQuestion } from "../../types/Lesson";

const LessonDetailsPage: React.FC = () => {
    const { id } = useParams();
    const [selected, setSelected] = useState<string | number>('lesson');
    const [lesson, setLesson] = useState<sqlLesson[] | null>(null);
    const [questions, setQuestions] = useState<sqlLessonQuestion[] | null>(null);
    const [answers, setAnswers] = useState<sqlLessonAnswer[] | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);

    useEffect(() => {
        const fetchLessonDetail = async () => {
            try {
                const lessonResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/`);
                if (!lessonResponse.ok) throw new Error('Failed to fetch lesson');
                const lessonData = await lessonResponse.json();
                setLesson(lessonData.data);
            } catch (error) {
                console.log(error);
            }
        };

        const fetchQuestionsAndAnswers = async () => {
            try {
                const questionResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/questions`);
                if (!questionResponse.ok) throw new Error('Failed to fetch questions');
                const questionData = await questionResponse.json();
                setQuestions(questionData.data);

                const answerResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/questions/answers`);
                const data = await answerResponse.json();
                setAnswers(data.data);
            } catch (error) {
                console.log(error);
            }
        };

        const fetchData = async () => {
            await Promise.all([fetchLessonDetail(), fetchQuestionsAndAnswers()]);
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (lesson && lesson.length > 0 && selected === 'lesson') {
            setSelected(lesson[0].LessonID);
        }
    }, [lesson]);

    const handleAnswerChange = (questionId: number, answerId: string, isChecked: boolean) => {
        setUserAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            if (isChecked) {
                return { ...prev, [questionId]: [...currentAnswers, answerId] };
            } else {
                return { ...prev, [questionId]: currentAnswers.filter(id => id !== answerId) };
            }
        });
    };

    const calculateScore = () => {
        let totalScore = 0;
        questions?.forEach(question => {
            const userAnswerIds = userAnswers[question.QuestionID] || [];
            const correctAnswers = answers?.filter(
                answer => answer.QuestionID === question.QuestionID && answer.IsCorrect
            ).map(answer => answer.AnswerID.toString()) || [];

            if (question.Type === 'multiple') {
                const allCorrect = correctAnswers.every(id => userAnswerIds.includes(id));
                const noIncorrect = userAnswerIds.every(id => correctAnswers.includes(id));
                if (allCorrect && noIncorrect) totalScore += 1;
            } else {
                if (userAnswerIds.length === 1 && correctAnswers.includes(userAnswerIds[0])) {
                    totalScore += 1;
                }
            }
        });
        return totalScore;
    };

    const handleDoneLesson = () => {
        if (lesson) {
            const currentIndex = lesson.findIndex(l => l.LessonID === selected);
            if (currentIndex < lesson.length - 1) {
                setSelected(lesson[currentIndex + 1].LessonID);
            } else {
                setSelected('question');
            }
        }
    };

    const handleSubmitQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        const finalScore = calculateScore();
        setScore(finalScore);
        setPassed(finalScore > 0);
        setShowResults(true);
    };

    const handleContent = () => {
        const selectedLesson = lesson?.find(l => l.LessonID === selected);
        if (!selectedLesson) return null;

        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">📚 Nội dung bài học</h2>
                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-xl font-semibold text-gray-700">{selectedLesson.Title}</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedLesson.Content}</p>
                    <iframe
                        width="100%"
                        height="400px"
                        src={selectedLesson.VideoUrl}
                        className="rounded-lg border shadow-md"
                        allowFullScreen
                    ></iframe>
                </div>
                <button
                    onClick={handleDoneLesson}
                    className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                    ✅ Hoàn thành bài học
                </button>
            </div>
        );
    };

    const isQuestionCorrect = (questionId: number) => {
        const userAnswerIds = userAnswers[questionId] || [];
        const correctAnswers = answers?.filter(
            answer => answer.QuestionID === questionId && answer.IsCorrect
        ).map(answer => answer.AnswerID.toString()) || [];

        if (questions?.find(q => q.QuestionID === questionId)?.Type === 'multiple') {
            return correctAnswers.every(id => userAnswerIds.includes(id)) &&
                userAnswerIds.every(id => correctAnswers.includes(id));
        }
        return userAnswerIds.length === 1 && correctAnswers.includes(userAnswerIds[0]);
    };

    const handleQuestion = () => {
        if (questions && questions.length > 0) {
            return (
                <form className="bg-white p-6 rounded-2xl shadow-lg space-y-6" onSubmit={handleSubmitQuestion}>
                    <h2 className="text-2xl font-bold text-gray-800">📝 Câu hỏi bài học</h2>
                    {showResults && (
                        <div className={`p-4 rounded-lg ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
                            <p className="font-bold">
                                {passed
                                    ? `Chúc mừng! Bạn đã vượt qua với số điểm: ${score}/${questions.length}`
                                    : `Rất tiếc! Bạn chưa vượt qua. Điểm: ${score}/${questions.length}`}
                            </p>
                        </div>
                    )}
                    {questions?.map(question => (
                        <div key={question.QuestionID} className="space-y-2">
                            <p className="font-semibold text-gray-700">{question.QuestionText}</p>
                            <div className="pl-4 space-y-1">
                                {answers?.filter(answer => answer.QuestionID === question.QuestionID).map((answer, index) => (
                                    <label key={index} className="flex items-center space-x-2 text-gray-600">
                                        <input
                                            type={question.Type === 'multiple' ? 'checkbox' : 'radio'}
                                            name={`question-${question.QuestionID}`}
                                            value={answer.AnswerID}
                                            onChange={(e) => handleAnswerChange(
                                                question.QuestionID,
                                                answer.AnswerID.toString(),
                                                e.target.checked
                                            )}
                                            className="accent-primary-600"
                                            disabled={showResults}
                                        />
                                        <span>{answer.AnswerText}</span>
                                    </label>
                                ))}
                                {showResults && !passed && !isQuestionCorrect(question.QuestionID) && (
                                    <p className="text-red-500 text-sm">
                                        Câu trả lời không đúng. Vui lòng xem lại nội dung bài học.
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                    {!showResults && (
                        <button
                            type="submit"
                            className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                        >
                            🏁 Hoàn thành
                        </button>
                    )}
                </form>
            );
        }
        return (
            <p className="text-red-400">
                Không có câu hỏi cho bài học này
            </p>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-10 px-6 md:px-20 flex flex-col md:flex-row gap-6">
                <aside className="md:w-52 shrink-0 bg-white rounded-xl shadow-md p-4">
                    <nav className="space-y-2">
                        {lesson && lesson.map((l, index) => (
                            <button
                                key={l.LessonID}
                                className={`w-full text-left px-4 py-2 rounded-lg font-medium transition duration-200 ${selected === l.LessonID
                                    ? 'bg-primary-600 text-white'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                onClick={() => setSelected(l.LessonID)}
                            >
                                📘 Bài học {index + 1}
                            </button>
                        ))}
                        <button
                            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition duration-200 ${selected === 'question'
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            onClick={() => setSelected('question')}
                        >
                            ❓ Câu hỏi
                        </button>
                    </nav>
                </aside>
                <main className="flex-1">
                    {selected === 'question' ? handleQuestion() : handleContent()}
                </main>
            </div>
        </div>
    );
};

export default LessonDetailsPage;