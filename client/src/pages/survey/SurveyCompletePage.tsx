import { Link, useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import { CheckCircle, ArrowLeft, Home, Users } from "lucide-react";
import { CommunityProgram } from "../../types/CommunityProgram";

const SurveyCompletePage: React.FC = () => {
    const { programId } = useParams();
    const navigate = useNavigate();
    const [programData, setProgramData] = useState<CommunityProgram | null>(null);

    useEffect(() => {
        // Kiểm tra xem user có hoàn thành khảo sát không
        const surveyFlag = sessionStorage.getItem(`survey_completed_${programId}`);
        if (!surveyFlag) {
            navigate(`/survey/${programId}/before`, { replace: true });
            return;
        }

        // Fetch thông tin chương trình để hiển thị tên
        const fetchProgramData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/program/${programId}`);
                if (response.ok) {
                    const result = await response.json();
                    setProgramData(result.data);
                }
            } catch (error) {
                console.error('Error fetching program data:', error);
            }
        };

        if (programId) {
            fetchProgramData();
        }

        // Xóa flag sau 5 phút để cho phép xem lại nếu cần
        const timer = setTimeout(() => {
            sessionStorage.removeItem(`survey_completed_${programId}`);
        }, 5 * 60 * 1000); // 5 phút

        return () => {
            clearTimeout(timer);
        };
    }, [programId, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                </div>

                {/* Success Message */}
                <div className="text-2xl font-bold text-gray-800 mb-4">
                    🎉 Hoàn thành khảo sát!
                </div>
                
                <div className="text-gray-600 mb-6">
                    Cảm ơn bạn đã hoàn thành khảo sát cho chương trình
                    {programData && (
                        <span className="font-semibold text-blue-600 block mt-2">
                            "{programData.ProgramName}"
                        </span>
                    )}
                </div>

                <div className="text-sm text-gray-500 mb-8 bg-gray-50 p-4 rounded-lg">
                    Phản hồi của bạn rất quan trọng giúp chúng tôi cải thiện chất lượng các chương trình trong tương lai. 
                    Cảm ơn bạn đã dành thời gian tham gia!
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Quay về trang detail chương trình */}
                    <Link
                        to={`/community-programs/${programId}`}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Quay về trang chương trình
                    </Link>

                    <div className="flex space-x-3">
                        {/* Quay về danh sách chương trình */}
                        <Link
                            to="/community-programs"
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-200"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            Các chương trình khác
                        </Link>

                        {/* Quay về trang chủ */}
                        <Link
                            to="/"
                            className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SurveyCompletePage