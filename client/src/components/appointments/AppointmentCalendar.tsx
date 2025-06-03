import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { getAvailableTimeSlots } from '../../utils/appointmentUtils';

interface AppointmentCalendarProps {
  counselorId: number;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ counselorId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'date' | 'time' | 'confirm'>('date');

  // Get days in current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const monthNames = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
  ];

  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    setSelectedDate(selectedDate);
    setBookingStep('time');
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setBookingStep('confirm');
  };

  const handleBackToDate = () => {
    setBookingStep('date');
    setSelectedTime(null);
  };

  const handleBackToTime = () => {
    setBookingStep('time');
  };

  const handleConfirmBooking = () => {
    alert(`Xác nhận đặt lịch với chuyên viên #${counselorId} on ${selectedDate?.toLocaleDateString()} at ${selectedTime}`);
    // In a real app, this would send the booking to the server
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep('date');
  };

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const isToday = (day: number) => {
    return currentDay === day && currentMonth === month && currentYear === year;
  };

  const isPast = (day: number) => {
    const date = new Date(year, month, day);
    return date < new Date(currentYear, currentMonth, currentDay);
  };

  const renderCalendar = () => {
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add cells for days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isPastDay = isPast(day);

      days.push(
        <button
          key={day}
          onClick={() => !isPastDay && handleDateClick(day)}
          disabled={isPastDay}
          className={`h-10 w-10 rounded-full flex items-center justify-center font-medium transition-colors ${isCurrentDay
            ? 'bg-primary-100 text-primary-700'
            : isPastDay
              ? 'text-gray-300 cursor-not-allowed'
              : 'hover:bg-primary-50 text-gray-700'
            }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const availableTimeSlots = selectedDate ? getAvailableTimeSlots(counselorId, selectedDate) : [];

  return (
    <div>
      {bookingStep === 'date' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-medium">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}

      {bookingStep === 'time' && selectedDate && (
        <div>
          <div className="mb-6">
            <button
              onClick={handleBackToDate}
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Quay về lịch
            </button>
            <h3 className="text-lg font-medium mt-4">
              Chọn thời gian đặt lịch {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
          </div>

          {availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {availableTimeSlots.map((time, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeClick(time)}
                  className="bg-gray-100 hover:bg-primary-50 text-gray-800 py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  <Clock className="h-4 w-4 mr-2 text-primary-600" />
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Không có lịch hẹn</p>
              <button
                onClick={handleBackToDate}
                className="mt-4 text-primary-600 hover:text-primary-700 transition-colors"
              >
                Chọn ngày khác
              </button>
            </div>
          )}
        </div>
      )}

      {bookingStep === 'confirm' && selectedDate && selectedTime && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Xác nhận lịch hẹn</h3>

          <div className="mb-6">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Ngày</span>
              <span className="font-medium">{selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Thời gian</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600">Hình thức</span>
              <span className="font-medium">Tư vấn trực tuyến</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Thời lượng tư vấn</span>
              <span className="font-medium">45 phút</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBackToTime}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleConfirmBooking}
              className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;