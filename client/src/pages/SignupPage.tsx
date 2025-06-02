import React from "react";
import { useFormik } from "formik";
import { Link } from "react-router-dom";
import * as Yup from 'yup'

const SignUpPage: React.FC = () => {

    // handle date selection
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

    const handleDateChange = (key: any, value: any) => {
        const [day = '', month = '', year = ''] = formik.values.date.split('-');

        const newDate = {
            day,
            month,
            year,
            [key]: value
        };

        if (newDate.year && newDate.month && newDate.day) {
            console.log("Full date selected:", newDate);

            formik.setFieldValue('date', `${newDate.day}-${newDate.month}-${newDate.year}`);
        } else {
            console.log("Partial date selected:", newDate);
            formik.setFieldValue('date', `${newDate.day || ''}-${newDate.month || ''}-${newDate.year || ''}`);
        }
    }

    const formik = useFormik({
        initialValues: {
            email: '',
            fullname: '',
            date: '',
            password: '',
            confirmPassword: ''
        },
        onSubmit: (values, { resetForm }) => {
            alert(values.email + " " + values.fullname + " " + values.date + " " + values.password + " " + values.confirmPassword);
            resetForm();
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Không được để trống'),
            fullname: Yup.string()
                .min(2, 'Họ tên phải có ít nhất 2 ký tự')
                .required('Không được để trống'),
            date: Yup.string()
                .required('Không được để trống')
                .matches(/^\d{1,2}-\d{1,2}-\d{4}$/, 'Ngày sinh không hợp lệ')
                .test('date', 'Ngày sinh không hợp lệ', (value) => {
                    if (!value) return false;
                    const [day, month, year] = value.split('-').map(Number);
                    const date = new Date(year, month - 1, day);
                    return date.getDate() === day && date.getMonth() + 1 === month && date.getFullYear() === year;
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

    const [day = "", month = "", year = ""] = formik.values.date.split("-");

    return (
        <form onSubmit={formik.handleSubmit} className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg">
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
                {/* Fullname Field */}
                <div>
                    <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                        Họ tên
                    </label>
                    <input
                        id="fullname"
                        name="fullname"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ tên"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.fullname}
                    />
                    {formik.touched.fullname && formik.errors.fullname ? <p className="text-red-600">
                        {formik.errors.fullname}
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
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Tạo tài khoản
                </button>
            </div>

            {/* Additional Links */}
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Bạn đã có tài khoản?{" "}
                    <Link to="/login" className="text-blue-500 hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </div>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    <Link to="/" className="text-blue-500 hover:underline">
                        Quay về trang chủ
                    </Link>
                </p>
            </div>

        </form >
    )
}

export default SignUpPage