import React from 'react';
import { X, Calendar, Clock, User, MapPin, MessageSquare, Phone, AlertCircle } from 'lucide-react';
import { Appointment } from '../../types/Appointment';
import { parseDate } from '../../utils/parseDateUtils';

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
  consultantName = 'Đang tải...',
  consultantTitle = '',
  consultantImageUrl = '',
  consultantSpecialties = []
}) => {
  if (!isOpen || !appointment) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết cuộc hẹn</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Appointment ID */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Cuộc hẹn #{appointment.AppointmentID}
              </h3>
            </div>
          </div>

          {/* Consultant Info */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Thông tin chuyên gia tư vấn
            </h4>
            <div className="flex items-center space-x-4">
              {consultantImageUrl ? (
                <img
                  src={consultantImageUrl}
                  alt={consultantName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">{consultantName}</p>
                {consultantTitle && (
                  <p className="text-sm text-gray-600">{consultantTitle}</p>
                )}
                {consultantSpecialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {consultantSpecialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <h5 className="font-medium text-gray-800">Ngày hẹn</h5>
              </div>
              <p className="text-gray-700">{parseDate(appointment.Date)}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h5 className="font-medium text-gray-800">Thời gian</h5>
              </div>
              <p className="text-gray-700">
                {(() => {
                  if (!appointment.Time) return 'Chưa xác định';
                  
                  // Nếu là chuỗi ISO với T, chuyển đổi
                  if (appointment.Time.includes('T')) {
                    const date = new Date(appointment.Time);
                    if (isNaN(date.getTime())) return 'Chưa xác định';
                    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  }
                  
                  // Nếu đã là format HH:mm hoặc HH:mm:ss
                  if (appointment.Time.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                    return appointment.Time.substring(0, 5); // Chỉ lấy HH:mm
                  }
                  
                  // Trả về như cũ nếu không match
                  return appointment.Time;
                })()}
              </p>
              <p className="text-sm text-gray-500">Thời lượng: {appointment.Duration} phút</p>
              {appointment.Time && appointment.Duration && (
                <p className="text-sm text-gray-500">
                  Kết thúc dự kiến: {(() => {
                    try {
                      let timeStr = appointment.Time;
                      
                      // Xử lý nếu là ISO string
                      if (timeStr.includes('T')) {
                        const date = new Date(timeStr);
                        if (isNaN(date.getTime())) return 'Không xác định';
                        timeStr = date.toTimeString().substr(0, 5);
                      }
                      
                      // Xử lý nếu là HH:mm:ss, chỉ lấy HH:mm
                      if (timeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
                        timeStr = timeStr.substring(0, 5);
                      }
                      
                      const [hours, minutes] = timeStr.split(':').map(Number);
                      if (isNaN(hours) || isNaN(minutes)) return 'Không xác định';
                      
                      const endTime = new Date();
                      endTime.setHours(hours, minutes + appointment.Duration);
                      return endTime.toTimeString().substr(0, 5);
                    } catch (error) {
                      return 'Không xác định';
                    }
                  })()}
                </p>
              )}
            </div>
          </div>

          {/* Meeting URL */}
          {appointment.MeetingURL && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <h5 className="font-medium text-gray-800">Link cuộc họp</h5>
              </div>
              <a
                href={appointment.MeetingURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                {appointment.MeetingURL}
              </a>
            </div>
          )}

          {/* Description */}
          {appointment.Description && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                <h5 className="font-medium text-gray-800">Mô tả</h5>
              </div>
              <p className="text-gray-700">{appointment.Description}</p>
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <h5 className="font-medium text-gray-800">Lưu ý</h5>
            </div>
            <p className="text-sm text-gray-600">
              Vui lòng tham gia cuộc hẹn đúng giờ. Nếu có bất kỳ thay đổi nào, 
              hãy liên hệ với chúng tôi ít nhất 24 giờ trước cuộc hẹn.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 