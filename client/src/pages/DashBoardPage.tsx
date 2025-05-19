import { useParams } from "react-router-dom";
import { users } from "../data/userData";

const DashBoardPage: React.FC = () => {
    const { userId } = useParams();

    const user = users.find((user) => user.id.toString() === userId);
    return (
        <div>Dashboard Page of {user?.id} </div>
    )
}

export default DashBoardPage;
