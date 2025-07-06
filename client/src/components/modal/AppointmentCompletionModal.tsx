import React, { useState } from 'react';
import { X, CheckCircle, Clock, User, Calendar } from 'lucide-react';
import apiUtils from '@/utils/apiUtils';
import { toast } from 'react-toastify';

interface AppointmentCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: {
        appointmentID: number;
        customerName?: string;
        date: string;
        time: string;
        duration: number;
    };
}

const AppointmentCompletionModal: React.FC<AppointmentCompletionModalProps> = ({
    isOpen,
    onClose,
    appointment
}) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await apiUtils.appointments.completeAppointment(appointment.appointmentID)
        toast.success('Cuộc hẹn đã được đánh dấu là hoàn thành');
        handleClose();
        setIsSubmitting(false);
        if (window.opener) {
            window.close()
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };


    console.log("Appointment" + appointment);

    return (
        <form className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Hoàn thành buổi tư vấn</h2>
                                <p className="text-green-100 text-sm">
                                    Cập nhật trạng thái cuộc hẹn thành "Đã hoàn thành"
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors disabled:opacity-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Appointment Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Thông tin cuộc hẹn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Khách hàng:</span>
                                <span className="text-gray-700">{appointment.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Ngày:</span>
                                <span className="text-gray-700">{appointment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Thời gian:</span>
                                <span className="text-gray-700">{appointment.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Thời lượng:</span>
                                <span className="text-gray-700">{appointment.duration} phút</span>
                            </div>
                        </div>
                    </div>
                    {/* Important Note */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                    <span className="text-amber-600 font-bold text-sm">!</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-amber-800 mb-1">Lưu ý quan trọng</h4>
                                <p className="text-sm text-amber-700">
                                    Sau khi hoàn thành, trạng thái cuộc hẹn sẽ được chuyển thành "Đã hoàn thành" và không thể thay đổi.
                                    Khách hàng sẽ nhận được thông báo và có thể đánh giá buổi tư vấn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        type='submit'
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                Hoàn thành cuộc hẹn
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AppointmentCompletionModal;