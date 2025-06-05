import { Link } from "react-router-dom"
const Sidebar = () => {
    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="p-4">
                <h2 className="text-xl font-bold">Dashboard</h2>
            </div>
            <nav className="flex-grow">
                <ul className="space-y-2 p-4">
                    <Link
                        to={'/'}
                        className="block text-gray-300 hover:text-white"
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to={'#'}
                        className="block text-gray-300 hover:text-white"
                    >
                        Hồ sơ
                    </Link>
                    <Link
                        to={'/courses'}
                        className="block text-gray-300 hover:text-white"
                    >
                        Khóa học
                    </Link>
                    <Link
                        to={'/events'}
                        className="block text-gray-300 hover:text-white"
                    >
                        Sự kiện
                    </Link>
                    <Link
                        to={'/appointments'}
                        className="block text-gray-300 hover:text-white"
                    >
                        Đặt lịch hẹn
                    </Link>
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar