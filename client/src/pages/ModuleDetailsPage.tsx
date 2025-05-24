import { useParams } from "react-router-dom";
import { courseData } from "../data/courseData";

const ModuleDetailsPage: React.FC = () => {
    const { id, moduleId } = useParams();

    const module = courseData
        .find((course) => course.id === Number(id))
        ?.modules.find((module) => module.id === Number(moduleId));

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Module Details
                </h1>
                {module?.lesson.map((lesson, index) => (
                    <div
                        key={index}
                        className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                        <p className="text-gray-700 text-lg mb-4">
                            {lesson.content}
                        </p>
                        <div className="bg-gray-100 p-4 rounded-md">
                            <h2 className="text-gray-800 font-semibold mb-2">
                                Questions:
                            </h2>
                            <ul className="list-disc list-inside text-gray-600">
                                {lesson.questions.map((question, qIndex) => (
                                    <li key={qIndex}>{question}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleDetailsPage;