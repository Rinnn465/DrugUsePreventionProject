import React from "react";
import { useParams } from "react-router-dom";
import AdminPage from "./AdminPage";
import ManagerPage from "./ManagerPage";
import DashBoardPage from "../DashBoardPage";

const RolePage: React.FC = () => {
    const { userId } = useParams();

    switch (userId) {
        case "admin":
            return <AdminPage />
        case "consultant":
            return <DashBoardPage />;
        case "manager":
            return <ManagerPage />
        default:
            return null;
    }

}
export default RolePage;