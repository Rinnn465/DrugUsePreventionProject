import React from "react";
import { useFormik } from "formik";
import * as Yup from 'yup'

const Login: React.FC = () => {

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: () => {
            alert('hi')
        },
        validationSchema: {

        }
    })
    return (
        <form onSubmit={formik.handleSubmit} className="container mx-auto max-w-4xl px-6 py-8">
            <div className="flex flex-col">
                <div>
                    <label>Email</label>
                    <input
                        type="text"
                    />
                </div>

                <div>
                    <label id=''>Password</label>
                    <input type="password" />
                </div>

                <button type="submit">
                    Login
                </button>
            </div>
        </form>
    )
}

export default Login