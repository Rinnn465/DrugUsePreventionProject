import { parseDate } from '../utils/parseDateUtils'; // Adjust path as needed
import { ConsultantWithSchedule } from '../types/Consultant'; // Adjust path as needed
import { parseSqlDate } from './parseSqlDateUtils';
import { parseSQLTime } from './parseTimeUtils';

export const getAvailableTimeSlots = (
  consultant: ConsultantWithSchedule | undefined,
  date: Date
): string[] => {
  // Validate inputs
  if (!consultant || !consultant.Schedule || consultant.Schedule.length === 0) {

    console.warn('Invalid or empty consultant schedule:', consultant?.ConsultantID);
    return [];
  }

  // Format the input date to match schedule Date format (DD/MM/YYYY)
  const dateStr = parseDate(date.toISOString());
  if (dateStr === "Xảy ra lỗi trong quá trình xử lý") {
    console.warn('Invalid date:', date);
    return [];
  }

  // Filter schedules for the selected date
  const relevantSchedules = consultant.Schedule.filter(
    (sched) => sched.Date === dateStr
  );

  if (relevantSchedules.length === 0) {
    return [];
  }

  // Generate one-hour time slots
  const timeSlots: string[] = [];
  relevantSchedules.forEach((sched) => {
    const start = new Date(sched.StartTime);
    const end = new Date(sched.EndTime);

    // Validate start and end times
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      console.warn('Invalid schedule times:', sched);
      return;
    }

    let currentTime = start;
    while (currentTime < end) {
      const hours = (currentTime.getUTCHours() + 7) % 24; // Adjust for UTC+7
      const minutes = currentTime.getUTCMinutes();
      if (minutes === 0) { // Only include slots starting on the hour
        timeSlots.push(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        );
      }
      // Increment by 1 hour
      currentTime = new Date(currentTime.getTime() + 60 * 60 * 1000);
    }
  });

  // Remove duplicates and sort
  return [...new Set(timeSlots)].sort();
};

export const formatAppointmentForSql = (data: {
  consultantId: number;
  accountId: number;
  time: string;
  date: string;
  meetingUrl?: string;
  status: string;
  description?: string;
  duration: number;
}) => {
  // Format time to HH:mm:ss
  const formattedTime = `${data.time}:00`; // e.g., "17:00" -> "17:00:00"

  // Parse date to YYYY-MM-DD, adjusting for UTC+7
  const dateObj = new Date(data.date);
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date format');
  }
  // Convert to Vietnam time (UTC+7)
  const localDate = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000);
  const formattedDate = `${localDate.getFullYear()}-${(localDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${localDate.getDate().toString().padStart(2, '0')}`; // e.g., "2025-07-30"

  return {
    consultantId: data.consultantId,
    accountId: data.accountId,
    time: formattedTime,
    date: formattedDate,
    meetingUrl: data.meetingUrl,
    status: data.status,
    description: data.description,
    duration: data.duration,
  };
};

/**
 * Check if video call is available for an appointment based on time window
 * @param appointmentDate - Date string (YYYY-MM-DD format)
 * @param appointmentTime - Time string (HH:mm:ss or ISO format)
 * @param duration - Duration in minutes
 * @param startBufferMinutes - Minutes before appointment start when video is available (default: 15)
 * @param endBufferMinutes - Minutes after appointment end when video is available (default: 15)
 * @returns boolean indicating if video call is currently available
 */
export const isVideoCallAvailable = (
  appointmentDate: string,
  appointmentTime: string,
  duration: number = 60,
  startBufferMinutes: number = import.meta.env.VITE_VIDEO_CALL_BUFFERED_TIME,
  endBufferMinutes: number = import.meta.env.VITE_VIDEO_CALL_BUFFERED_TIME
): boolean => {
  try {
    appointmentDate = parseSqlDate(appointmentDate);
    appointmentTime = parseSQLTime(appointmentTime.split('T')[1]);

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);

    if (isNaN(appointmentDateTime.getTime())) {
      console.error('Invalid appointment date/time:', { appointmentDate, appointmentTime });
      return false;
    }

    const currentDateTime = new Date();

    // Calculate end time by adding duration in minutes
    const endDateTime = new Date(appointmentDateTime.getTime() + (duration * 60 * 1000));

    // Calculate allowed time window
    const startBuffer = startBufferMinutes * 60 * 1000; // Convert to milliseconds
    const endBuffer = endBufferMinutes * 60 * 1000; // Convert to milliseconds

    const allowedStartTime = appointmentDateTime.getTime() - startBuffer;
    const allowedEndTime = endDateTime.getTime() + endBuffer;
    const currentTime = currentDateTime.getTime();

    const isAvailable = currentTime >= allowedStartTime && currentTime <= allowedEndTime;

    console.log('Video call availability check:', {
      appointmentStart: appointmentDateTime.toLocaleString(),
      appointmentEnd: endDateTime.toLocaleString(),
      current: currentDateTime.toLocaleString(),
      allowedWindow: `${new Date(allowedStartTime).toLocaleString()} - ${new Date(allowedEndTime).toLocaleString()}`,
      isAvailable
    });

    return isAvailable;
  } catch (error) {
    console.error('Error checking video call availability:', error);
    return false;
  }
};

/**
 * Get video call availability info for display
 * @param appointmentDate - Date string (YYYY-MM-DD format)
 * @param appointmentTime - Time string (HH:mm:ss or ISO format)
 * @param duration - Duration in minutes
 * @returns object with availability status and display text
 */
export const getVideoCallAvailabilityInfo = (
  appointmentDate: string,
  appointmentTime: string,
  duration: number = 60
): {
  isAvailable: boolean;
  buttonText: string;
  tooltipText: string;
  statusText?: string;
} => {
  const isAvailable = isVideoCallAvailable(appointmentDate, appointmentTime, duration);

  if (isAvailable) {
    return {
      isAvailable: true,
      buttonText: 'Bắt đầu video',
      tooltipText: 'Bắt đầu cuộc gọi video',
    };
  } else {
    return {
      isAvailable: false,
      buttonText: 'Video chưa khả dụng',
      tooltipText: 'Cuộc gọi video chỉ khả dụng trong khoảng thời gian từ 15 phút trước đến 15 phút sau cuộc hẹn',
      statusText: 'Video khả dụng 15 phút trước cuộc hẹn',
    };
  }
};