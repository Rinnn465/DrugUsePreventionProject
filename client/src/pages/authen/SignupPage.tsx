import React, { useState } from "react";
import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from 'yup'
import { toast } from 'react-toastify';
import { parseSqlDate } from "@/utils/parseSqlDateUtils";

const SignUpPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    const handleDateChange = (key: string, value: number | string) => {
        const [year = '', month = '', day = ''] = formik.values.date.split('-');

        const newDate = {
            year,
            month,
            day,
            [key]: value
        };

        if (newDate.year && newDate.month && newDate.day) {
            console.log("Full date selected:", newDate);

            formik.setFieldValue('date', `${newDate.year}-${newDate.month}-${newDate.day}`);
        } else {
            console.log("Partial date selected:", newDate);
            formik.setFieldValue('date', `${newDate.year || ''}-${newDate.month || ''}-${newDate.day || ''}`);
        }
    }

    // Function to get password strength text color
    const getPasswordStrengthTextColor = (level: number) => {
        if (level === 1) return 'text-red-600';
        if (level === 2) return 'text-yellow-600';
        return 'text-green-600';
    };

    // Function to check password strength
    const getPasswordStrength = (password: string) => {
        if (!password) return { level: 0, text: '', color: '' };
        
        const criteria = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password)
        };
        
        const metCriteria = Object.values(criteria).filter(Boolean).length;
        
        if (metCriteria <= 1) {
            return { level: 1, text: 'Yếu', color: 'bg-red-500' };
        } else if (metCriteria <= 2) {
            return { level: 2, text: 'Trung bình', color: 'bg-yellow-500' };
        } else if (metCriteria >= 3) {
            return { level: 3, text: 'Mạnh', color: 'bg-green-500' };
        }
        
        return { level: 0, text: '', color: '' };
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            fullName: '',
            username: '',
            date: '',
            password: '',
            confirmPassword: ''
        },
        validate: undefined, // Tắt validation onChange
        validateOnChange: false, // Không validate khi đang nhập
        validateOnBlur: true, // Chỉ validate khi nhập xong (blur)
        onSubmit: async (values) => {
            setIsLoading(true);
            console.log("Form values before transformation:", values);

            try {
                const transformedValues = {
                    ...values,
                    dateOfBirth: parseSqlDate(new Date(values.date).toISOString()),
                }

                const response = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(transformedValues)
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    toast.error(data.message || 'Đăng ký thất bại');
                }

                console.log("Form submitted with values:", transformedValues);
            } catch (err: unknown) {
                console.error('Error:', err instanceof Error ? err.message : 'Unknown error');
                toast.error('Có lỗi xảy ra khi đăng ký');
            } finally {
                setIsLoading(false);
            }
        },

        validationSchema: Yup.object({
            email: Yup.string()
                .trim()
                .email('Email không hợp lệ')
                .required('Không được để trống'),
            fullName: Yup.string()
                .trim()
                .min(2, 'Họ tên phải có ít nhất 2 ký tự')
                .max(100, 'Họ tên không được vượt quá 100 ký tự')
                .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên không được có số và ký tự đặc biệt')
                .required('Không được để trống'),
            username: Yup.string()
                .trim()
                .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
                .max(50, 'Tên đăng nhập không được vượt quá 50 ký tự')
                .matches(/^[a-zA-Z0-9]+$/, 'Tên đăng nhập chỉ được chứa chữ cái và số')
                .required('Không được để trống'),
            date: Yup.string()
                .required('Không được để trống')
                .matches(/^\d{4}-\d{1,2}-\d{1,2}$/, 'Ngày sinh không hợp lệ')
                .test('date', 'Ngày sinh không hợp lệ', (value) => {
                    if (!value) return false;
                    const [year, month, day] = value.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
                }),
            password: Yup.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .required('Không được để trống'),
            confirmPassword: Yup.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .oneOf([Yup.ref('password'), ''], 'Mật khẩu không trùng khớp')
                .required('Không được để trống')
        })
    })

    const [year = "", month = "", day = ""] = formik.values.date.split("-");
    return (
        <form
            onSubmit={formik.handleSubmit}
            className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg"
            action="/register"
            method="POST"
        >
            <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>
            <div className="flex flex-col space-y-4">
                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập email của bạn"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.email}
                    />
                    {formik.touched.email && formik.errors.email ? <p className="text-red-600">
                        {formik.errors.email}
                    </p> : null}
                </div>
                {/* fullName Field */}
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ tên
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ tên"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.fullName}
                    />
                    {formik.touched.fullName && formik.errors.fullName ? <p className="text-red-600">
                        {formik.errors.fullName}
                    </p> : null}
                </div>

                {/* username field */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên tài khoản (tên sẽ hiển thị trên trang web)
                    </label>
                    <input
                        id="username"
                        name="username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên tài khoản của bạn"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.username}
                    />
                    {formik.touched.username && formik.errors.username ? <p className="text-red-600">
                        {formik.errors.username}
                    </p> : null}
                </div>

                {/* Date of birth field */}
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh (ngày / tháng / năm)
                </label>
                <div className="flex justify-between">
                    <select
                        name="dob_day"
                        id="dob_day"
                        value={day}
                        onChange={(e) => handleDateChange("day", e.target.value)}
                    >
                        <option>Chọn ngày</option>
                        {days.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>

                    <select
                        name="dob_month"
                        id="dob_month"
                        value={month}
                        onChange={(e) => handleDateChange("month", e.target.value)}
                    >
                        <option>Chọn tháng</option>
                        {months.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>

                    <select
                        name="dob_year"
                        id="dob_year"
                        value={year}
                        onChange={(e) => handleDateChange("year", e.target.value)}
                    >
                        <option>Chọn năm</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                {formik.touched.date && formik.errors.date ? <p className="text-red-600">
                    {formik.errors.date}
                </p> : null}

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            data-lpignore="true"
                            style={{
                                fontSize: '16px', // Tránh zoom trên mobile
                            }}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập mật khẩu của bạn"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formik.values.password && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-gray-700">Độ mạnh mật khẩu</span>
                                <span className={`text-xs font-medium ${getPasswordStrengthTextColor(getPasswordStrength(formik.values.password).level)}`}>
                                    {getPasswordStrength(formik.values.password).text}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formik.values.password).color}`}
                                    style={{ 
                                        width: `${(getPasswordStrength(formik.values.password).level / 3) * 100}%` 
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {formik.touched.password && formik.errors.password ? <p className="text-red-600">
                        {formik.errors.password}
                    </p> : null}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Xác nhận mật khẩu
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Xác nhận mật khẩu của bạn"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword ?
                        <p className="text-red-600">
                            {formik.errors.confirmPassword}
                        </p> : null}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${isLoading
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
                            Đang tạo tài khoản...
                        </>
                    ) : (
                        'Tạo tài khoản'
                    )}
                </button>
            </div>

            {/* Enhanced Link Section */}
            <div className="mt-6 space-y-4">
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Bạn đã có tài khoản?</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full px-4 py-2 border border-green-500 text-green-600 bg-white rounded-lg hover:bg-green-50 hover:border-green-600 hover:text-green-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Đăng nhập ngay
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

        </form >
    )
}

export default SignUpPage