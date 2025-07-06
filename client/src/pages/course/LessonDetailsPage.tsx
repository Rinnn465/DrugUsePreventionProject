import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { sqlLesson, sqlLessonAnswer, sqlLessonQuestion } from "../../types/Lesson";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import {
    Play,
    CheckCircle,
    Clock,
    BookOpen,
    Video,
    Award,
    ArrowLeft,
    ChevronRight,
    FileText,
    Lock,
    Zap
} from "lucide-react";

const LessonDetailsPage: React.FC = () => {
    const { id } = useParams();
    const { user } = useUser();
    const isSkippable = import.meta.env.VITE_IS_UNSKIPPABLE === 'true';

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
    const [courseData, setCourseData] = useState<any>(null);
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

        const fetchCourseData = async () => {
            try {
                const courseResponse = await fetch(`http://localhost:5000/api/course/${id}`);
                if (!courseResponse.ok) throw new Error("Failed to fetch course");
                const courseData = await courseResponse.json();
                console.log("Course Data:", courseData.data);
                setCourseData(courseData.data);
            } catch (error) {
                console.error("Fetch course error:", error);
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
            await Promise.all([fetchLessonDetail(), fetchCourseData(), fetchQuestionsAndAnswers()]);
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
                    accountId: user?.AccountID,
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        console.log("Course completed successfully, email sent");
                        // You could add navigation to a completion page here if needed
                    } else {
                        console.error("Failed to complete course");
                    }
                })
                .catch((error) => {
                    console.error("Error completing course:", error);
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

                // In development mode, always allow seeking
                if (!isSkippable) {
                    setLastValidTime((prev) => {
                        const newTime = currentTime; // Allow any time in development
                        console.log(
                            `Last valid time for lesson ${lessonId} (dev mode): ${newTime}s`
                        );
                        return { ...prev, [lessonId.toString()]: newTime };
                    });
                } else {
                    setLastValidTime((prev) => {
                        const newTime = Math.max(prev[lessonId.toString()] || 0, currentTime);
                        console.log(
                            `Last valid time for lesson ${lessonId} (prod mode): ${newTime}s`
                        );
                        return { ...prev, [lessonId.toString()]: newTime };
                    });
                }
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

                // Only prevent seeking in production mode (when isSkippable is true)
                if (isSkippable && currentTime > lastTime && watchedProgress < 80) {
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
        console.log(`Checking if lesson ${lessonId} watched: ${progress}% (threshold: 80%, dev mode: ${!isSkippable})`);

        // In development mode, allow completion with any progress
        // In production mode, require 80% progress
        return !isSkippable ? true : progress >= 80;
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
        } else if (!isLessonVideoWatched(selected) && isSkippable) {
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

    const getTotalLessonsDuration = () => {
        if (!lesson) return 0;
        return lesson.reduce((total, l) => total + (l.Duration || 0), 0);
    };

    const getCompletedLessonsCount = () => {
        return completedLessons.size;
    };

    const getOverallProgress = () => {
        if (!lesson || lesson.length === 0) return 0;
        // Nếu đang ở quiz thì giữ logic cũ
        if (selected === "question") {
            const lessonsProgress = (completedLessons.size / lesson.length) * 80; // 80% cho bài học
            const quizProgress = quizCompleted && passed ? 20 : 0; // 20% cho quiz
            return Math.round(lessonsProgress + quizProgress);
        }
        // Nếu đang ở bài học thì lấy phần trăm video đã xem của bài học hiện tại
        const currentProgress = videoProgress[selected?.toString()] || 0;
        return Math.round(currentProgress);
    };

    const isLessonUnlocked = (lessonIndex: number) => {
        // First lesson is always unlocked
        if (lessonIndex === 0) return true;
        // Subsequent lessons are locked until previous one is completed
        const previousLessonId = lesson?.[lessonIndex - 1]?.LessonID;
        return previousLessonId ? completedLessons.has(previousLessonId) : false;
    };

    const handleContent = () => {
        const selectedLesson = lesson?.find((l) => l.LessonID === selected);
        if (!selectedLesson) return null;

        const isCompleted = completedLessons.has(selected);

        return (
            <div className="space-y-6">
                {/* Course Progress Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">{selectedLesson.Title}</h1>
                                <p className="text-gray-600 flex items-center mt-1">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {selectedLesson.Duration} phút
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Tiến độ khóa học</div>
                            <div className="text-2xl font-bold text-blue-600">{getOverallProgress()}%</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${getOverallProgress()}%` }}
                        ></div>
                    </div>
                </div>

                {/* Video Content */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="relative">
                        <video
                            ref={videoRef}
                            width="100%"
                            height="500px"
                            controls
                            className="w-full object-cover"
                            onTimeUpdate={() => handleVideoTimeUpdate(selectedLesson.LessonID)}
                            onSeeking={() => handleSeeking(selectedLesson.LessonID)}
                            onSeeked={() => handleSeeked(selectedLesson.LessonID)}
                            onEnded={() => handleVideoEnded(selectedLesson.LessonID)}
                            onError={() => toast.error("Không thể tải video. Vui lòng thử lại.")}
                        >
                            <source src={selectedLesson.VideoUrl} type="video/mp4" />
                            Trình duyệt của bạn không hỗ trợ video.
                        </video>

                        {/* Content Section */}
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-3">Nội dung bài học</h2>
                                    <p className="text-gray-600 leading-relaxed">{selectedLesson.Content}</p>
                                </div>
                                {isCompleted && (
                                    <div className="flex items-center space-x-2 text-green-600 ml-4">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="text-sm font-medium">Đã hoàn thành</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Video className="w-4 h-4 mr-1" />
                                        Video bài học
                                    </div>
                                </div>

                                <button
                                    onClick={handleDoneLesson}
                                    disabled={!isLessonVideoWatched(selectedLesson.LessonID)}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${isLessonVideoWatched(selectedLesson.LessonID)
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    <span>
                                        {isCompleted ? "Đã hoàn thành" : !isSkippable ? "Hoàn thành bài học" : "Hoàn thành bài học"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
                <div className="space-y-6">
                    {/* Quiz Header */}
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Bài kiểm tra</h1>
                                <p className="text-gray-600 flex items-center mt-1">
                                    <FileText className="w-4 h-4 mr-1" />
                                    {questions.length} câu hỏi
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Content */}
                    <form className="bg-white rounded-2xl shadow-lg p-6 space-y-6" onSubmit={handleSubmitQuestion}>
                        {!lessonsCompleted && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <div className="flex items-center space-x-2 text-yellow-800">
                                    <Lock className="w-5 h-5" />
                                    <p className="font-medium">Vui lòng hoàn thành tất cả bài học trước khi làm bài kiểm tra.</p>
                                </div>
                            </div>
                        )}

                        {showResults && (
                            <div className={`rounded-xl p-4 ${passed ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                                <div className="flex items-center space-x-2">
                                    {passed ? (
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <Zap className="w-6 h-6 text-red-600" />
                                    )}
                                    <p className={`font-bold ${passed ? "text-green-800" : "text-red-800"}`}>
                                        {passed
                                            ? `🎉 Chúc mừng! Bạn đã vượt qua với ${score}/${questions.length} điểm`
                                            : `💪 Chưa đạt! Bạn được ${score}/${questions.length} điểm. Hãy cố gắng lần sau!`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Questions */}
                        <div className="space-y-6">
                            {questions?.map((question, index) => (
                                <div key={question.QuestionID} className="bg-gray-50 rounded-xl p-5 space-y-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 mb-3">{question.QuestionText}</p>
                                            <div className="space-y-2">
                                                {answers
                                                    ?.filter((answer) => answer.QuestionID === question.QuestionID)
                                                    .map((answer, answerIndex) => (
                                                        <label key={answerIndex} className="flex items-center space-x-3 p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                                                            <input
                                                                type={question.Type === "multiple" ? "checkbox" : "radio"}
                                                                name={`question-${question.QuestionID}`}
                                                                value={answer.AnswerID}
                                                                onChange={(e) =>
                                                                    handleAnswerChange(question.QuestionID, answer.AnswerID.toString(), e.target.checked)
                                                                }
                                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                                                disabled={showResults || !lessonsCompleted}
                                                                checked={(userAnswers[question.QuestionID.toString()] || []).includes(answer.AnswerID.toString())}
                                                            />
                                                            <span className="text-gray-700">{answer.AnswerText}</span>
                                                        </label>
                                                    ))}
                                            </div>
                                            {showResults && !passed && !isQuestionCorrect(question.QuestionID) && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-red-600 text-sm font-medium">❌ Câu trả lời chưa chính xác. Hãy xem lại nội dung bài học.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                {questions.length} câu hỏi • Cần trả lời đúng để hoàn thành khóa học
                            </div>

                            {!showResults && (
                                <button
                                    type="submit"
                                    disabled={!lessonsCompleted}
                                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${lessonsCompleted
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        }`}
                                >
                                    <Award className="w-5 h-5" />
                                    <span>Nộp bài kiểm tra</span>
                                </button>
                            )}

                            {showResults && (
                                <button
                                    type="button"
                                    onClick={passed ? handleRedoWhenCourseCompleted : handleRedoQuiz}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-100 text-white rounded-xl hover:from-blue-700 hover:to-blue-200 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    <Zap className="w-5 h-5" />
                                    <span>Làm lại</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Không có câu hỏi nào cho khóa học này</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Header with Breadcrumb */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/courses"
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Khóa học</span>
                            </Link>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-800 font-medium">
                                {courseData?.Title ? courseData.Title : ""}
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Tiến độ hoàn thành</div>
                                <div className="text-lg font-bold text-blue-600">{getOverallProgress()}%</div>
                            </div>
                            <div className="w-16 h-16 relative">
                                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="2"
                                    />
                                    <path
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        strokeDasharray={`${getOverallProgress()}, 100`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">{getOverallProgress()}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 px-6 flex flex-col lg:flex-row gap-8">
                {/* Enhanced Sidebar */}
                <aside className="lg:w-80 shrink-0">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                        {/* Course Overview */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">Tổng quan khóa học</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        Bài học
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        {getCompletedLessonsCount()}/{lesson?.length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        Thời lượng
                                    </span>
                                    <span className="font-medium text-gray-800">{getTotalLessonsDuration()} phút</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center">
                                        <Award className="w-4 h-4 mr-2" />
                                        Kiểm tra
                                    </span>
                                    <span className="font-medium text-gray-800">
                                        {quizCompleted ? (passed ? "Đã qua" : "Chưa qua") : "Chưa làm"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lesson Navigation */}
                        <nav className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Nội dung khóa học</h4>
                            {lesson &&
                                lesson.map((l, index) => {
                                    const isCompleted = completedLessons.has(l.LessonID);
                                    const isCurrent = selected === l.LessonID;
                                    const isUnlocked = isLessonUnlocked(index);

                                    return (
                                        <button
                                            key={l.LessonID}
                                            className={`w-full text-left p-4 rounded-xl font-medium transition-all duration-200 ${isCurrent
                                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                                                : isCompleted
                                                    ? "bg-green-50 hover:bg-green-100 text-green-800 border border-green-200"
                                                    : isUnlocked
                                                        ? "hover:bg-gray-50 text-gray-700 border border-gray-200"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                            onClick={() => isUnlocked && setSelected(l.LessonID)}
                                            disabled={!isUnlocked}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-5 h-5" />
                                                    ) : isCurrent ? (
                                                        <Play className="w-5 h-5" />
                                                    ) : isUnlocked ? (
                                                        <Video className="w-5 h-5" />
                                                    ) : (
                                                        <Lock className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">
                                                        Bài học {index + 1}
                                                    </div>
                                                    <div className="text-xs opacity-75 truncate">
                                                        {l.Title}
                                                    </div>
                                                    <div className="text-xs opacity-60 flex items-center mt-1">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {l.Duration} phút
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                            {/* Quiz Button */}
                            <button
                                className={`w-full text-left p-4 rounded-xl font-medium transition-all duration-200 ${selected === "question"
                                    ? "bg-gradient-to-r from-blue-600 to-blue-100 text-white shadow-lg transform scale-105"
                                    : areAllLessonsCompleted()
                                        ? "hover:bg-blue-50 text-blue-700 border border-blue-200"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                                onClick={() => areAllLessonsCompleted() && setSelected("question")}
                                disabled={!areAllLessonsCompleted()}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {areAllLessonsCompleted() ? (
                                            <Award className="w-5 h-5" />
                                        ) : (
                                            <Lock className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">Bài kiểm tra</div>
                                        <div className="text-xs opacity-75">
                                            {questions?.length || 0} câu hỏi
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {selected === "question" ? handleQuestion() : handleContent()}
                </main>
            </div>
        </div>
    );
};

export default LessonDetailsPage;