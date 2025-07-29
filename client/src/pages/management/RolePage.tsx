import React from "react";
import { useParams } from "react-router-dom";
import AdminPage from "./AdminPage";
import ManagerPage from "./ManagerPage";
import StaffPage from "./StaffPage";
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
        case "staff":
            return <StaffPage />
        default:
            return null;
    }

}
export default RolePage;