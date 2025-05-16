// Simple utility to generate mock available time slots
// In a real application, this would fetch availability from an API

export const getAvailableTimeSlots = (counselorId: number, date: Date): string[] => {
  // Get day of week (0-6, where 0 is Sunday)
  const dayOfWeek = date.getDay();
  
  // This is a simplified example - in real life, this would be fetched from a database
  // Different counselors could have different availability
  
  // No availability on weekends for this example
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [];
  }
  
  // Different counselors have different schedules
  if (counselorId === 1 || counselorId === 3 || counselorId === 5) {
    // Available on Monday, Wednesday, Friday
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      return [
        '9:00 AM', 
        '10:00 AM', 
        '11:00 AM', 
        '1:00 PM', 
        '2:00 PM', 
        '3:00 PM'
      ];
    }
  } else {
    // Available on Tuesday, Thursday
    if (dayOfWeek === 2 || dayOfWeek === 4) {
      return [
        '10:00 AM',
        '11:00 AM',
        '1:00 PM',
        '2:00 PM',
        '3:00 PM',
        '4:00 PM'
      ];
    }
  }
  
  // If we get here, no slots available
  return [];
};