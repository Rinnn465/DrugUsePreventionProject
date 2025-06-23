export const parseSqlDate = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {

        return "Xảy ra lỗi trong quá trình xử ly";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so +1
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}