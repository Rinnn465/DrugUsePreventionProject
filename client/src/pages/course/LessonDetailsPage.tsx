import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { sqlLesson, sqlLessonAnswer, sqlLessonQuestion } from "../../types/Lesson";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

const LessonDetailsPage: React.FC = () => {
    const { id } = useParams();
    const { user } = useUser();
    const [selected, setSelected] = useState<string | number>("lesson");
    const [lesson, setLesson] = useState<sqlLesson[] | null>(null);
    const [questions, setQuestions] = useState<sqlLessonQuestion[] | null>(null);
    const [answers, setAnswers] = useState<sqlLessonAnswer[] | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string[] }>({});
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [passed, setPassed] = useState(false);
    const [completedLessons, setCompletedLessons] = useState<Set<string | number>>(
        new Set()
    );
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [videoProgress, setVideoProgress] = useState<{ [key: string]: number }>({});
    const [lastValidTime, setLastValidTime] = useState<{ [key: string]: number }>({});
    const videoRef = useRef<HTMLVideoElement>(null);
    const isSeekingRef = useRef(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [selected]);

    useEffect(() => {
        const fetchLessonDetail = async () => {
            try {
                const lessonResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/`);
                if (!lessonResponse.ok) throw new Error("Failed to fetch lesson");
                const lessonData = await lessonResponse.json();
                console.log("Lessons:", lessonData.data);
                setLesson(lessonData.data);
            } catch (error) {
                console.error("Fetch lesson error:", error);
            }
        };

        const fetchQuestionsAndAnswers = async () => {
            try {
                const questionResponse = await fetch(
                    `http://localhost:5000/api/course/${id}/lessons/questions`
                );
                if (!questionResponse.ok) throw new Error("Failed to fetch questions");
                const questionData = await questionResponse.json();
                console.log("Questions:", questionData.data);
                setQuestions(questionData.data);

                const answerResponse = await fetch(
                    `http://localhost:5000/api/course/${id}/lessons/questions/answers`
                );
                const answerData = await answerResponse.json();
                console.log("Answers:", answerData.data);
                setAnswers(answerData.data);
            } catch (error) {
                console.error("Fetch questions/answers error:", error);
            }
        };

        const fetchData = async () => {
            await Promise.all([fetchLessonDetail(), fetchQuestionsAndAnswers()]);
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (lesson && lesson.length > 0 && selected === "lesson") {
            setSelected(lesson[0].LessonID);
        }
    }, [lesson]);

    // Reset video progress and last valid time when switching lessons
    useEffect(() => {
        if (selected !== "question" && videoRef.current) {
            videoRef.current.currentTime = 0; // Reset video to start
            setVideoProgress((prev) => ({
                ...prev,
                [selected.toString()]: 0,
            }));
            setLastValidTime((prev) => ({
                ...prev,
                [selected.toString()]: 0,
            }));
            console.log(`Reset video state for lesson ${selected}`);
        }
    }, [selected]);

    useEffect(() => {
        if (quizCompleted && passed) {
            console.log("Quiz completed and passed. Checking course completion...");
            checkCourseCompletion();
        }
    }, [quizCompleted, passed]);

    const checkCourseCompletion = () => {
        const allLessonsCompleted = !lesson || completedLessons.size === lesson.length;
        const allQuestionsCompleted = !questions || quizCompleted;
        console.log("Checking completion:", {
            allLessonsCompleted,
            allQuestionsCompleted,
            quizCompleted,
        });
        if (allLessonsCompleted && allQuestionsCompleted) {
            toast.success("Chúc mừng! Bạn đã hoàn thành khóa học.");
            fetch(`http://localhost:5000/api/course/${id}/complete`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId: id,
                    accountId: user?.AccountID,
                }),
            });
            return true;
        }
        return false;
    };

    const handleVideoTimeUpdate = (lessonId: string | number) => {
        if (videoRef.current && !isSeekingRef.current && !videoRef.current.paused) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration && !isNaN(duration)) {
                const progress = (currentTime / duration) * 100;
                setVideoProgress((prev) => {
                    const newProgress = { ...prev, [lessonId.toString()]: progress };
                    console.log(
                        `Video progress for lesson ${lessonId}: ${progress}% (currentTime: ${currentTime}s)`
                    );
                    return newProgress;
                });
                setLastValidTime((prev) => {
                    const newTime = Math.max(prev[lessonId.toString()] || 0, currentTime);
                    console.log(
                        `Last valid time for lesson ${lessonId}: ${newTime}s (isSeeking: ${isSeekingRef.current})`
                    );
                    return { ...prev, [lessonId.toString()]: newTime };
                });
            }
        }
    };

    const handleVideoEnded = (lessonId: string | number) => {
        setVideoProgress((prev) => {
            const newProgress = { ...prev, [lessonId.toString()]: 100 };
            console.log(`Video ended for lesson ${lessonId}: 100%`);
            return newProgress;
        });
        setLastValidTime((prev) => {
            const duration = videoRef.current?.duration || 0;
            console.log(`Last valid time set to duration for lesson ${lessonId}: ${duration}s`);
            return { ...prev, [lessonId.toString()]: duration };
        });
    };

    const handleSeeking = (lessonId: string | number) => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            const lastTime = lastValidTime[lessonId.toString()] || 0;
            if (duration && !isNaN(duration)) {
                const watchedProgress = (lastTime / duration) * 100;
                if (currentTime > lastTime && watchedProgress < 80) {
                    isSeekingRef.current = true;
                    videoRef.current.currentTime = lastTime;
                    toast.info("Vui lòng xem ít nhất 80% video trước khi hoàn thành bài học.");
                    console.log(
                        `Seek prevented for lesson ${lessonId}. Reverted to ${lastTime}s (attempted: ${currentTime}s, watchedProgress: ${watchedProgress}%)`
                    );
                } else {
                    console.log(
                        `Seek allowed for lesson ${lessonId}. Current time: ${currentTime}s, lastTime: ${lastTime}s, watchedProgress: ${watchedProgress}%`
                    );
                }
            }
        }
    };

    const handleSeeked = (lessonId: string | number) => {
        isSeekingRef.current = false;
        console.log(`Seek completed for lesson ${lessonId}. isSeeking: ${isSeekingRef.current}`);
    };

    const isLessonVideoWatched = (lessonId: string | number) => {
        const progress = videoProgress[lessonId.toString()] || 0;
        console.log(`Checking if lesson ${lessonId} watched: ${progress}% (threshold: 80%)`);
        return progress >= 80;
    };

    const handleAnswerChange = (questionId: number, answerId: string, isChecked: boolean) => {
        setUserAnswers((prev) => {
            const currentAnswers = prev[questionId.toString()] || [];
            if (isChecked) {
                const newAnswers = [...currentAnswers, answerId];
                console.log(`Question ${questionId} selected answers:`, newAnswers);
                return { ...prev, [questionId.toString()]: newAnswers };
            } else {
                const newAnswers = currentAnswers.filter((id) => id !== answerId);
                console.log(`Question ${questionId} updated answers:`, newAnswers);
                return { ...prev, [questionId.toString()]: newAnswers };
            }
        });
    };

    const calculateScore = () => {
        let totalScore = 0;
        if (!questions || !answers) {
            console.log("No questions or answers available");
            return totalScore;
        }

        questions.forEach((question) => {
            const userAnswerIds = userAnswers[question.QuestionID.toString()] || [];
            const correctAnswers = answers
                .filter((answer) => answer.QuestionID === question.QuestionID && answer.IsCorrect)
                .map((answer) => answer.AnswerID.toString());

            console.log(`Question ${question.QuestionID}:`, {
                userAnswerIds,
                correctAnswers,
                questionType: question.Type,
            });

            if (question.Type === "multiple") {
                const allCorrect = correctAnswers.every((id) => userAnswerIds.includes(id));
                const noIncorrect = userAnswerIds.every((id) => correctAnswers.includes(id));
                if (allCorrect && noIncorrect && userAnswerIds.length > 0) {
                    totalScore += 1;
                    console.log(`Question ${question.QuestionID} correct (multiple choice)`);
                }
            } else {
                if (userAnswerIds.length === 1 && correctAnswers.includes(userAnswerIds[0])) {
                    totalScore += 1;
                    console.log(`Question ${question.QuestionID} correct (single choice)`);
                }
            }
        });
        console.log("Total Score:", totalScore);
        return totalScore;
    };

    const handleDoneLesson = () => {
        if (lesson && selected !== "question" && isLessonVideoWatched(selected)) {
            setCompletedLessons((prev) => new Set(prev).add(selected));
            const currentIndex = lesson.findIndex((l) => l.LessonID === selected);
            if (currentIndex < lesson.length - 1) {
                setSelected(lesson[currentIndex + 1].LessonID);
            } else if (questions && questions.length > 0) {
                setSelected("question");
            } else {
                checkCourseCompletion();
            }
        } else if (!isLessonVideoWatched(selected)) {
            toast.info("Vui lòng xem ít nhất 80% video trước khi hoàn thành bài học.");
        } else {
            checkCourseCompletion();
        }
    };

    const handleSubmitQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        const finalScore = calculateScore();
        const hasPassed = finalScore > 0;
        setScore(finalScore);
        setPassed(hasPassed);
        setShowResults(true);
        setQuizCompleted(true);
        console.log("Quiz submitted:", { finalScore, hasPassed, quizCompleted: true });
    };

    const handleRedoQuiz = () => {
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
        setPassed(false);
        setQuizCompleted(false);
        console.log("Quiz reset. quizCompleted:", false);
    };

    const handleRedoWhenCourseCompleted = () => {
        setUserAnswers({});
        setShowResults(false);
        setScore(0);
    }

    const areAllLessonsCompleted = () => {
        return lesson && lesson.length > 0 ? completedLessons.size === lesson.length : true;
    };

    const handleContent = () => {
        const selectedLesson = lesson?.find((l) => l.LessonID === selected);
        if (!selectedLesson) return null;

        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">📚 Nội dung bài học</h2>
                <div className="space-y-4 border-b pb-6">
                    <h3 className="text-xl font-semibold text-gray-700">{selectedLesson.Title}</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedLesson.Content}</p>
                    <video
                        ref={videoRef}
                        width="100%"
                        height="400px"
                        controls
                        className="rounded-lg border shadow-md"
                        onTimeUpdate={() => handleVideoTimeUpdate(selectedLesson.LessonID)}
                        onSeeking={() => handleSeeking(selectedLesson.LessonID)}
                        onSeeked={() => handleSeeked(selectedLesson.LessonID)}
                        onEnded={() => handleVideoEnded(selectedLesson.LessonID)}
                        onError={() => toast.error("Không thể tải video. Vui lòng thử lại.")}
                    >
                        <source src={selectedLesson.VideoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <button
                    onClick={handleDoneLesson}
                    disabled={!isLessonVideoWatched(selectedLesson.LessonID)}
                    className={`mt-4 px-6 py-3 rounded-lg font-medium transition duration-200 ${isLessonVideoWatched(selectedLesson.LessonID)
                        ? "bg-primary-600 text-white hover:bg-primary-700"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    Hoàn thành bài học
                </button>
            </div>
        );
    };

    const isQuestionCorrect = (questionId: number) => {
        const userAnswerIds = userAnswers[questionId.toString()] || [];
        const correctAnswers =
            answers?.filter((answer) => answer.QuestionID === questionId && answer.IsCorrect).map((answer) => answer.AnswerID.toString()) || [];

        if (questions?.find((q) => q.QuestionID === questionId)?.Type === "multiple") {
            return (
                correctAnswers.every((id) => userAnswerIds.includes(id)) && userAnswerIds.every((id) => correctAnswers.includes(id))
            );
        }
        return userAnswerIds.length === 1 && correctAnswers.includes(userAnswerIds[0]);
    };

    const handleQuestion = () => {
        if (questions && questions.length > 0) {
            const lessonsCompleted = areAllLessonsCompleted();
            return (
                <form className="bg-white p-6 rounded-2xl shadow-lg space-y-6" onSubmit={handleSubmitQuestion}>
                    <h2 className="text-2xl font-bold text-gray-800">Bài kiểm tra</h2>
                    {!lessonsCompleted && (
                        <p className="text-red-500">Vui lòng hoàn thành tất cả bài học trước khi làm bài kiểm tra.</p>
                    )}
                    {showResults && (
                        <div className={`p-4 rounded-lg ${passed ? "bg-green-100" : "bg-red-100"}`}>
                            <p className="font-bold">
                                {passed
                                    ? `Chúc mừng! Bạn đã vượt qua với số điểm: ${score}/${questions.length}`
                                    : `Rất tiếc! Bạn chưa vượt qua. Điểm: ${score}/${questions.length}`}
                            </p>
                        </div>
                    )}
                    {questions?.map((question) => (
                        <div key={question.QuestionID} className="space-y-2">
                            <p className="font-semibold text-gray-700">{question.QuestionText}</p>
                            <div className="pl-4 space-y-1">
                                {answers
                                    ?.filter((answer) => answer.QuestionID === question.QuestionID)
                                    .map((answer, index) => (
                                        <label key={index} className="flex items-center space-x-2 text-gray-600">
                                            <input
                                                type={question.Type === "multiple" ? "checkbox" : "radio"}
                                                name={`question-${question.QuestionID}`}
                                                value={answer.AnswerID}
                                                onChange={(e) =>
                                                    handleAnswerChange(question.QuestionID, answer.AnswerID.toString(), e.target.checked)
                                                }
                                                className="accent-primary-600"
                                                disabled={showResults || !lessonsCompleted}
                                                checked={(userAnswers[question.QuestionID.toString()] || []).includes(answer.AnswerID.toString())}
                                            />
                                            <span>{answer.AnswerText}</span>
                                        </label>
                                    ))}
                                {showResults && !passed && !isQuestionCorrect(question.QuestionID) && (
                                    <p className="text-red-500 text-sm">Câu trả lời không đúng. Vui lòng xem lại nội dung bài học.</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {!showResults && (
                        <button
                            type="submit"
                            disabled={!lessonsCompleted}
                            className={`mt-4 px-6 py-3 rounded-lg font-medium transition duration-200 ${lessonsCompleted
                                ? "bg-primary-600 text-white hover:bg-primary-700"
                                : "bg-gray-400 text-gray-200 cursor-not-allowed"
                                }`}
                        >
                            Nộp bài
                        </button>
                    )}
                    {showResults && (
                        <button
                            type="button"
                            onClick={
                                passed ? handleRedoWhenCourseCompleted : handleRedoQuiz
                            }
                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Làm lại
                        </button>
                    )}
                </form>
            );
        }
        return <p className="text-red-400">Không có câu hỏi cho bài học này</p>;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-10 px-6 md:px-20 flex flex-col md:flex-row gap-6">
                <aside className="md:w-52 shrink-0 bg-white rounded-xl shadow-md p-4">
                    <nav className="space-y-2">
                        {lesson &&
                            lesson.map((l, index) => (
                                <button
                                    key={l.LessonID}
                                    className={`w-full text-left px-4 py-2 rounded-lg font-medium transition duration-200 ${selected === l.LessonID ? "bg-primary-600 text-white" : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                    onClick={() => setSelected(l.LessonID)}
                                >
                                    📘 Bài học {index + 1}
                                </button>
                            ))}
                        <button
                            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition duration-200 ${selected === "question" ? "bg-primary-600 text-white" : "hover:bg-gray-100 text-gray-700"
                                }`}
                            onClick={() => setSelected("question")}
                        >
                            ❓ Câu hỏi
                        </button>
                    </nav>
                </aside>
                <main className="flex-1">{selected === "question" ? handleQuestion() : handleContent()}</main>
            </div>
        </div>
    );
};

export default LessonDetailsPage;