import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from 'yup'
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

interface ErrorResponse {
    message: string;
    field?: string;
    suggestion?: string;
    success?: boolean;
}

const LoginPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<ErrorResponse | null>(null);
    const { setUser } = useUser();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: async (values) => {
            setIsLoading(true);
            setServerError(null); // Clear previous errors

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                });

                const data = await response.json();

                if (response.ok) {
                    console.log('Login successful:', data);

                    setUser(data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('token', data.token);

                    // Redirect based on user role
                    const userRole = data.user.RoleName;
                    if (userRole === 'Admin') {
                        window.location.href = '/roles/admin';
                    } else if (userRole === 'Consultant') {
                        window.location.href = '/roles/consultant';
                    } else if (userRole === 'Manager') {
                        window.location.href = '/roles/manager';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    // Handle different types of errors
                    setServerError(data);
                }
            } catch (err) {
                console.error('Network error:', err);
                setServerError({
                    message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
                    field: 'network'
                });
            } finally {
                setIsLoading(false);
            }
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Không được để trống'),
            password: Yup.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .required('Không được để trống')
        })
    })

    // Function to render error with appropriate styling and icon
    const renderError = (error: ErrorResponse) => {
        const getErrorIcon = () => {
            if (error.field === 'email' || error.suggestion === 'register') {
                return (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                );
            } else if (error.field === 'password') {
                return (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                );
            }
            return (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5C2.962 17.333 3.924 19 5.464 19z" />
                </svg>
            );
        };

        return (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                    <div className="text-red-500">
                        {getErrorIcon()}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">{error.message}</p>
                        {error.suggestion === 'register' && (
                            <div className="mt-2">
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Đăng ký tài khoản mới
                                </Link>
                            </div>
                        )}
                        {error.suggestion === 'forgot-password' && (
                            <div className="mt-2">
                                <Link
                                    to="/forgot-password"
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Đặt lại mật khẩu
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={formik.handleSubmit}
            className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg"
            action="/login"
            method="POST"
        >
            <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>

            {/* Display server errors */}
            {serverError && renderError(serverError)}

            <div className="flex flex-col space-y-4">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${(formik.touched.email && formik.errors.email) || (serverError?.field === 'email')
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                        placeholder="Nhập email của bạn"
                        onChange={(e) => {
                            formik.handleChange(e);
                            if (serverError) setServerError(null); // Clear server error on input change
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? <p className="text-red-600 text-sm mt-1">
                        {formik.errors.email}
                    </p> : null}
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${(formik.touched.password && formik.errors.password) || (serverError?.field === 'password')
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                            }`}
                        placeholder="Nhập mật khẩu của bạn"
                        onChange={(e) => {
                            formik.handleChange(e);
                            if (serverError) setServerError(null); // Clear server error on input change
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? <p className="text-red-600 text-sm mt-1">
                        {formik.errors.password}
                    </p> : null}
                </div>

                <div>
                    <Link
                        to={"/forgot-password"}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 font-medium"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Quên mật khẩu?
                    </Link>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang đăng nhập...
                        </>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>
            </div>

            {/* Enhanced Link Section */}
            <div className="mt-6 space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Bạn chưa có tài khoản?</p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-blue-500 text-blue-600 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Đăng ký ngay
                    </Link>
                </div>

                <div className="text-center border-t pt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Quay về trang chủ
                    </Link>
                </div>
            </div>
        </form>
    )
}

export default LoginPage