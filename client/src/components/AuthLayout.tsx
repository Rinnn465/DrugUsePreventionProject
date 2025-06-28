import React from "react"
import { Outlet } from "react-router-dom";


const AuthLayout: React.FC = () => {
    if (localStorage.getItem("token")) {
        window.location.href = "/"
    }
    return (
        <div className="bg-blue-300 min-h-screen p-12 grid place-items-center">
            <Outlet />
        </div>
    )
}

export default AuthLayout