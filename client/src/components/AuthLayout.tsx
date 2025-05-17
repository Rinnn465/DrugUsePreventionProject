import React from "react"
import { Outlet } from "react-router-dom";


export const AuthLayout: React.FC = () => {
    return (
        <div className="bg-blue-300 grid place-items-center h-screen">
            <Outlet />
        </div>
    )
}
