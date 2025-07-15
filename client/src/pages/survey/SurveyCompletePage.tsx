import { Link, useParams, useNavigate } from "react-router-dom"
import { useEffect } from "react";

const SurveyCompletePage: React.FC = () => {
    const { programId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const surveyFlag = sessionStorage.getItem(`survey_completed_${programId}`);
        if (!surveyFlag) {
            navigate(`/survey/${programId}/before`, { replace: true });
        }
        // Xóa flag khi rời trang (đảm bảo chỉ xem 1 lần)
        return () => {
            sessionStorage.removeItem(`survey_completed_${programId}`);
        };
    }, [programId, navigate]);

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
                        Quay về page cộng đồng
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SurveyCompletePage