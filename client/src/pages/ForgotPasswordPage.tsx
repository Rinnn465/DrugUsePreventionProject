import { useFormik } from 'formik';
import React from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

const ForgotPasswordPage: React.FC = () => {
    const formik = useFormik(
        {
            initialValues: {
                email: ''
            },
            validationSchema: Yup.object({
                email: Yup.string()
                    .email('Email không hợp lệ')
                    .required('Không được để trống')
            }),
            onSubmit: values => {
                alert(`Đã gửi liên kết đặt lại mật khẩu đến ${values.email}`);
            }
        }
    )
    return (
        <>
            <form
                onSubmit={formik.handleSubmit}
                className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Quên mật khẩu</h2>

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
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>
                    {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500 text-sm mt-1">
                            {formik.errors.email}
                        </div>
                    ) : null}
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 mt-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Gửi liên kết để đặt lại mật khẩu
                </button>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Quay về trang đăng ký
                        </Link>
                    </p>
                    <p className="text-sm text-gray-600">
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Quay về trang đăng nhập
                        </Link>
                    </p>
                </div>
            </form>
        </>

    )
}
export default ForgotPasswordPage;