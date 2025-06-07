import { useParams } from "react-router-dom";
import { courseData } from "../data/courseData";
import { useState } from "react";
import * as Yup from "yup";
import { useFormik } from "formik";


const LessonDetailsPage: React.FC = () => {
    const { id } = useParams();
    const [selected, setSelected] = useState<string>('lesson');
    const course = courseData.find(course => course.id.toString() === id);
    let score = 0;


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
                {course?.lesson.map(lesson => (
                    <div key={lesson.id} className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0">
                        <h3 className="text-xl font-semibold text-gray-700">{lesson.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{lesson.content}</p>

                        <iframe
                            width="100%"
                            height="400px"
                            src={lesson.videoUrl}
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
        if (course?.lesson) {
            return (
                <form className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">📝 Câu hỏi bài học</h2>
                    {course?.lesson.map(lesson =>
                        lesson.question.map(question => (
                            <div key={question.id} className="space-y-2">
                                <p className="font-semibold text-gray-700">{question.questionText}</p>
                                <div className="pl-4 space-y-1">
                                    {question.answers.map(answer => (
                                        <label key={answer.id} className="flex items-center space-x-2 text-gray-600">
                                            <input
                                                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                                name={`question-${question.id}`}
                                                value={answer.isCorrect ? 1 : 0}
                                                className="accent-primary-600"
                                            />
                                            <span>{answer.answerText}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                    <button
                        onClick={handleSubmitQuestion}
                        type="submit"
                        className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                    >
                        🏁 Hoàn thành
                    </button>
                </form>

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