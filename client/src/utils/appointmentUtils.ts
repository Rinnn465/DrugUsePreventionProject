import { parseDate } from '../utils/parseDateUtils'; // Adjust path as needed
import { ConsultantWithSchedule } from '../types/Consultant'; // Adjust path as needed

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
  const dateStr = parseDate(date.toISOString()); // e.g., "30/07/2025"
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

export const formatAppointmentForSql = (data: any) => {
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