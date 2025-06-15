import { courseData } from "../../data/courseData";


const CourseManagmentPage: React.FC = () => {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">Quản lý khóa học</h1>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold mb-4">Danh sách khóa học</h2>
                    <div>
                        {courseData.map((course) => {
                            return (
                                <div key={course.id}>
                                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                    <p className="text-gray-700 mb-2">{course.description}</p>
                                    <p className="text-sm text-gray-500 mb-2">Thời lượng: {course.duration}</p>
                                    <p className="text-sm text-gray-500 mb-2">Đối tượng: {course.audience}</p>
                                    <p className="text-sm text-gray-500 mb-2">Lĩnh vực: {course.category}</p>
                                    <div className="flex space-x-4 mt-4">
                                        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200">
                                            Chỉnh sửa
                                        </button>
                                        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200">
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseManagmentPage;