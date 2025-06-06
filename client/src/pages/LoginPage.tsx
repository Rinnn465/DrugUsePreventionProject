import React from "react";
import { useFormik } from "formik";
import * as Yup from 'yup'
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const LoginPage: React.FC = () => {

    const { setUser } = useUser();
    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: (values) => {
            fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            })
                .then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data);

                        setUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        window.location.href = '/';
                    }
                })
                .catch(err => console.error('Error:', err));

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
    return (
        <form onSubmit={formik.handleSubmit}
            className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg"
            action="/login"
            method="POST"
        >
            <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
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
                    <Link
                        to={"/forgot-password"}
                    >
                        <p className="text-sm text-blue-500 hover:underline">
                            Quên mật khẩu?
                        </p>
                    </Link>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Đăng nhập
                </button>
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Bạn chưa có tài khoản?{" "}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Đắng ký ngay
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
        </form>
    )
}

export default LoginPage