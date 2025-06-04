import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ManagerPage: React.FC = () => {
    const { user } = useUser();

    return (
        <div className="flex flex-col mx-auto items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Trang Admin</h1>
                <div className="space-y-6">
                    <div className="w-container bg-white shadow-md rounded-lg p-6 w-full flex items-center justify-between gap-12">
                        <h2 className="text-lg font-semibold text-gray-700">Quản lý sự kiện</h2>
                        <Link to={`/roles/${user?.role}/event-manage`}>
                            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                                Chi tiết
                            </button>
                        </Link>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6 w-full flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-700">Quản lý khóa học</h2>
                        <Link to={`/roles/${user?.role}/course-manage`}>
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                Chi tiết
                            </button>
                        </Link>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6 w-full flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-700">Quản lý nhân viên</h2>
                        <Link to={`/roles/${user?.role}/employee-manage`}>
                            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                                Chi tiết
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ManagerPage