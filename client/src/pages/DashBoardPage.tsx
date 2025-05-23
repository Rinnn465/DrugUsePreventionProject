import { useParams } from "react-router-dom";
import { userData } from "../data/userData";

const DashBoardPage: React.FC = () => {
    const { userId } = useParams();
    const user = userData.find((user) => user.id.toString() === userId);

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center text-red-500">User not found</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {user.name}!</h1>
                <p className="text-gray-600 mb-6">Here is your personalized dashboard.</p>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-600">User ID</h2>
                        <p className="text-gray-700">{user.id}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-600">Email</h2>
                        <p className="text-gray-700">{user.email}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-600">Courses taken</h2>
                        <p className="text-gray-700">
                            {user.courseTaken?.map((course, index) => {
                                return (
                                    <div key={index} className="block">
                                        {course}
                                    </div>
                                );
                            })}
                        </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <h2 className="text-lg font-semibold text-blue-600">Events taken</h2>
                        <p className="text-gray-700">
                            {user.eventTaken?.map((eventTaken, index) => {
                                return (
                                    <div key={index} className="block">
                                        {eventTaken}
                                    </div>
                                );
                            })}
                        </p>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
                            View Profile
                        </button>
                        <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">
                            Edit Details
                        </button>
                        <button className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashBoardPage;