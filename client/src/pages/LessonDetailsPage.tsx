import { useParams } from "react-router-dom";
import { courseData } from "../data/courseData";
import { useState } from "react";


const ModuleDetailsPage: React.FC = () => {
    const { id, lessonId } = useParams();
    const [selected, setSelected] = useState<string>('lesson');
    const course = courseData.find(course => course.id.toString() === id);


    const handleContent = () => {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Nội dung bài học</h2>
                {course?.lesson.map(lesson => (
                    <div key={lesson.id} className="mb-4">
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        <p>{lesson.content}</p>
                    </div>
                ))}
            </div>
        )
    }

    const handleQuestion = () => {
        return (
            <div></div>
        )
    }
    return (
        <div className="container mx-auto py-8 px-20 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
                <button
                    className="px-4 py-2 mb-2 font-medium rounded-md hover:bg-gray-300  transition duration-200"
                    onClick={() => setSelected('lesson')}>
                    Lesson
                </button>
            </div>

            <div>
                {selected === 'lesson' ? (
                    <div>
                        {handleContent()}
                    </div>
                ) : (
                    <form>
                        {handleQuestion()}
                    </form>
                )}
            </div>
        </div>
    );
};

export default ModuleDetailsPage;