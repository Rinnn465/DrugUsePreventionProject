import { useParams } from "react-router-dom";
import { counselorData } from "../data/counselorData";
import { Star } from "lucide-react";

const CounselorDetailPage: React.FC = () => {
    const { counselorId } = useParams();
    const counselor = counselorData.find(counselor => counselor.id === Number(counselorId));

    if (!counselor) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-center text-red-500">Counselor not found</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{counselor.name}</h1>

                {/* Profile Section */}
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-2xl">
                        {counselor.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">{counselor.name}</h2>
                        <p className="text-gray-500 flex gap-2">
                            {counselor.rating}
                            <Star fill="yellow" />
                        </p>
                    </div>
                </div>

                {/* About Section */}
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                    <p className="text-gray-600">{counselor.bio}</p>
                </div>

                {/* Contact Section */}
            </div>
        </div>
    );
};

export default CounselorDetailPage;