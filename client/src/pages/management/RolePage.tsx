import React from "react";
import { useParams } from "react-router-dom";
import AdminPage from "./AdminPage";
import ManagerPage from "./ManagerPage";

const RolePage: React.FC = () => {
    const { userId } = useParams();

    switch (userId) {
        case "admin":
            return <AdminPage />
        case "consultant":
            return <div>consultant Dashboard</div>;
        case "manager":
            return <ManagerPage />
        default:
            return null;
    }

}
export default RolePage;