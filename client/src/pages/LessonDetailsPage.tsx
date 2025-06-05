import { useParams } from "react-router-dom";
import { courseData } from "../data/courseData";
import { useState } from "react";


const ModuleDetailsPage: React.FC = () => {
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
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Nội dung bài học</h2>
                {course?.lesson.map(lesson => (
                    <div key={lesson.id} className="mb-4">
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        <p>{lesson.content}</p>
                        <p>{lesson.content}</p>

                        <iframe
                            width={"100%"}
                            height={"400px"}
                            src={lesson.videoUrl}
                            className="my-6 rounded-lg shadow-md"
                            allowFullScreen
                        ></iframe>
                    </div>
                ))}
                <button
                    onClick={handleDoneLesson}
                    type="submit"
                    className="p-3 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                    Hoàn thành bài học
                </button>
            </div>
        )
    }

    const handleSubmit = (data: any) => {
    }

    const handleQuestion = () => {
        if (course?.lesson) {
            return (
                <form onSubmit={e => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement); // Collect form data
                    const selectedAnswers = {} as { [key: number]: any };
                    handleSubmit(selectedAnswers)
                }}>
                    <h2 className="text-xl font-semibold mb-4">Câu hỏi bài học</h2>
                    {course?.lesson.map(lesson => (
                        lesson.question.map(question => (
                            <div key={question.id} className="mb-4">
                                <p className="font-medium">{question.questionText}</p>
                                {question.answers.map(answer => (
                                    <div key={answer.id} className="mb-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type={question.type === 'multiple' ? 'checkbox' : 'radio'}
                                                name={`question-${answer.id}`}
                                                value={answer.isCorrect ? 1 : 0}
                                                className="form-checkbox"
                                            />
                                            <span className="ml-2">{answer.answerText}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ))
                    ))}
                    <button
                        onClick={handleSubmitQuestion}
                        type="submit"
                        className="p-3 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                        Hoàn thành
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
        <div className="container mx-auto py-8 px-20 flex gap-10">
            {/* Sidebar (fixed width) */}
            <div className="w-40 shrink-0">
                <button
                    className={`px-4 py-2 mb-2 font-medium rounded-md hover:bg-gray-200 transition duration-200 ${selected === 'lesson' ? 'bg-gray-300' : ''
                        }`}
                    onClick={() => setSelected('lesson')}>
                    Bài học
                </button>
                <button
                    className={`px-4 py-2 mb-2 font-medium rounded-md hover:bg-gray-200 transition duration-200 ${selected === 'question' ? 'bg-gray-300' : ''
                        }`}
                    onClick={() => setSelected('question')}>
                    Câu hỏi
                </button>
            </div>

            {/* Main content (fills the rest) */}
            <div className="flex-1">
                {selected === 'lesson' ? (
                    <>{handleContent()}</>
                ) : (
                    <>{handleQuestion()}</>
                )}
            </div>
        </div>

    );
};

export default ModuleDetailsPage;