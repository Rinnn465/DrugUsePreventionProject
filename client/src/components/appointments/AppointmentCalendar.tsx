import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { ConsultantWithSchedule } from '../../types/Consultant';
import { useUser } from '../../context/UserContext';

interface AppointmentCalendarProps {
  consultantId: number;
  schedule: ConsultantWithSchedule | undefined;
}

interface Appointment {
  AppointmentID: number;
  ConsultantID: number;
  AccountID: number;
  Time: string;
  Date: string;
  MeetingURL?: string;
  Status: string;
  Description?: string;
  Duration: number;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({ consultantId, schedule }) => {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'date' | 'time' | 'booking' | 'confirm'>('date');
  const [note, setNote] = useState<string>('');
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);

  // Auto-navigate to earliest available month
  useEffect(() => {
    if (schedule && schedule.Schedule && schedule.Schedule.length > 0) {
      const dates = schedule.Schedule
        .map((sched) => {
          // Parse date as is, assuming ISO format (e.g., 2025-08-01T00:00:00.000Z)
          const date = new Date(sched.Date);
          if (isNaN(date.getTime())) {
            console.warn('Invalid schedule date:', sched.Date);
            return null;
          }
          console.log('Parsed schedule date:', sched.Date, '->', date.toISOString());
          return date;
        })
        .filter((date): date is Date => date !== null);
      if (dates.length > 0) {
        const earliestDate = new Date(Math.min(...dates.map((date) => date.getTime())));
        console.log('Earliest date:', earliestDate.toISOString());
        // Use UTC to avoid timezone shifts
        setCurrentDate(new Date(Date.UTC(earliestDate.getUTCFullYear(), earliestDate.getUTCMonth(), 1)));
      }
    }
  }, [schedule]);

  // useEffect(() => {
  //   if (selectedDate) {
  //     const newCurrentDate = new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1));
  //     if (newCurrentDate.getTime() !== currentDate.getTime()) {
  //       console.log('Updating currentDate:', newCurrentDate.toISOString());
  //       setCurrentDate(newCurrentDate);
  //     }
  //   }
  // }, [selectedDate, currentDate]);

  // Fetch booked appointments for the consultant


  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      // Fix: Change the URL to match your route
      fetch(`http://localhost:5000/api/appointment/filter?consultantId=${consultantId}&date=${dateStr}`)
        .then(response => response.json())
        .then(data => {
          console.log('Fetched booked appointments:', data);
          setBookedAppointments(data.data || []);
        })
        .catch(error => console.error('Error fetching appointments:', error));
    }
  }, [consultantId, selectedDate]);


  // Get days in current month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(Date.UTC(year, month + 1, 0)).getDate();
  };

  // Get day of week for first day of month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(Date.UTC(year, month, 1)).getDay();
  };

  // Check if a date is available based on schedule
  const isDateAvailable = (year: number, month: number, day: number) => {
    if (!schedule || !schedule.Schedule || schedule.ConsultantID !== consultantId) {
      console.warn('Invalid schedule:', { schedule, consultantId });
      return false;
    }
    const dateStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
    return schedule.Schedule.some((sched) => {
      const schedDate = sched.Date.split('T')[0];
      return schedDate === dateStr;
    });
  };

  // Predefined time slots
  const timeSlots = [
    { start: '08:00', end: '09:00', period: 'Sáng' },
    { start: '09:30', end: '10:30', period: 'Sáng' },
    { start: '11:00', end: '12:00', period: 'Sáng' },
    { start: '13:30', end: '14:30', period: 'Chiều' },
    { start: '15:00', end: '16:00', period: 'Chiều' },
    { start: '16:30', end: '17:30', period: 'Chiều' },
    { start: '19:00', end: '20:00', period: 'Tối' },
  ];

  // Get available time slots for the selected date
  const getAvailableTimeSlots = (selectedDate: Date) => {
    if (!schedule || !schedule.Schedule || schedule.ConsultantID !== consultantId) {
      console.warn('Invalid schedule or consultant ID mismatch:', { schedule, consultantId });
      return [];
    }
    const dateStr = selectedDate.toISOString().split('T')[0];
    console.log('Getting slots for date:', dateStr);
    console.log('Current booked appointments:', bookedAppointments);

    // Filter schedules for the selected date
    const relevantSchedules = schedule.Schedule.filter(
      (sched) => sched.Date.split('T')[0] === dateStr
    );
    console.log('Relevant schedules:', relevantSchedules);

    const availableSlots = timeSlots.filter((slot) => {
      const [slotStartHour, slotStartMinute] = slot.start.split(':').map(Number);
      const [slotEndHour, slotEndMinute] = slot.end.split(':').map(Number);
      const slotStartMinutes = slotStartHour * 60 + slotStartMinute;
      const slotEndMinutes = slotEndHour * 60 + slotEndMinute;

      return relevantSchedules.some((sched) => {
        try {
          // Extract time portion from StartTime and EndTime
          let startTimeStr, endTimeStr;
          if (sched.StartTime.includes('T')) {
            // ISO format (e.g., 1970-01-01T08:00:00.000Z)
            const startTime = new Date(sched.StartTime);
            const endTime = new Date(sched.EndTime);
            startTimeStr = `${startTime.getUTCHours().toString().padStart(2, '0')}:${startTime.getUTCMinutes().toString().padStart(2, '0')}:00`;
            endTimeStr = `${endTime.getUTCHours().toString().padStart(2, '0')}:${endTime.getUTCMinutes().toString().padStart(2, '0')}:00`;
          } else {
            // Already in HH:mm:ss format
            startTimeStr = sched.StartTime;
            endTimeStr = sched.EndTime;
          }

          // Combine with selected date in UTC
          const schedStart = new Date(`${dateStr}T${startTimeStr}Z`);
          const schedEnd = new Date(`${dateStr}T${endTimeStr}Z`);

          if (isNaN(schedStart.getTime()) || isNaN(schedEnd.getTime())) {
            console.warn('Invalid schedule time format:', sched);
            return false;
          }

          // Extract hours and minutes in UTC
          const schedStartHour = schedStart.getUTCHours();
          const schedStartMinute = schedStart.getUTCMinutes();
          const schedEndHour = schedEnd.getUTCHours();
          const schedEndMinute = schedEnd.getUTCMinutes();

          const schedStartMinutes = schedStartHour * 60 + schedStartMinute;
          const schedEndMinutes = schedEndHour * 60 + schedEndMinute;

          console.log('Comparing slot:', {
            slot: `${slot.start}-${slot.end}`,
            slotMinutes: `${slotStartMinutes}-${slotEndMinutes}`,
            schedule: `${startTimeStr}-${endTimeStr}`,
            scheduleMinutes: `${schedStartMinutes}-${schedEndMinutes}`,
          });

          // Check if the slot is within the schedule
          return slotStartMinutes >= schedStartMinutes && slotEndMinutes <= schedEndMinutes;
        } catch (error) {
          console.error('Error parsing schedule times:', error, sched);
          return false;
        }
      });
    });

    // Fix: Update the booking status logic to handle the ISO time format
    const slotsWithBookingStatus = availableSlots.map((slot) => {
      // Check if this slot is booked by comparing the start time
      const isBooked = bookedAppointments.some((appt) => {
        const appointmentDate = appt.Date.split('T')[0]; // Extract date part

        // Fix: Handle the ISO time format from database
        const appointmentTimeISO = new Date(appt.Time);
        const appointmentTime = `${appointmentTimeISO.getUTCHours().toString().padStart(2, '0')}:${appointmentTimeISO.getUTCMinutes().toString().padStart(2, '0')}`;

        console.log('Checking booking status:', {
          slotDate: dateStr,
          slotTime: slot.start,
          appointmentDate,
          appointmentTimeRaw: appt.Time,
          appointmentTimeParsed: appointmentTime,
          isMatch: appointmentDate === dateStr && appointmentTime === slot.start
        });

        return appointmentDate === dateStr && appointmentTime === slot.start;
      });

      console.log(`Slot ${slot.start} is ${isBooked ? 'BOOKED' : 'AVAILABLE'}`);

      return {
        ...slot,
        isBooked,
      };
    });

    console.log('Final slots with booking status:', slotsWithBookingStatus);
    return slotsWithBookingStatus;
  };

  // Format time for display (12-hour format)
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const monthNames = [
    'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
    'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
  ];

  const dayNames = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

  const handlePrevMonth = () => {
    const newCurrentDate = new Date(Date.UTC(year, month - 1, 1));
    console.log('Navigating to previous month:', newCurrentDate.toISOString());
    setCurrentDate(newCurrentDate);
  };

  const handleNextMonth = () => {
    const newCurrentDate = new Date(Date.UTC(year, month + 1, 1));
    console.log('Navigating to next month:', newCurrentDate.toISOString());
    setCurrentDate(newCurrentDate);
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(Date.UTC(year, month, day));
    console.log('Date clicked:', selectedDate.toISOString());
    if (isDateAvailable(year, month, day)) {
      setSelectedDate(selectedDate);
      setBookingStep('time');
    } else {
      console.warn('Selected date is not available:', selectedDate.toISOString());
    }
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
  };

  const handleConfirmBooking = () => {
    toast.success(
      `✅ Đặt lịch thành công! Bạn đã đặt lịch với chuyên viên vào ngày ${selectedDate?.toLocaleDateString(
        'vi-VN'
      )} lúc ${formatTime(selectedTime!)}`,
      { autoClose: 5000 }
    );

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
        duration: 60,
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
  const currentDay = today.getUTCDate();
  const currentMonth = today.getUTCMonth();
  const currentYear = today.getUTCFullYear();

  const isToday = (day: number) => {
    return currentDay === day && currentMonth === month && currentYear === year;
  };

  const isPast = (day: number) => {
    const date = new Date(Date.UTC(year, month, day));
    return date < new Date(Date.UTC(currentYear, currentMonth, currentDay));
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
            }`}
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
  const availableTimeSlots = getAvailableTimeSlots(selectedDate || new Date());
  console.log('Rendering calendar with currentDate:', currentDate.toISOString(), 'month:', monthNames[month], 'year:', year);

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
            <div className="space-y-4">
              {['Sáng', 'Chiều', 'Tối'].map((period) => {
                const slots = availableTimeSlots.filter((slot) => slot.period === period);
                if (slots.length === 0) return null;
                return (
                  <div key={period}>
                    <h4 className="text-md font-semibold text-sky-600 mb-2">{period}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {slots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => !slot.isBooked && handleTimeClick(slot.start)}
                          disabled={slot.isBooked}
                          className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                            ${slot.isBooked
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300 opacity-50'
                              : 'bg-white hover:bg-gradient-to-r hover:from-sky-100 hover:to-blue-100 text-sky-700 font-bold border-sky-200 shadow-lg'
                            }`}
                        >
                          <Clock className={`h-4 w-4 ${slot.isBooked ? 'text-gray-400' : 'text-sky-500'}`} />
                          {slot.isBooked ? (
                            <span className="line-through">
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </span>
                          ) : (
                            <span>
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </span>
                          )}
                          {slot.isBooked && (
                            <span className="text-xs text-red-500 ml-2">(Đã đặt)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
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