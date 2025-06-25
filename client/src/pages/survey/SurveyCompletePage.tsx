import { Link, useParams } from "react-router-dom"

const SurveyCompletePage: React.FC = () => {
    const { programId } = useParams();

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
                <div className="text-6xl mb-4">🎉</div>
                <div className="text-xl font-semibold text-gray-800 mb-4">
                    Cảm ơn bạn đã hoàn thành khảo sát!
                </div>
                <div className="text-gray-600 mb-6">
                    Chúng tôi sẽ xem xét phản hồi của bạn và sử dụng nó để cải thiện các sự kiện trong tương lai.
                </div>
                <div className="flex justify-center space-x-4">
                    <Link
                        to={'/'}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
                    >
                        Quay về trang chủ
                    </Link>
                    <Link
                        to={'/community-programs'}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
                    >
                        Quay về trang sự kiện
                    </Link>
                    {programId && (
                        <Link
                            to={`/community-programs/${programId}`}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg shadow hover:bg-purple-600 transition"
                        >
                            Quay về sự kiện
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SurveyCompletePage