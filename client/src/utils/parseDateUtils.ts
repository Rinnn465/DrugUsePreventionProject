export const parseDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Xảy ra lỗi trong quá trình xử ly";
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false,
    };

    return date.toLocaleString('vi-VN', options);
}