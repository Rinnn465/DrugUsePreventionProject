import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Sidebar from "../components/sidebar/Sidebar";
import { parseDate } from "../utils/parseDateUtils";
import { courseData } from "../data/courseData";
import { eventData } from "../data/eventData";
import { User } from "lucide-react";

const DashBoardPage: React.FC = () => {
    const { userId } = useParams();
    const { user, setUser } = useUser();

    const [section, setSection] = useState<string>('dashboard');
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-grow bg-gray-100 p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Xin chào, {user?.Username}</h1>
                        <div className="mt-2 text-gray-700">Email người dùng: {user?.Email}</div>
                        <div className="mt-2 text-gray-700">Role người dùng: {user?.Role}</div>
                        <div className="mt-2 text-gray-700">Thời gian tạo tài khoản: {parseDate(`${user?.CreatedAt}`)}</div>
                    </div>

                    <div>
                        <User className="h-24 w-24 mr-32 bg-gray-200 rounded-full p-2" />
                    </div>
                </div>
                <div className="border-t border-gray-900 my-4"></div>
                <div className="mt-5">
                    <div className="text-lg font-semibold text-gray-800 mb-4">
                        Khóa học đã tham gia
                        {courseData.map((course) => (
                            <div key={course.id} className="py-4 pr-4 rounded-lg mb-2">
                                <Link to={`/courses/${course.id}`} className="text-blue-600 hover:underline">
                                    {course.title}
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-900 my-4"></div>

                    <div className="text-lg font-semibold text-gray-800 mb-4">
                        Sự kiện đã tham gia
                        {eventData.map((event) => (
                            <div key={event.id} className="py-4 pr-4 rounded-lg mb-2">
                                <Link to={`/events/${event.id}`} className="text-blue-600 hover:underline">
                                    {event.name}
                                </Link>
                            </div>
                        ))}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-4">
                        Lịch sử đặt lịch
                        <div className="text-gray-400 text-md mt-2">
                            Bạn chưa có lịch sử đặt lịch nào.
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
};

export default DashBoardPage;