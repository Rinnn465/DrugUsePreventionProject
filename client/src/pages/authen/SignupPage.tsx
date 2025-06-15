import React, { useState } from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import * as Yup from 'yup'

const SignUpPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    // handle role selection
    // const roles = ['Thành viên', 'Quản trị viên', 'Quản lý', 'Nhân viên', 'Chuyên viên'];
    const formik = useFormik({
        initialValues: {
            email: '',
            fullName: '',
            username: '',
            date: '',
            // role: '',
            password: '',
            confirmPassword: ''
        },
        onSubmit: async (values, { resetForm }) => {
            setIsLoading(true);
            try {
                const transformedValues = {
                    ...values,
                    dateOfBirth: values.date
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
                    alert(data.message);
                    window.location.href = '/login'; // Redirect to login page after successful registration
                } else {
                    alert(data.message || 'Đăng ký thất bại');
                }
                
                console.log("Form submitted with values:", transformedValues);
            } catch (err: any) {
                console.error('Error:', err.message);
                alert('Có lỗi xảy ra khi đăng ký');
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
                .required('Không được để trống'),
            username: Yup.string()
                .trim()
                .min(2, 'Tên đăng nhập phải có ít nhất 2 ký tự')
                .required('Không được để trống'),
            date: Yup.string()
                .required('Không được để trống'),
            // .matches(/^\d{1,2}-\d{1,2}-\d{4}$/, 'Ngày sinh không hợp lệ')
            // .test('date', 'Ngày sinh không hợp lệ', (value) => {
            //     if (!value) return false;
            //     const [day, month, year] = value.split('-').map(Number);
            //     const date = new Date(year, month - 1, day);
            //     return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
            // }),
            // role: Yup.string()
            //     .required('Không được để trống')
            //     .oneOf(roles, 'Vai trò không hợp lệ'),
            password: Yup.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .required('Không được để trống'),
            confirmPassword: Yup.string()
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
                .oneOf([Yup.ref('password'), ''], 'Mật khẩu không trùng khớp')
                .required('Không được để trống')
        })
    })


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
                    {/* <select
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
                    </select> */}
                    <input type="date" name="date" id="date"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.date || ""}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {formik.touched.date && formik.errors.date ? <p className="text-red-600">
                    {formik.errors.date}
                </p> : null}

                {/* role field */}
                {/* <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
                    Chọn role (các vai trò khác ngoài member đều cần sự phê duyệt của quản trị viên)
                </label>
                <select
                    name="role"
                    id="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                >
                    <option>Chọn role</option>
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>

                {formik.touched.role && formik.errors.role ? <p className="text-red-600">
                    {formik.errors.role}
                </p> : null} */}

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Mật khẩu
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập mật khẩu của bạn"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
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
                    className={`py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${
                        isLoading 
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