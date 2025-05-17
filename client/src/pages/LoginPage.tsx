import React from "react";
import { useFormik } from "formik";
import * as Yup from 'yup'
import { Link } from "react-router-dom";

const LoginPage: React.FC = () => {

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: (values) => {
            alert(values.email + " " + values.password);
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Required')
        })
    })
    return (
        <form onSubmit={formik.handleSubmit} className="container mx-auto max-w-md p-8 bg-gray-100 shadow-xl rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
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
                        placeholder="Enter your email"
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
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? <p className="text-red-600">
                        {formik.errors.password}
                    </p> : null}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Login
                </button>
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-500 hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    <Link to="/" className="text-blue-500 hover:underline">
                        Back to home page
                    </Link>
                </p>
            </div>
        </form>
    )
}

export default LoginPage