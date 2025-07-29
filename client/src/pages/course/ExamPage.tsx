import { useParams, Link, useLocation } from "react-router-dom";
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
import { sqlLesson } from "@/types/Lesson";

const ExamPage: React.FC = () => {

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDhPBhS0mDpvir-QC0eIQb2bE5jXt3lWCA';

    const { id } = useParams(); // course id
    const { user } = useUser();
    const state = useLocation().state as { courseId?: number; lessons?: sqlLesson[] };

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
    const [renderKey, setRenderKey] = useState(0);
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const lessonContent = state.lessons && state?.lessons.map((lesson) => {
        return {
            title: lesson.Title,
            content: lesson.Content,
        }
    })


    useEffect(() => {
        window.scrollTo(0, 0);
        getAISuggestion();
    }, [showResults])


    useEffect(() => {
        const fetchExam = async () => {
            try {
                setLoading(true);
                const examData = await courses.getExam(Number(id));
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
        localStorage.setItem('examStarted', 'true');
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

    const completeCourse = useCallback(async () => {
        if (!user?.AccountID) {
            toast.error("Bạn cần đăng nhập để hoàn thành khóa học");
            return;
        }

        try {
            await courses.complete(Number(id), user.AccountID);
            toast.success("🏆 Khóa học đã được hoàn thành thành công!");
        } catch (error) {
            console.error("Error completing course:", error);
            toast.error("Không thể hoàn thành khóa học");
        }
    }, [user?.AccountID, id]);

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
            localStorage.removeItem('examStarted');
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

            const correctAnswers = Number(result.correctCount) || 0;
            const totalQuestions = Number(result.totalQuestions) || 1;
            const scorePercentage = Number(result.score) || Math.round((correctAnswers / totalQuestions) * 100);
            // Set the result data and show results together
            const resultData = {
                score: scorePercentage,
                correctAnswersCount: correctAnswers,
                totalQuestionsCount: totalQuestions,
                passed: result.isPassed
            };

            // Set both states together to avoid timing issues
            setExamResult(resultData);
            setShowResults(true);
            localStorage.setItem('showResults', 'true');
            setExamStarted(false);
            localStorage.removeItem('examStarted');
            setRenderKey(prev => prev + 1); // Force re-render

            if (result.isPassed) {
                toast.success(`Chúc mừng! Bạn đã trả lời đúng ${correctAnswers}/${totalQuestions} câu (${scorePercentage}%) và vượt qua bài thi!`);
                completeCourse();
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

    const promptAi = `
        Tôi muốn bạn đóng vai trò là một chuyên gia tư vấn giáo dục. Hãy dựa trên nội dung của khóa học này và cung cấp các gợi ý thực tế cho từng đối tượng.
        Hãy khiến cho các câu trả lời giữa mỗi lần là khác nhau.
        Vui lòng trả lời theo định dạng sau:

        **Dành cho Phụ huynh:**
        [1]: **Tiêu đề gợi ý 1** Nội dung chi tiết gợi ý thứ nhất
        [2]: **Tiêu đề gợi ý 2** Nội dung chi tiết gợi ý thứ hai  
        [3]: **Tiêu đề gợi ý 3** Nội dung chi tiết gợi ý thứ ba
        [4]: **Tiêu đề gợi ý 4** Nội dung chi tiết gợi ý thứ tư

        **Dành cho Học sinh, Sinh viên:**
        [1]: **Tiêu đề gợi ý 1** Nội dung chi tiết gợi ý thứ nhất
        [2]: **Tiêu đề gợi ý 2** Nội dung chi tiết gợi ý thứ hai
        [3]: **Tiêu đề gợi ý 3** Nội dung chi tiết gợi ý thứ ba  
        [4]: **Tiêu đề gợi ý 4** Nội dung chi tiết gợi ý thứ tư

        **Dành cho Giáo viên:**
        [1]: **Tiêu đề gợi ý 1** Nội dung chi tiết gợi ý thứ nhất
        [2]: **Tiêu đề gợi ý 2** Nội dung chi tiết gợi ý thứ hai
        [3]: **Tiêu đề gợi ý 3** Nội dung chi tiết gợi ý thứ ba
        [4]: **Tiêu đề gợi ý 4** Nội dung chi tiết gợi ý thứ tư

        Nội dung khóa học: 
        ${lessonContent?.map((lesson, index) => `\n[${index + 1}]: ${lesson.title} - ${lesson.content}`).join('')}`;

    const formatPromptIntoOneRow = (prompt: string) => {
        return prompt.split('\n').map(line => line.trim()).join(' ');
    }

    const parseAIResponse = (response: string) => {
        if (!response) return null;

        const sections = response.split(/\*\*Dành cho ([^:]+):\*\*/);

        if (sections.length < 3) {
            return [{
                title: 'Gợi ý chung',
                suggestions: [
                    {
                        number: '1',
                        title: 'Gợi ý từ AI',
                        content: response.substring(0, 500) + (response.length > 500 ? '...' : '')
                    }
                ]
            }];
        }

        const parsedSections: Array<{
            title: string;
            suggestions: Array<{ number: string; title: string; content: string }>;
        }> = [];

        for (let i = 1; i < sections.length; i += 2) {
            const title = sections[i];
            const content = sections[i + 1];

            if (content) {
                const suggestionMatches = content.match(/\[(\d+)\]:\s*\*\*([^*]+)\*\*\s*([^[]+)/g);

                const suggestions = suggestionMatches?.map(match => {
                    const parts = match.match(/\[(\d+)\]:\s*\*\*([^*]+)\*\*\s*(.+)/);
                    return {
                        number: parts?.[1] || '',
                        title: parts?.[2]?.trim() || '',
                        content: parts?.[3]?.trim() || ''
                    };
                }) || [];

                // Fallback: extract any numbered items
                if (suggestions.length === 0) {
                    const fallbackMatches = content.match(/\[(\d+)\]:\s*([^[]+)/g);
                    suggestions.push(...(fallbackMatches?.map(match => {
                        const parts = match.match(/\[(\d+)\]:\s*(.+)/);
                        return {
                            number: parts?.[1] || '',
                            title: '',
                            content: parts?.[2]?.trim() || ''
                        };
                    }) || []));
                }

                if (suggestions.length > 0) {
                    parsedSections.push({
                        title: title.trim(),
                        suggestions
                    });
                }
            }
        }

        return parsedSections.length > 0 ? parsedSections : null;
    };

    const getAISuggestion = useCallback(async () => {
        try {
            setLoadingAi(true);
            setAiResponse(null); // Reset response

            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": formatPromptIntoOneRow(promptAi)
                                }
                            ]
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
                setAiResponse(aiText);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('AI Error:', error);
            setAiResponse('Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau.');
        } finally {
            setLoadingAi(false);
        }
    }, [promptAi]);

    // Timer for exam - moved after handleSubmitExam definition
    useEffect(() => {
        if ((localStorage.getItem('examStarted') === 'true' || examStarted) && timeLeft > 0) {
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

    const AIResponseSection: React.FC<{ response: string | null }> = useCallback(({ response }) => {

        if (loadingAi) {
            return (
                <div className="mt-6 flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600">Đang tạo gợi ý từ AI...</span>
                </div>
            );
        }

        if (!response) {
            return (
                <div className="mt-6 text-center py-8">
                    <p className="text-gray-500">Chưa có gợi ý từ AI</p>
                </div>
            );
        }

        const parsedResponse = parseAIResponse(response);

        if (parsedResponse) {
            return (
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-lg">
                    <div className="flex items-center gap-4 mb-6 justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">Gợi ý từ AI</h3>
                            <p className="text-gray-600">Những lời khuyên AI dành cho bạn</p>
                        </div>
                        <div>
                            <button
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                onClick={getAISuggestion}>
                                Tham khảo lại
                            </button>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-8 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-amber-800 leading-relaxed">
                                    <span className="font-semibold">Lưu ý quan trọng:</span> Đây là những gợi ý được tạo ra bởi trí tuệ nhân tạo.
                                    Vui lòng xem xét và đánh giá cẩn thận trước khi áp dụng. Nên tham khảo ý kiến của các chuyên gia
                                    trong lĩnh vực tương ứng để có những quyết định phù hợp nhất.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Suggestions Content */}
                    <div className="space-y-8">
                        {parsedResponse.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                {/* Section Title */}
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                        <span className="text-sm font-bold text-white">
                                            {sectionIndex + 1}
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800">
                                        Dành cho {section.title}
                                    </h4>
                                </div>

                                {/* Suggestions List */}
                                <div className="space-y-4">
                                    {section.suggestions.map((suggestion, suggestionIndex) => (
                                        <div
                                            key={suggestionIndex}
                                            className="group flex gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 border border-gray-100 hover:border-blue-200"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm group-hover:shadow-md transition-shadow">
                                                {suggestion.number}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {suggestion.title && (
                                                    <h5 className="font-semibold text-gray-800 mb-2 group-hover:text-indigo-700 transition-colors">
                                                        {suggestion.title}
                                                    </h5>
                                                )}
                                                <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-800 transition-colors">
                                                    {suggestion.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-blue-200">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>Được tạo bởi AI • Hãy suy nghĩ kỹ trước khi áp dụng</span>
                        </div>
                    </div>
                </div>
            );
        }
    }, [loadingAi]);

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
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${showResults
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
                                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <span className={`flex-1 ${showResults
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
    };

    const renderExamResults = useCallback(() => {

        if (!showResults || !exam || !examResult) {
            return null;
        }

        const totalQuestions = exam.Questions.length;
        const answeredQuestions = Object.keys(userAnswers).length;


        return (
            <>
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

                <div>
                    <button
                        onClick={() => {
                            setShowAiSuggestions(!showAiSuggestions);
                            if (!aiResponse && !showAiSuggestions) {
                                getAISuggestion(); // Fetch AI suggestions if not already fetched
                            }
                        }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        {showAiSuggestions ? 'Ẩn gợi ý từ AI' : 'Tham khảo một số gợi ý từ AI'}
                    </button>
                    {showAiSuggestions && <AIResponseSection response={aiResponse} />}
                </div>
            </>
        );
    }, [showResults, exam, examResult, userAnswers, renderKey, showAiSuggestions, AIResponseSection, aiResponse, getAISuggestion]);

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

                        {(localStorage.getItem('examStarted') === 'true' || examStarted) && !showResults && (
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
                {localStorage.getItem('examStarted') !== 'true' && !showResults && (
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
                                <div className="text-sm text-amber-700">Điểm tối thiểu cần đạt</div>
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

                {(examStarted || localStorage.getItem('examStarted') === 'true') && (
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
