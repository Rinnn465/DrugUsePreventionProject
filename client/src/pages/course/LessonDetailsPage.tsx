import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SqlCourse } from "../../types/Course";
import { sqlLesson, sqlLessonAnswer, sqlLessonQuestion } from "../../types/Lesson";


const LessonDetailsPage: React.FC = () => {
    const { id } = useParams();
    const [selected, setSelected] = useState<string>('lesson');
    // const course = courseData.find(course => course.id.toString() === id);
    const [course, setCourse] = useState<SqlCourse | null>(null); // Use any for now, replace with proper type later
    const [lesson, setLesson] = useState<sqlLesson[] | null>(null); // Use any for now, replace with proper type later
    const [questions, setQuestions] = useState<sqlLessonQuestion[] | null>(null); // Use any for now, replace with proper type later
    const [answers, setAnswers] = useState<sqlLessonAnswer[] | null>(null); // Use any for now, replace with proper type later
    let score = 0;



    useEffect(() => {
        const fetchLessonDetail = async () => {
            try {
                const courseResponse = await fetch(`http://localhost:5000/api/course/${id}`);
                if (!courseResponse.ok) throw new Error('Failed to fetch course');
                const courseData = await courseResponse.json();
                setCourse(courseData.data);

                const lessonResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/`);
                if (!lessonResponse.ok) throw new Error('Failed to fetch lesson');
                const lessonData = await lessonResponse.json();
                setLesson(lessonData.data);
            } catch (error: any) {
                console.log(error);

            }
        };

        const fetchQuestionsAndAnswers = async () => {
            try {
                const questionResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/questions`);
                if (!questionResponse.ok) throw new Error('Failed to fetch questions');
                const questionData = await questionResponse.json();
                console.log(questionData.data);

                setQuestions(questionData.data);


                const answerResponse = await fetch(`http://localhost:5000/api/course/${id}/lessons/questions/answers`);
                const data = await answerResponse.json();
                console.log(data.data);
                setAnswers(data.data);


            } catch (error: any) {
                console.log(error);
            }


        };

        const fetchData = async () => {
            await Promise.all([fetchLessonDetail(), fetchQuestionsAndAnswers()]);
        };

        fetchData();
    }, []);

    const handleDoneLesson = () => {
        alert("Bạn đã hoàn thành bài học này!");
        setSelected('question');
    }

    const handleSubmitQuestion = () => {
        alert('Bạn đã hoàn thành bài học này! Tong diem la: ' + score);
    }

    const handleContent = () => {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">📚 Nội dung bài học</h2>
                {lesson?.map(lesson => (
                    <div key={lesson.LessonID} className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0">
                        <h3 className="text-xl font-semibold text-gray-700">{lesson.Title}</h3>
                        <p className="text-gray-600 leading-relaxed">{lesson.Content}</p>

                        <iframe
                            width="100%"
                            height="400px"
                            src={lesson.VideoUrl}
                            className="rounded-lg border shadow-md"
                            allowFullScreen
                        ></iframe>
                    </div>
                ))}
                <button
                    onClick={handleDoneLesson}
                    className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                    ✅ Hoàn thành bài học
                </button>
            </div>

        )
    }

    const handleQuestion = () => {
        if (questions && questions.length > 0) {
            return (
                <form className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">📝 Câu hỏi bài học</h2>
                    {questions?.map(question =>
                        <div key={question.QuestionID} className="space-y-2">
                            <p className="font-semibold text-gray-700">{question.QuestionText}</p>
                            <div className="pl-4 space-y-1">
                                {answers?.map((answer, index) => (
                                    <label key={index} className="flex items-center space-x-2 text-gray-600">
                                        <input
                                            type={question.Type === 'multiple' ? 'checkbox' : 'radio'}
                                            name={`question-${question.QuestionID}`}
                                            value={answer.IsCorrect ? 1 : 0}
                                            className="accent-primary-600"
                                        />
                                        <span>{answer.AnswerText}</span>
                                    </label>

                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleSubmitQuestion}
                        type="submit"
                        className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                    >
                        🏁 Hoàn thành
                    </button>
                </form >

            )
        }
        return (
            <p className="text-red-400">
                Không có câu hỏi cho bài học này
            </p>
        )

    }


    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto py-10 px-6 md:px-20 flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <aside className="md:w-52 shrink-0 bg-white rounded-xl shadow-md p-4">
                    <nav className="space-y-2">
                        <button
                            className={`w-full text-left px-4 py-2 rounded-lg font-medium transition duration-200 ${selected === 'lesson'
                                ? 'bg-primary-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            onClick={() => setSelected('lesson')}
                        >
                            📘 Bài học
                        </button>
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

                {/* Main content */}
                <main className="flex-1">
                    {selected === 'lesson' ? handleContent() : handleQuestion()}
                </main>
            </div>
        </div>

    );
};

export default LessonDetailsPage;