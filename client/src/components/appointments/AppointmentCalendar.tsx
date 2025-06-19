import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { ConsultantWithSchedule } from '../../types/Consultant';
import { useUser } from '../../context/UserContext';

interface AppointmentCalendarProps {
  consultantId: number;
  schedule: ConsultantWithSchedule | undefined;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ consultantId, schedule }) => {
  const { user } = useUser();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'date' | 'time' | 'booking' | 'confirm'>('date');
  const [note, setNote] = useState<string>('');

  // Auto-navigate to earliest available month
  useEffect(() => {
    console.log('Schedule prop:', schedule);
    if (schedule && schedule.Schedule && schedule.Schedule.length > 0) {
      const earliestDate = new Date(
        Math.min(...schedule.Schedule.map((sched) => new Date(sched.Date).getTime()))
      );
      setCurrentDate(new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1));
    }
  }, [schedule]);


  // Get days in current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a date is available based on schedule
  const isDateAvailable = (year: number, month: number, day: number) => {
    if (!schedule || !schedule.Schedule || schedule.ConsultantID !== consultantId) {
      console.warn('Invalid schedule:', { schedule, consultantId });
      return false;
    }
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return schedule.Schedule.some((sched) => {
      const schedDate = sched.Date.split('T')[0];
      return schedDate === dateStr;
    });
  };

  // Generate one-hour time slots for the selected date
  const getOneHourTimeSlots = (selectedDate: Date) => {
    if (!schedule || !schedule.Schedule || schedule.ConsultantID !== consultantId) {
      return [];
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    const relevantSchedules = schedule.Schedule.filter(
      (sched) => sched.Date.split('T')[0] === dateStr
    );

    const timeSlots: string[] = [];
    relevantSchedules.forEach((sched) => {
      const start = new Date(sched.StartTime);
      const end = new Date(sched.EndTime);
      let currentTime = start;

      while (currentTime < end) {
        const hours = (currentTime.getUTCHours() + 7) % 24; // UTC+7 for Vietnam
        const minutes = currentTime.getUTCMinutes();
        if (minutes === 0) {
          timeSlots.push(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
          );
        }
        currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000); // 1-hour increments
      }
    });

    return [...new Set(timeSlots)].sort();
  };

  // Format time for display (12-hour format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const monthNames = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
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
    setBookingStep('booking');
  };

  const handleBackToDate = () => {
    setBookingStep('date');
    setSelectedTime(null);
  };

  const handleBackToTime = () => {
    setBookingStep('time');
  };

  const handleBackToNote = () => {
    setBookingStep('booking');
  }

  const handleConfirmBooking = () => {
    // Show success toast instead of alert
    toast.success(
      `✅ Đặt lịch thành công! Bạn đã đặt lịch với chuyên viên vào ngày ${selectedDate?.toLocaleDateString(
        'vi-VN'
      )} lúc ${formatTime(selectedTime!)}`,
      { autoClose: 5000 }
    );

    // Keep the original API call structure
    fetch('http://localhost:5000/api/appointment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        consultantId,
        accountId: user?.AccountID || 0,
        time: selectedTime + ':00',
        date: selectedDate?.toISOString(),
        meetingUrl: 'https://example.com/meeting',
        status: 'pending',
        description: note,
        duration: 60
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        console.log('Server response:', data.message);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      toast.error('❌ Có lỗi xảy ra khi đặt lịch!');
    });

    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep('date');
    setNote('');
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

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = isToday(day);
      const isPastDay = isPast(day);
      const isAvailableDay = isDateAvailable(year, month, day);
      const isSelectable = !isPastDay && isAvailableDay;

      days.push(
        <button
          key={day}
          onClick={() => isSelectable && handleDateClick(day)}
          disabled={!isSelectable}
          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all duration-150 shadow-md
            ${isCurrentDay && isSelectable
              ? 'bg-sky-400 text-white scale-110 ring-2 ring-sky-500'
              : isSelectable
                ? 'hover:bg-sky-100 hover:text-sky-700 text-blue-700'
                : 'text-gray-300 cursor-not-allowed'
            }
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (!schedule || !schedule.Schedule || schedule.Schedule.length === 0) {
    return (
      <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 rounded-2xl p-6 border-2 border-sky-100 shadow-2xl animate-fade-in text-center">
        <p className="text-sky-400">Không có lịch hẹn khả dụng cho chuyên viên này.</p>
      </div>
    );
  }

  const availableTimeSlots = selectedDate ? getOneHourTimeSlots(selectedDate) : [];

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 rounded-2xl p-6 border-2 border-sky-100 shadow-2xl animate-fade-in">
      {bookingStep === 'date' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-sky-100 transition-colors border-2 border-sky-200"
            >
              <ChevronLeft className="h-5 w-5 text-sky-500" />
            </button>
            <h3 className="text-lg font-bold text-sky-700">
              {monthNames[month]} {year}
            </h3>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-sky-100 transition-colors border-2 border-sky-200"
            >
              <ChevronRight className="h-5 w-5 text-sky-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-bold text-sky-400">
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
              className="flex items-center text-sky-600 hover:text-sky-700 transition-colors font-bold"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Quay về lịch
            </button>
            <h3 className="text-lg font-bold mt-4 text-sky-700">
              Chọn thời gian đặt lịch{' '}
              {selectedDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
          </div>
          {availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availableTimeSlots.map((time, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeClick(time)}
                  className="bg-white hover:bg-gradient-to-r hover:from-sky-100 hover:to-blue-100 text-sky-700 font-bold py-3 px-4 rounded-xl border-2 border-sky-200 shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="h-4 w-4 text-sky-500" />
                  {formatTime(time)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sky-400">Không có lịch hẹn</p>
              <button
                onClick={handleBackToDate}
                className="mt-4 text-sky-600 hover:text-sky-700 transition-colors font-bold"
              >
                Chọn ngày khác
              </button>
            </div>
          )}
        </div>
      )}
      {bookingStep === 'booking' && selectedDate && selectedTime && (
        <div className="flex flex-col items-center gap-4 p-6 border border-gray-300 rounded-lg bg-gray-50 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800">Bạn có điều gì muốn nói với chuyên viên không?</h2>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập nội dung tư vấn của bạn..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
          ></textarea>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleBackToTime}
              className="flex-1 py-2 px-4 border-2 border-sky-200 rounded-xl text-sky-700 hover:bg-sky-50 transition-colors font-bold"
            >
              Quay lại
            </button>
            <button
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
              onClick={() => setBookingStep('confirm')}
            >
              Đặt lịch
            </button>
          </div>
        </div>
      )}
      {bookingStep === 'confirm' && selectedDate && selectedTime && (
        <div className="bg-gradient-to-br from-white via-sky-50 to-blue-50 p-8 rounded-2xl border-2 border-sky-100 shadow-2xl animate-fade-in">
          <h3 className="text-xl font-bold mb-4 text-sky-700">Xác nhận lịch hẹn</h3>
          <div className="mb-6">
            <div className="flex items-center justify-between py-3 border-b-2 border-sky-50">
              <span className="text-sky-400">Ngày</span>
              <span className="font-bold text-sky-700">
                {selectedDate.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b-2 border-sky-50">
              <span className="text-sky-400">Thời gian</span>
              <span className="font-bold text-sky-700">{formatTime(selectedTime)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b-2 border-sky-50">
              <span className="text-sky-400">Hình thức</span>
              <span className="font-bold text-sky-700">Tư vấn trực tuyến</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sky-400">Thời lượng tư vấn</span>
              <span className="font-bold text-sky-700">1 giờ</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sky-400">Những điều lưu ý cho chuyên viên</span>
              <span className="font-bold text-sky-700 max-w-xs">
                {note}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleBackToNote}
              className="flex-1 py-2 px-4 border-2 border-sky-200 rounded-xl text-sky-700 hover:bg-sky-50 transition-colors font-bold"
            >
              Quay lại
            </button>
            <button
              onClick={handleConfirmBooking}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-xl hover:from-blue-600 hover:to-sky-600 transition-all font-bold shadow-lg"
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