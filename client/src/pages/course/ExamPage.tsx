import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { CourseExam, ExamQuestion, ExamAnswer } from "../../types/Exam";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";
import { courses } from "../../utils/apiUtils";
import {
    CheckCircle,
    Clock,
    Award,
    ArrowLeft,
    FileText,
    AlertCircle,
    BookOpen
} from "lucide-react";

const ExamPage: React.FC = () => {
    const { id } = useParams(); // course id
    const { user } = useUser();

    const [exam, setExam] = useState<CourseExam | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number[] }>({});
    const [showResults, setShowResults] = useState(false);
    const [examResult, setExamResult] = useState<{
        score: number;
        correctAnswersCount: number;
        totalQuestionsCount: number;
        passed: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [examStarted, setExamStarted] = useState(false);
    const [renderKey, setRenderKey] = useState(0); // Force re-render key

    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const examData = await courses.getExam(Number(id));
                console.log('=== FETCHED EXAM DATA ===');
                console.log('Exam data:', examData);
                console.log('Questions count:', examData.data?.Questions?.length || 0);
                console.log('========================');
                setExam(examData.data || examData);
                setTimeLeft(30 * 60); // 30 minutes default
            } catch (error) {
                console.error("Fetch exam error:", error);
                toast.error("Không thể tải thông tin bài thi");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchExam();
        }
    }, [id]);

    const handleStartExam = () => {
        setExamStarted(true);
        toast.info("Bài thi đã bắt đầu! Bạn có 30 phút để hoàn thành.");
    };

    const handleAnswerChange = (questionId: number, answerId: number, isMultiple: boolean) => {
        setUserAnswers(prev => {
            const currentAnswers = prev[questionId] || [];
            
            if (isMultiple) {
                // Multiple choice - toggle answer
                if (currentAnswers.includes(answerId)) {
                    return {
                        ...prev,
                        [questionId]: currentAnswers.filter(id => id !== answerId)
                    };
                } else {
                    return {
                        ...prev,
                        [questionId]: [...currentAnswers, answerId]
                    };
                }
            } else {
                // Single choice - replace answer
                return {
                    ...prev,
                    [questionId]: [answerId]
                };
            }
        });
    };

    const handleSubmitExam = useCallback(async () => {
        if (!exam || !user?.AccountID) {
            toast.error("Thông tin bài thi hoặc người dùng không hợp lệ");
            return;
        }

        // Check if all questions are answered
        const unansweredQuestions = exam.Questions.filter(q => 
            !userAnswers[q.QuestionID] || userAnswers[q.QuestionID].length === 0
        );
        
        if (unansweredQuestions.length > 0) {
            const proceed = window.confirm(
                `Bạn chưa trả lời ${unansweredQuestions.length} câu hỏi. Bạn có muốn nộp bài?`
            );
            if (!proceed) return;
        }

        setSubmitting(true);
        
        try {
            const submissionData = {
                examId: exam.ExamID,
                accountId: user.AccountID,
                answers: Object.entries(userAnswers).map(([questionId, selectedAnswers]) => ({
                    questionId: parseInt(questionId),
                    selectedAnswers
                }))
            };

            const result = await courses.submitExam(submissionData);
            
            console.log('=== EXAM RESULT DEBUG ===');
            console.log('Full result:', result);
            console.log('Result keys:', Object.keys(result));
            console.log('Raw result JSON:', JSON.stringify(result, null, 2));
            console.log('Type of result:', typeof result);
            console.log('Correct count:', result.correctCount);
            console.log('Total questions:', result.totalQuestions);
            console.log('Score:', result.score);
            console.log('Is passed:', result.isPassed);
            console.log('========================');
            
            // Sử dụng dữ liệu từ response với validation
            const correctAnswers = Number(result.correctCount) || 0;
            const totalQuestions = Number(result.totalQuestions) || 1;
            const scorePercentage = Number(result.score) || Math.round((correctAnswers / totalQuestions) * 100);
            
            console.log('=== PROCESSED VALUES DEBUG ===');
            console.log('Processed correctAnswers:', correctAnswers);
            console.log('Processed totalQuestions:', totalQuestions);
            console.log('Processed scorePercentage:', scorePercentage);
            console.log('Using direct result.score:', result.score);
            console.log('Using direct result.correctCount:', result.correctCount);
            console.log('===============================');
            
            // Set the result data and show results together
            const resultData = {
                score: scorePercentage,
                correctAnswersCount: correctAnswers,
                totalQuestionsCount: totalQuestions,
                passed: result.isPassed
            };
            
            console.log('=== STATE UPDATE DEBUG ===');
            console.log('Setting resultData:', resultData);
            console.log('===========================');
            
            // Set both states together to avoid timing issues
            setExamResult(resultData);
            setShowResults(true);
            setExamStarted(false);
            setRenderKey(prev => prev + 1); // Force re-render
            
            // Additional debug after state set
            setTimeout(() => {
                console.log('=== AFTER STATE SET (100ms delay) ===');
                console.log('examResult after setState:', resultData);
                console.log('showResults after setState:', true);
                console.log('=====================================');
            }, 100);
            
            console.log('=== STATE UPDATE DEBUG ===');
            console.log('Setting score to:', scorePercentage);
            console.log('Setting correctAnswersCount to:', correctAnswers);
            console.log('Setting totalQuestionsCount to:', totalQuestions);
            console.log('Setting passed to:', result.isPassed);
            console.log('Final examResult object:', {
                score: scorePercentage,
                correctAnswersCount: correctAnswers,
                totalQuestionsCount: totalQuestions,
                passed: result.isPassed
            });
            console.log('=============================');
            
            if (result.isPassed) {
                toast.success(`Chúc mừng! Bạn đã trả lời đúng ${correctAnswers}/${totalQuestions} câu (${scorePercentage}%) và vượt qua bài thi!`);
            } else {
                toast.error(`Bạn trả lời đúng ${correctAnswers}/${totalQuestions} câu (${scorePercentage}%). Điểm tối thiểu là ${exam.PassingScore}%. Hãy thử lại!`);
            }
        } catch (error) {
            console.error("Submit exam error:", error);
            toast.error("Không thể nộp bài thi. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    }, [exam, user?.AccountID, userAnswers]);

    // Timer for exam - moved after handleSubmitExam definition
    useEffect(() => {
        if (examStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Auto submit when time runs out
                        handleSubmitExam();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [examStarted, timeLeft, handleSubmitExam]);

    // Debug effect to track state changes
    useEffect(() => {
        console.log('=== STATE CHANGE DEBUG ===');
        console.log('examResult:', examResult);
        console.log('showResults:', showResults);
        console.log('renderKey:', renderKey);
        if (examResult) {
            console.log('examResult values:');
            console.log('- score:', examResult.score);
            console.log('- correctAnswersCount:', examResult.correctAnswersCount);
            console.log('- totalQuestionsCount:', examResult.totalQuestionsCount);
            console.log('- passed:', examResult.passed);
        }
        console.log('==========================');
    }, [examResult, showResults, renderKey]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getCorrectAnswers = (question: ExamQuestion): ExamAnswer[] => {
        return question.Answers.filter(answer => answer.IsCorrect);
    };

    const isAnswerCorrect = (questionId: number, answerId: number): boolean => {
        const question = exam?.Questions.find(q => q.QuestionID === questionId);
        if (!question) return false;
        
        const correctAnswers = getCorrectAnswers(question);
        return correctAnswers.some(answer => answer.AnswerID === answerId);
    };

    const renderQuestion = (question: ExamQuestion, index: number) => {
        const userQuestionAnswers = userAnswers[question.QuestionID] || [];
        const isMultiple = question.Type === 'multiple';
        
        return (
            <div key={question.QuestionID} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-4">
                            {question.QuestionText}
                        </h3>
                        
                        {isMultiple && (
                            <p className="text-sm text-amber-600 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Câu hỏi nhiều lựa chọn - Chọn tất cả đáp án đúng
                            </p>
                        )}
                        
                        <div className="space-y-3">
                            {question.Answers.map((answer) => {
                                const isSelected = userQuestionAnswers.includes(answer.AnswerID);
                                const isCorrect = showResults && isAnswerCorrect(question.QuestionID, answer.AnswerID);
                                const isIncorrect = showResults && isSelected && !isCorrect;
                                
                                return (
                                    <label
                                        key={answer.AnswerID}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                            showResults
                                                ? isCorrect
                                                    ? 'bg-green-50 border-green-200'
                                                    : isIncorrect
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'bg-gray-50 border-gray-200'
                                                : isSelected
                                                ? 'bg-blue-50 border-blue-200'
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type={isMultiple ? "checkbox" : "radio"}
                                            name={`question-${question.QuestionID}`}
                                            value={answer.AnswerID}
                                            checked={isSelected}
                                            onChange={() => handleAnswerChange(question.QuestionID, answer.AnswerID, isMultiple)}
                                            disabled={showResults || !examStarted}
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className={`flex-1 ${
                                            showResults
                                                ? isCorrect
                                                    ? 'text-green-800'
                                                    : isIncorrect
                                                    ? 'text-red-800'
                                                    : 'text-gray-700'
                                                : 'text-gray-900'
                                        }`}>
                                            {answer.AnswerText}
                                        </span>
                                        {showResults && isCorrect && (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };    const renderExamResults = useCallback(() => {
        console.log('=== RENDER FUNCTION CALLED ===');
        console.log('showResults:', showResults);
        console.log('exam exists:', !!exam);
        console.log('examResult exists:', !!examResult);
        console.log('examResult content:', examResult);
        console.log('==============================');
        
        if (!showResults || !exam || !examResult) {
            console.log('Early return from renderExamResults');
            return null;
        }
        
        const totalQuestions = exam.Questions.length;
        const answeredQuestions = Object.keys(userAnswers).length;
        
        console.log('=== RENDER RESULTS DEBUG ===');
        console.log('showResults:', showResults);
        console.log('examResult object:', examResult);
        console.log('examResult.score:', examResult.score);
        console.log('examResult.correctAnswersCount:', examResult.correctAnswersCount);
        console.log('examResult.totalQuestionsCount:', examResult.totalQuestionsCount);
        console.log('examResult.passed:', examResult.passed);
        console.log('Component render time:', new Date().toISOString());
        console.log('About to render with values:');
        console.log('- Score display:', examResult.score || 0);
        console.log('- Correct answers display:', examResult.correctAnswersCount || 0);
        console.log('- Total questions display:', examResult.totalQuestionsCount || 0);
        console.log('============================');

        return (
            <div key={`exam-result-${renderKey}-${examResult.score}-${examResult.correctAnswersCount}-${Date.now()}`} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-blue-600" />
                    Kết quả bài thi
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{examResult.score || 0}%</div>
                        <div className="text-sm text-blue-700">Điểm số</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{examResult.correctAnswersCount || 0}/{examResult.totalQuestionsCount || 0}</div>
                        <div className="text-sm text-green-700">Câu trả lời đúng</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{answeredQuestions}/{totalQuestions}</div>
                        <div className="text-sm text-gray-700">Câu đã trả lời</div>
                    </div>
                    <div className={`p-4 rounded-lg ${examResult.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className={`text-2xl font-bold ${examResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {examResult.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
                        </div>
                        <div className={`text-sm ${examResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                            Yêu cầu: {exam.PassingScore}%
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [showResults, exam, examResult, userAnswers, renderKey]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải bài thi...</p>
                </div>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Không tìm thấy bài thi</p>
                    <Link 
                        to={`/courses/${id}`}
                        className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại khóa học
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link 
                                to={`/courses/${id}`}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span>Quay lại khóa học</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-300" />
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                <span className="font-medium">{exam.ExamTitle}</span>
                            </div>
                        </div>
                        
                        {examStarted && !showResults && (
                            <div className="flex items-center gap-2 text-red-600">
                                <Clock className="w-5 h-5" />
                                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!examStarted && !showResults && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.ExamTitle}</h1>
                        <p className="text-gray-600 mb-6">{exam.ExamDescription}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-xl font-bold text-blue-600">{exam.Questions.length}</div>
                                <div className="text-sm text-blue-700">Câu hỏi</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-xl font-bold text-green-600">30</div>
                                <div className="text-sm text-green-700">Phút</div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <div className="text-xl font-bold text-amber-600">{exam.PassingScore}%</div>
                                <div className="text-sm text-amber-700">Điểm đạt</div>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleStartExam}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Bắt đầu làm bài
                        </button>
                    </div>
                )}

                {showResults && renderExamResults()}

                {examStarted && (
                    <div className="space-y-6">
                        {exam.Questions.map((question, index) => renderQuestion(question, index))}
                        
                        {!showResults && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Đã trả lời {Object.keys(userAnswers).length} / {exam.Questions.length} câu hỏi
                                    </div>
                                    <button
                                        onClick={handleSubmitExam}
                                        disabled={submitting}
                                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamPage;
