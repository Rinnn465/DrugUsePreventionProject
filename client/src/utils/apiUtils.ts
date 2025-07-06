/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Base configuration
const BASE_URL = 'http://localhost:5000/api';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Response interfaces
interface ApiResponse<T = any> {
    message?: string;
    data?: T;
    error?: string;
    success?: boolean;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
    totalCount?: number;
    currentPage?: number;
    totalPages?: number;
}

// Auth utilities
const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

const clearAuthToken = (): void => {
    localStorage.removeItem('token');
};

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: BASE_URL,
        timeout: REQUEST_TIMEOUT,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,
    });

    // Request interceptor to add auth token
    instance.interceptors.request.use(
        (config) => {
            const token = getAuthToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error) => {
            // Handle common errors
            if (error.response?.status === 401) {
                // Token expired or invalid
                clearAuthToken();
                window.location.href = '/login';
            } else if (error.response?.status === 403) {
                // Forbidden
                console.error('Access forbidden');
            } else if (error.response?.status === 500) {
                console.error('Server error');
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Create the axios instance
const axiosInstance = createAxiosInstance();

// Generic request function
const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await axiosInstance.request<ApiResponse<T>>(config);
        // Handle different response structures
        const responseData = response.data;

        // If response has a data property, return it, otherwise return the whole response
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
            return responseData.data as T;
        }

        return responseData as T;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// HTTP method helpers
const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'GET', url });
};

const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'POST', url, data });
};

const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'PUT', url, data });
};

const deleteRequest = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return request<T>({ ...config, method: 'DELETE', url });
};

// Authentication APIs
const auth = {
    login: (credentials: { username: string; password: string }) =>
        post<{ token: string; user: any }>('/auth/login', credentials),

    register: (userData: {
        email: string;
        fullName: string;
        username: string;
        dateOfBirth: string;
        password: string;
    }) => post<{ user: any }>('/auth/register', userData),

    forgotPassword: (email: string) =>
        post<{ message: string }>('/auth/forgot-password', { email }),

    logout: () => post<{ message: string }>('/auth/logout'),
};

// Course APIs
const courses = {
    getAll: () => get<any[]>('/course'),

    getById: (id: number) => get<any>(`/course/${id}`),

    getCategories: () => get<any[]>('/course/categories'),

    enroll: (courseId: number) => post<{ message: string }>(`/course/${courseId}/enroll`),

    getEnrolled: () => get<any[]>('/course/enrolled'),

    getEnrolledByUser: (userId: number) => get<any[]>(`/course/${userId}/enrolled/user`),

    complete: (courseId: number) => post<{ message: string }>(`/course/${courseId}/complete`),

    getCompleted: (courseId: number, userId: number) => get<any>(`/course/${courseId}/completed/${userId}`),

    // Lesson APIs
    getLessons: (courseId: number) => get<any[]>(`/course/${courseId}/lessons`),

    getQuestions: (courseId: number) => get<any[]>(`/course/${courseId}/lessons/questions`),

    getAnswers: (courseId: number) => get<any[]>(`/course/${courseId}/lessons/questions/answers`),
};

// Consultant APIs
const consultants = {
    getAll: () => get<any[]>('/consultant'),

    getById: (id: number) => get<any>(`/consultant/${id}`),

    getWithCategories: () => get<any[]>('/consultant/category'),

    getQualifications: () => get<any[]>('/consultant/qualifications'),

    getSpecialties: () => get<any[]>('/consultant/specialties'),

    getSchedule: (consultantId: number) => get<any[]>(`/consultant/schedule/${consultantId}`),

    compareMonthAppointments: (consultantId: number) => get<any>(`/consultant/compare-appointments/${consultantId}`),

    getAverageRating: (consultantId: number) => get<any>(`/consultant/average-month-rating/${consultantId}`),
};

// Appointment APIs
const appointments = {
    getAll: () => get<any[]>('/appointment'),

    create: (appointmentData: {
        consultantId: number;
        accountId: number;
        time: string;
        date: string;
        status?: string;
        description?: string;
        duration?: number;
    }) => post<{ message: string }>('/appointment', appointmentData),

    getByFilter: (params: { consultantId?: number; date?: string }) => {
        const queryParams = new URLSearchParams();
        if (params.consultantId) queryParams.append('consultantId', params.consultantId.toString());
        if (params.date) queryParams.append('date', params.date);
        return get<any[]>(`/appointment/filter?${queryParams.toString()}`);
    },

    approve: (appointmentId: number) => put<{ message: string; meetingUrl: string }>(`/appointment/${appointmentId}/approve`),

    reject: (appointmentId: number, rejectionReason: string) =>
        put<{ message: string }>(`/appointment/${appointmentId}/reject`, { rejectionReason }),

    cancel: (appointmentId: number) => deleteRequest<{ message: string }>(`/appointment/${appointmentId}/cancel`),

    //compare Month Appointments

    // Get appointments for a consultant in a specific month

    //
    getByConsultantId: (consultantId: number | undefined) => get<any[]>(`/appointment/consultant/${consultantId}`),

    rate: (appointmentId: number, ratingData: { rating: number; feedback?: string }) =>
        put<{ message: string }>(`/appointment/${appointmentId}/rate`, ratingData),

    completeAppointment: (appointmentId: number) => put<{ message: string }>(`/appointment/${appointmentId}/complete`),

};

// Article APIs
const articles = {
    getAll: () => get<any[]>('/article'),

    getById: (id: number) => get<any>(`/article/${id}`),

    create: (articleData: {
        title: string;
        content: string;
        summary?: string;
        imageUrl?: string;
    }) => post<{ message: string }>('/article', articleData),

    update: (id: number, articleData: Partial<{
        title: string;
        content: string;
        summary?: string;
        imageUrl?: string;
    }>) => put<{ message: string }>(`/article/${id}`, articleData),

    delete: (id: number) => deleteRequest<{ message: string }>(`/article/${id}`),
};

// Program APIs
const programs = {
    getAll: () => get<any[]>('/program'),

    getById: (id: number) => get<any>(`/program/${id}`),

    enroll: (programId: number) => post<{ message: string }>(`/program/${programId}/enroll`),

    getEnrolled: () => get<any[]>('/program/enrolled'),

    getMyEnrollments: () => get<any[]>('/program-attendee/my-enrollments'),

    checkEnrollment: (programId: number) => get<{ isEnrolled: boolean }>(`/program-attendee/${programId}/enrollment-status`),
};

// Survey APIs
const surveys = {
    submit: (surveyData: {
        eventId: number;
        answers: Array<{ questionId: number; answer: string | number }>;
    }) => post<{ message: string }>('/survey', surveyData),

    getResults: (eventId: number) => get<any>(`/survey/results/${eventId}`),
};

// Management APIs (Admin)
const management = {
    users: {
        getAll: () => get<any[]>('/admin/users'),

        getById: (id: number) => get<any>(`/admin/users/${id}`),

        update: (id: number, userData: any) => put<{ message: string }>(`/admin/users/${id}`, userData),

        delete: (id: number) => deleteRequest<{ message: string }>(`/admin/users/${id}`),
    },

    roles: {
        getAll: () => get<any[]>('/admin/roles'),

        assign: (userId: number, roleId: number) => post<{ message: string }>('/admin/roles/assign', { userId, roleId }),
    },

    courses: {
        create: (courseData: any) => post<{ message: string }>('/admin/courses', courseData),

        update: (id: number, courseData: any) => put<{ message: string }>(`/admin/courses/${id}`, courseData),

        delete: (id: number) => deleteRequest<{ message: string }>(`/admin/courses/${id}`),
    },

    programs: {
        create: (programData: any) => post<{ message: string }>('/admin/programs', programData),

        update: (id: number, programData: any) => put<{ message: string }>(`/admin/programs/${id}`, programData),

        delete: (id: number) => deleteRequest<{ message: string }>(`/admin/programs/${id}`),
    },
};

// Utility functions
const utils = {
    uploadFile: async (file: File, endpoint: string = '/upload'): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getAuthToken();
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        };

        return post<{ url: string }>(endpoint, formData, config);
    },

    downloadFile: async (url: string, filename: string): Promise<void> => {
        try {
            const response = await axiosInstance.get(url, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data]);
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
            throw error;
        }
    },
};

// Main API object
const apiUtils = {
    auth,
    courses,
    consultants,
    appointments,
    articles,
    programs,
    surveys,
    management,
    utils,
};

// Export individual modules for convenience
export {
    auth,
    courses,
    consultants,
    appointments,
    articles,
    programs,
    surveys,
    management,
    utils,
};

// Export types
export type { ApiResponse, PaginatedResponse };

// Default export
export default apiUtils;