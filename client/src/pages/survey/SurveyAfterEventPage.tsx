import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';

const SurveyAfterEventPage: React.FC = () => {
    const { programId } = useParams();
    const { user } = useUser();
    const [programData, setProgramData] = useState<any>(null);
    const [formData, setFormData] = useState({
        overallSatisfaction: '',
        knowledgeGained: '',
        behaviorChange: '',
        recommendation: '',
        improvements: ''
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    useEffect(() => {
        const fetchProgramData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/program/${programId}`, {
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    const data = await response.json();
                    setProgramData(data.data);
                }
            } catch (error) {
                console.error('Error fetching program data:', error);
            }
        };

        if (programId) {
            fetchProgramData();
        }
    }, [programId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
        const surveyType = window.location.pathname.includes('/after') ? 'after' : 'before';

        const response = await fetch(`http://localhost:5000/api/survey/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                programId: parseInt(programId!),
                surveyType: surveyType,
                surveyData: formData
            })
        });

        if (response.ok) {
            toast.success('Hoàn thành khảo sát thành công!');
            setTimeout(() => {
                window.location.href = `/survey/${programId}/completed`;
            }, 1500);
        } else {
            const error = await response.json();
            toast.error(error.message || 'Có lỗi xảy ra');
        }
    } catch (error) {
        console.error('Error submitting survey:', error);
        toast.error('Có lỗi xảy ra khi gửi khảo sát');
    }
};

    return (
        <div className="container px-4 py-8 mx-auto max-w-2xl bg-gray-100 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
                Khảo Sát Sau Chương Trình
            </h1>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
                {programData?.ProgramName || 'Đang tải tên sự kiện...'}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* 1. Mức độ hài lòng tổng thể */}
                <div>
                    <label htmlFor="overallSatisfaction" className="block text-sm font-medium text-gray-700 mb-2">
                        1. Bạn đánh giá chương trình này như thế nào?
                    </label>
                    <select
                        id="overallSatisfaction"
                        name="overallSatisfaction"
                        value={formData.overallSatisfaction}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Chọn đánh giá</option>
                        <option value="excellent">Xuất sắc</option>
                        <option value="good">Tốt</option>
                        <option value="average">Bình thường</option>
                        <option value="poor">Kém</option>
                    </select>
                </div>

                {/* 2. Kiến thức về phòng ngừa ma túy */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. Sau chương trình, bạn có hiểu rõ hơn về tác hại của ma túy và cách phòng ngừa không?
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="knowledge-much-better"
                                name="knowledgeGained"
                                value="much-better"
                                checked={formData.knowledgeGained === 'much-better'}
                                onChange={handleChange}
                                required
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="knowledge-much-better" className="text-sm text-gray-700">
                                Hiểu rõ hơn rất nhiều
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="knowledge-better"
                                name="knowledgeGained"
                                value="better"
                                checked={formData.knowledgeGained === 'better'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="knowledge-better" className="text-sm text-gray-700">
                                Hiểu rõ hơn một chút
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="knowledge-same"
                                name="knowledgeGained"
                                value="same"
                                checked={formData.knowledgeGained === 'same'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="knowledge-same" className="text-sm text-gray-700">
                                Như trước, không thay đổi
                            </label>
                        </div>
                    </div>
                </div>

                {/* 3. Ảnh hưởng đến thái độ */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        3. Chương trình này có làm bạn quyết tâm hơn trong việc tránh xa ma túy không?
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="behavior-strongly-agree"
                                name="behaviorChange"
                                value="strongly-agree"
                                checked={formData.behaviorChange === 'strongly-agree'}
                                onChange={handleChange}
                                required
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="behavior-strongly-agree" className="text-sm text-gray-700">
                                Rất quyết tâm
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="behavior-agree"
                                name="behaviorChange"
                                value="agree"
                                checked={formData.behaviorChange === 'agree'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="behavior-agree" className="text-sm text-gray-700">
                                Có quyết tâm hơn
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="behavior-neutral"
                                name="behaviorChange"
                                value="neutral"
                                checked={formData.behaviorChange === 'neutral'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="behavior-neutral" className="text-sm text-gray-700">
                                Không thay đổi
                            </label>
                        </div>
                    </div>
                </div>

                {/* 4. Giới thiệu cho người khác */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        4. Bạn có muốn giới thiệu chương trình này cho bạn bè không?
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="recommend-yes"
                                name="recommendation"
                                value="yes"
                                checked={formData.recommendation === 'yes'}
                                onChange={handleChange}
                                required
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="recommend-yes" className="text-sm text-gray-700">
                                Có, chắc chắn sẽ giới thiệu
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="recommend-maybe"
                                name="recommendation"
                                value="maybe"
                                checked={formData.recommendation === 'maybe'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="recommend-maybe" className="text-sm text-gray-700">
                                Có thể
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="recommend-no"
                                name="recommendation"
                                value="no"
                                checked={formData.recommendation === 'no'}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label htmlFor="recommend-no" className="text-sm text-gray-700">
                                Không
                            </label>
                        </div>
                    </div>
                </div>

                {/* 5. Góp ý cải thiện */}
                <div>
                    <label htmlFor="improvements" className="block text-sm font-medium text-gray-700 mb-2">
                        5. Bạn có góp ý gì để chương trình tốt hơn? (không bắt buộc)
                    </label>
                    <textarea
                        id="improvements"
                        name="improvements"
                        rows={3}
                        placeholder="Ví dụ: Thêm video thực tế, có thời gian tương tác nhiều hơn..."
                        value={formData.improvements}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                >
                    Hoàn thành khảo sát
                </button>
            </form>
        </div>
    );
};

export default SurveyAfterEventPage;