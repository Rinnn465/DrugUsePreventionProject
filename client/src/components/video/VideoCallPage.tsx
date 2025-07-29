// src/pages/VideoCallPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VideoCallComponent from '@/components/video/VideoCall';
import { Phone } from 'lucide-react';
import RatingModal from '../modal/RatingModal';
import { useUser } from '@/context/UserContext';
import apiUtils from '@/utils/apiUtils';
import { toast } from 'react-toastify';
import AppointmentCompletionModal from '../modal/AppointmentCompletionModal';

interface VideoCallData {
    appointmentId: number;
    isConsultant: boolean;
    appointmentDetails: {
        customerName?: string;
        consultantName?: string;
        time: string;
        date: string;
    };
}

const VideoCallPage: React.FC = () => {

    const { user } = useUser();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [callData, setCallData] = useState<VideoCallData | null>(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showCallComponent, setShowCallComponent] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decodedData = JSON.parse(decodeURIComponent(dataParam));
                setCallData(decodedData);
            } catch (error) {
                console.error('Invalid video call data:', error);
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [searchParams, navigate]);

    const handleCallEnd = () => {
        setShowCallComponent(false);
        setShowCompletionModal(true);
        if (window.opener && user?.RoleName.toLocaleLowerCase() === 'member') {
            setShowRatingModal(true);
        } else if (window.opener && user?.RoleName.toLocaleLowerCase() === 'consultant') {
            setShowCompletionModal(true);
        } else {

            navigate('/');
        }
    };

    const startCall = () => {
        setShowCallComponent(true);
    };

    const handleRatingSubmit = (rating: number, feedback: string | undefined) => {
        try {
            apiUtils.appointments.rate(callData!.appointmentId, {
                rating,
                feedback: feedback?.trim() || undefined
            })
            toast.success('Đánh giá cuộc gọi thành công!');
        }
        catch (error) {
            console.log('Error submitting rating:', error);
            toast.error('Đánh giá cuộc gọi không thành công. Vui lòng thử lại sau.');
        }

        setTimeout(() => {
            handleCloseRatingModal();
        }, 1000);
    }

    const handleCloseRatingModal = () => {
        setShowRatingModal(false);
        if (window.opener) {
            window.close();
        } else {
            navigate('/');
        }
    }

    if (!callData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin cuộc gọi...</p>
                </div>
            </div>
        );
    }

    if (showCallComponent) {
        return (
            <VideoCallComponent
                appointmentId={callData.appointmentId}
                isConsultant={callData.isConsultant}
                onCallEnd={handleCallEnd}
            />
        );
    }

    const { consultantName, ...rest } = callData.appointmentDetails;
    console.log(rest);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
            <div className="container mx-auto px-4 py-8">
                {/* Call Preparation Card */}
                {showRatingModal && user?.RoleName.toLowerCase() !== 'consultant' ? (
                    <RatingModal
                        isOpen={showRatingModal}
                        onClose={handleCloseRatingModal}
                        onSubmit={handleRatingSubmit}
                        appointmentId={callData.appointmentId}
                        isConsultant={callData.isConsultant}
                    />) : (

                    <AppointmentCompletionModal
                        isOpen={showCompletionModal}
                        onClose={() => setShowCompletionModal(false)}
                        appointment={
                            {
                                ...rest,
                                appointmentID: callData.appointmentId,
                                duration: 60
                            }
                        }
                    />
                )
                }
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="h-10 w-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Cuộc gọi video tư vấn
                            </h1>
                            <p className="text-gray-600">
                                Chuẩn bị tham gia cuộc gọi video với{' '}
                                {callData.isConsultant
                                    ? callData.appointmentDetails.customerName || 'khách hàng'
                                    : callData.appointmentDetails.consultantName || 'chuyên viên tư vấn'
                                }
                            </p>
                        </div>

                        {/* Appointment Details */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Thông tin cuộc hẹn
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Vai trò</p>
                                    <p className="font-semibold">
                                        {callData.isConsultant ? 'Chuyên viên tư vấn' : 'Khách hàng'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Ngày</p>
                                    <p className="font-semibold">{callData.appointmentDetails.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Thời gian</p>
                                    <p className="font-semibold">{callData.appointmentDetails.time}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pre-call Checklist */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Kiểm tra trước khi tham gia
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <li className="text-gray-700">Camera hoạt động bình thường</li>
                                </div>
                                <div className="flex items-center">
                                    <li className="text-gray-700">Microphone hoạt động bình thường</li>
                                </div>
                                <div className="flex items-center">
                                    <li className="text-gray-700">Kết nối internet ổn định</li>
                                </div>
                                <div className="flex items-center">
                                    <li className="text-gray-700">Không gian riêng tư</li>
                                </div>
                            </div>
                        </div>

                        {/* Start Call Button */}
                        <div className="text-center">
                            <button
                                onClick={startCall}
                                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                            >
                                <Phone className="h-6 w-6 mr-3" />
                                Tham gia cuộc gọi
                            </button>
                            <p className="text-sm text-gray-500 mt-3">
                                Nhấn để bắt đầu cuộc gọi video
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCallPage;