import { useUser } from '@/context/UserContext';
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';

const SurveyBeforeEventPage = () => {
    const { programId } = useParams(); // Nhận programId từ URL
    const [programData, setProgramData] = useState<any>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        experience: '',
        expectation: ''
    });

    const { user } = useUser();

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    useEffect(() => {
        // Fetch program data để hiển thị tên chương trình
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
            const surveyType = window.location.pathname.includes('/before') ? 'before' : 'after';

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
                Khảo Sát Trước Khi Tham Gia Chương Trình Cộng Đồng
            </h1>
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
                {programData?.ProgramName || 'Đang tải tên sự kiện...'}
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Họ và tên của bạn"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                        Độ tuổi
                    </label>
                    <select
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Chọn độ tuổi</option>
                        <option value="under18">Dưới 18</option>
                        <option value="18-25">18-25</option>
                        <option value="26-35">26-35</option>
                        <option value="36-50">36-50</option>
                        <option value="over50">Trên 50</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bạn đã từng tham gia chương trình cộng đồng nào trước đây chưa?
                    </label>
                    <div className="flex items-center space-x-4">
                        <input
                            type="radio"
                            id="yes"
                            name="experience"
                            value="yes"
                            checked={formData.experience === 'yes'}
                            onChange={handleChange}
                            required
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="yes" className="text-sm text-gray-700">Đã từng tham gia</label>
                        <input
                            type="radio"
                            id="no"
                            name="experience"
                            value="no"
                            checked={formData.experience === 'no'}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="no" className="text-sm text-gray-700">Chưa từng tham gia</label>
                    </div>
                </div>

                <div>
                    <label htmlFor="expectation" className="block text-sm font-medium text-gray-700 mb-1">
                        Bạn mong đợi điều gì từ chương trình này?
                    </label>
                    <textarea
                        id="expectation"
                        name="expectation"
                        rows={5}
                        placeholder="Ví dụ: Kỹ năng mới, kết nối cộng đồng, đóng góp xã hội..."
                        value={formData.expectation}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Hoàn thành khảo sát
                </button>
            </form>
        </div>
    );
};

export default SurveyBeforeEventPage;