// utils/timeParser.ts
// utils/isoTimeParser.ts

export interface ISOTimeParseOptions {
    format?: '24h' | '12h' | 'short';
    timezone?: 'UTC' | 'local';
    includeSeconds?: boolean;
}

export const parseISODateTime = (
    isoString: string | null,
    options: ISOTimeParseOptions = {}
): string => {
    if (!isoString) return '--';

    const {
        format = '24h',
        timezone = 'UTC',
        includeSeconds = true
    } = options;
    let timeStr: string;
    try {
        const date = new Date(isoString);

        // Choose between UTC or local time
        const hours = timezone === 'UTC' ? date.getUTCHours() : date.getHours();
        const minutes = timezone === 'UTC' ? date.getUTCMinutes() : date.getMinutes();
        const seconds = timezone === 'UTC' ? date.getUTCSeconds() : date.getSeconds();

        switch (format) {
            case '12h':
                return formatTo12Hour(hours, minutes);

            case 'short':
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            case '24h':
            default:
                timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                return includeSeconds ? `${timeStr}:${String(seconds).padStart(2, '0')}` : timeStr;
        }
    } catch (error) {
        console.error('Error parsing ISO datetime:', error);
        return isoString;
    }
};

/**
 * Parse SQL Server time string to readable format
 * @param sqlTime - Time string from SQL Server (e.g., "14:30:00", "14:30:00.000")
 * @param format - Output format: '24h', '12h', 'short'
 * @returns Formatted time string
 */
export const parseSQLTime = (sqlTime: string | null, format: '24h' | '12h' | 'short' = '24h'): string => {
    if (!sqlTime) return '--';

    try {
        // Remove milliseconds if present (14:30:00.000 -> 14:30:00)
        const cleanTime = sqlTime.split('.')[0];

        // Split into components
        const [hours, minutes, seconds] = cleanTime.split(':').map(Number);

        switch (format) {
            case '12h':
                return formatTo12Hour(hours, minutes);
            case 'short':
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            case '24h':
            default:
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    } catch (error) {
        console.error('Error parsing SQL time:', error);
        return sqlTime; // Return original if parsing fails
    }
};

// Add this function at the top of the component, after the imports
export const addMinutesToISOTime = (isoString: string, minutesToAdd: number): string => {
    try {
        const date = new Date(isoString);
        const newDate = new Date(date.getTime() + (minutesToAdd * 60 * 1000));

        // Format back to time only
        const hours = newDate.getUTCHours();
        const minutes = newDate.getUTCMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

        return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
    } catch (error) {
        console.error('Error adding minutes to time:', error);
        return 'Không xác định';
    }
};

/**
 * Convert 24-hour format to 12-hour format with AM/PM
 */
const formatTo12Hour = (hours: number, minutes: number): string => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
};

/**
 * Parse SQL Server datetime to time only
 * @param sqlDateTime - DateTime string from SQL Server
 * @param format - Output format
 * @returns Formatted time string
 */
export const parseTimeFromDateTime = (sqlDateTime: string | null, format: '24h' | '12h' | 'short' = '24h'): string => {
    if (!sqlDateTime) return '--';

    try {
        const date = new Date(sqlDateTime);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        switch (format) {
            case '12h':
                return formatTo12Hour(hours, minutes);
            case 'short':
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            case '24h':
            default:
                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    } catch (error) {
        console.error('Error parsing datetime to time:', error);
        return sqlDateTime;
    }
};