import { userData } from "../data/userData"

const MemberManagmentPage: React.FC = () => {
    const filteredUsers = userData.filter(user => user.role === "member");

    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">Quản lý member</h1>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold mb-4">Danh sách member</h2>
                    <div>
                        {filteredUsers.map((user) => {
                            return (
                                <div key={user.id}>
                                    <h3 className="text-xl font-bold mb-2">{user.name}</h3>
                                    <p className="text-gray-700 mb-2">{user.email}</p>
                                    <p className="text-sm text-gray-500 mb-2">Role: {user.role}</p>
                                    <p className="text-sm text-gray-500 mb-2">Khóa học tham gia: {user.courseTaken}</p>
                                    <p className="text-sm text-gray-500 mb-2">Sự kiện tham gia: {user.eventTaken}</p>
                                    <div className="flex space-x-4 mt-4">
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

export default MemberManagmentPage