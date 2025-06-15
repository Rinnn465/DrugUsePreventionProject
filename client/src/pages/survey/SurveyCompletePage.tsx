
import { Link } from "react-router-dom"
const SurveyCompletePage: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center">
                <div>

                </div>
                <div className="text-xl font-semibold text-gray-800">
                    Cảm ơn bạn đã hoàn thành khảo sát!
                </div>
                <div className="mt-4 text-gray-600">
                    Chúng tôi sẽ xem xét phản hồi của bạn và sử dụng nó để cải thiện các sự kiện trong tương lai.
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                    <Link
                        to={'/'}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                    >
                        Quay về trang chủ
                    </Link>
                    <Link
                        to={'/events'}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                    >
                        Quay về trang sự kiện
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SurveyCompletePage