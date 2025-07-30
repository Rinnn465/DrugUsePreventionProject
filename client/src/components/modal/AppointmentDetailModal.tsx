import React from 'react';
import { X, Calendar, Clock, User, MessageSquare, AlertCircle, Video } from 'lucide-react';
import { Appointment } from '@/types/Appointment';
import { parseDate } from '@/utils/parseDateUtils';
import { useUser } from '@/context/UserContext';
import { parseISODateTime } from '@/utils/parseTimeUtils';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  consultantName?: string;
  consultantTitle?: string;
  consultantImageUrl?: string;
  consultantSpecialties?: string[];
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  consultantName,
  consultantTitle = '',
  consultantImageUrl = '',
  consultantSpecialties = []
}) => {
  const { user } = useUser();

  console.log('Current user in AppointmentDetailModal:', user);
  console.log('User RoleName:', user?.RoleName);

  const handleStartVideoCall = () => {
    const appointmentData = {
      appointmentId: appointment?.AppointmentID,
      isConsultant: user?.RoleName === 'Consultant',
      appointmentDetails: {
        customerName: appointment?.CustomerName,
        consultantName: consultantName,
        time: appointment?.Time,
        date: appointment?.Date
      }
    };

    // Encode the data to pass to new window
    const encodedData = encodeURIComponent(JSON.stringify(appointmentData));

    // Open in new tab
    const videoCallWindow = window.open(
      `/video-call?data=${encodedData}`,
      '_blank',
      'width=1200,height=800,resizable=yes,scrollbars=yes'
    );

    if (!videoCallWindow) {
      alert('Please allow popups for video calls to work properly');
    }
  };

  if (!isOpen || !appointment) return null;

  const isLoadingConsultant = !consultantName || consultantName === 'Đang tải...';

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'chờ xác nhận':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'đã xác nhận':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'hoàn thành':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'chờ xác nhận': return 'Chờ xác nhận';
      case 'đã xác nhận': return 'Đã xác nhận';
      case 'hoàn thành': return 'Hoàn thành';
      case 'đã hủy': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black flex items-center">
            <Calendar className="h-6 w-6 mr-3" />
            Chi tiết cuộc hẹn
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Consultant Info */}
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border border-cyan-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-cyan-600 rounded-lg mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-800">Thông tin chuyên gia tư vấn</h4>
            </div>
            <div className="flex items-center space-x-4">
              {consultantImageUrl ? (
                <img
                  src={consultantImageUrl}
                  alt={consultantName}
                  className="h-16 w-16 rounded-full object-cover border-2 border-cyan-200"
                />
              ) : (
                <div className="h-16 w-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center border-2 border-cyan-200">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {isLoadingConsultant ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600 mr-2"></div>
                      Đang tải thông tin...
                    </span>
                  ) : (
                    consultantName || 'Chuyên gia tư vấn'
                  )}
                </p>
                {consultantTitle && !isLoadingConsultant && (
                  <p className="text-gray-600 font-medium">{consultantTitle}</p>
                )}
                {consultantSpecialties.length > 0 && !isLoadingConsultant && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {consultantSpecialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-cyan-200 text-cyan-800 text-sm rounded-full border border-cyan-300"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-blue-600 rounded-lg mr-3">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h5 className="font-semibold text-gray-800">Ngày hẹn</h5>
              </div>
              <p className="text-lg font-medium text-gray-800">{parseDate(appointment.Date)}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-purple-600 rounded-lg mr-3">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <h5 className="font-semibold text-gray-800">Trạng thái</h5>
              </div>
              <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${getStatusColor(appointment.Status)}`}>
                {getStatusText(appointment.Status) === 'rejected' ? 'Đã từ chối' : getStatusText(appointment.Status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-orange-600 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h5 className="font-semibold text-gray-800">Thông tin thời gian</h5>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-800">
                  {appointment.Time}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Thời lượng:</span> {appointment.Duration} phút
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Description */}
          {appointment.Description && (
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-indigo-600 rounded-lg mr-3">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <h5 className="font-semibold text-gray-800">Mô tả</h5>
              </div>
              <p className="text-gray-700 leading-relaxed">{appointment.Description}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {appointment.Status === 'rejected' && appointment.RejectedReason && (
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-300">
              <div className="flex items-center mb-3">
                <div className="p-2 bg-red-600 rounded-lg mr-3">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <h5 className="font-semibold text-red-800">Lý do từ chối</h5>
              </div>
              <p className="text-red-700 leading-relaxed">{appointment.RejectedReason}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-yellow-600 rounded-lg mr-3">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <h5 className="font-semibold text-gray-800">Lưu ý quan trọng</h5>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Vui lòng tham gia cuộc hẹn đúng giờ. Nếu có bất kỳ thay đổi nào,
              hãy liên hệ với chúng tôi ít nhất 24 giờ trước cuộc hẹn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            {appointment.Status === 'confirmed' && (
              <button
                onClick={handleStartVideoCall}
                className="w-full sm:w-44 px-6 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Video className="h-5 w-5 mr-2" />
                {(user?.RoleName === 'user' || user?.RoleName === 'User') ? 'Tham gia video' : 'Bắt đầu video'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-44 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <X className="h-5 w-5 mr-2" />
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 