import { useParams, Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Specialty, Qualification } from "@/types/Consultant";

interface ConsultantData {
    consultant: {
        AccountID: number;
        Name: string;
        Bio: string;
        Title: string;
        ImageUrl: string;
        IsDisabled: boolean;
        Rating: number;
    }[];
    specialties: Specialty[];
    qualifications: Qualification[];
}

const ConsultantDetailsPage: React.FC = () => {
    const { consultantId } = useParams();
    const [consultantData, setConsultantData] = useState<ConsultantData | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Fetching consultant with ID:', consultantId);

                // Fetch consultant data
                const consultantResponse = await fetch(`http://localhost:5000/api/consultant/${consultantId}`);
                console.log('Consultant response status:', consultantResponse.status);

                if (!consultantResponse.ok) {
                    throw new Error(`Failed to fetch consultant: ${consultantResponse.status}`);
                }

                const consultantData = await consultantResponse.json();
                console.log('Consultant Data:', consultantData);
                setConsultantData(consultantData.data);

                // Fetch rating
                const ratingResponse = await fetch(`http://localhost:5000/api/consultant/average-all-rating/${consultantId}`);
                console.log('Rating response status:', ratingResponse.status);

                if (ratingResponse.ok) {
                    const ratingData = await ratingResponse.json();
                    console.log('Rating Data:', ratingData);
                    setRating(ratingData.data?.avarageRating || 0);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (consultantId) {
            fetchData();
        }
    }, [consultantId]);

    // Add loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                            <div>
                                <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Add error state
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Lỗi</h2>
                    <p className="text-red-600">{error}</p>
                    <p className="text-sm text-gray-600 mt-2">Chuyên viên ID: {consultantId}</p>
                </div>
            </div>
        );
    }

    // Add fallback for no data
    if (!consultantData) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-yellow-800 mb-2">Không tìm thấy chuyên viên</h2>
                    <p className="text-yellow-600">Không thể tải dữ liệu chuyên viên.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Top Section with Profile */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-50 px-8 py-8">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                {consultantData?.consultant[0]?.ImageUrl ? (
                                    <img
                                        src={consultantData.consultant[0].ImageUrl}
                                        alt={consultantData.consultant[0].Name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.log('Image failed to load:', consultantData.consultant[0].ImageUrl);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-400 flex items-center justify-center text-white text-6xl font-bold">
                                        {consultantData?.consultant[0]?.Name?.charAt(0) || 'C'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {consultantData?.consultant[0]?.Name || 'No Name Available'}
                            </h1>
                            <p className="text-xl text-blue-600 font-medium mb-4">
                                ({consultantData?.consultant[0]?.Title || 'Medical Director'})
                            </p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Experience Section */}
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-700 mb-4">{consultantData?.consultant[0]?.Title}</h2>
                                    <p className="text-lg font-semibold text-gray-700 mb-4">Chuyên viên được cấp chứng chỉ: </p>

                                    {/* Qualifications */}
                                    {consultantData?.qualifications && consultantData.qualifications.length > 0 && (
                                        <ul className="space-y-2 text-gray-600">
                                            {consultantData.qualifications.map((qualification, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-600 mr-2">•</span>
                                                    {qualification.Name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Bio Section */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-blue-200 pb-2">Thông tin chuyên viên</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {consultantData?.consultant[0]?.Bio || 'No biography available'}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-blue-700 mb-4">Lĩnh vực chuyên môn</h3>
                                    {consultantData?.specialties && consultantData.specialties.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {consultantData.specialties.map((specialty, index) => (
                                                <div key={index} className="flex items-center text-sm text-gray-600">
                                                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                                    {specialty.Name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Rating */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-600">Đánh giá:</span>
                                        <div className="flex items-center">
                                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                            <span className="ml-1 font-semibold">
                                                {rating > 0 ? rating.toFixed(1) : 'Chưa có'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Book Consultation Button */}
                                <div className="bg-blue-100 rounded-lg p-6">
                                    <h4 className="text-lg font-bold text-blue-800 mb-4 text-center">Đặt lịch</h4>

                                    {/* Calendar placeholder */}
                                    <div className="bg-white rounded-lg p-4 mb-4">
                                        <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                                            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                                                <div key={day} className="p-1 font-medium text-gray-500">{day}</div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-xs">
                                            {Array.from({ length: 35 }, (_, i) => {
                                                const day = i - 7 + 1;
                                                const isCurrentMonth = day > 0 && day <= 31;

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`p-1 text-center rounded ${!isCurrentMonth
                                                            ? 'text-gray-300'
                                                            : 'text-gray-700'
                                                            }`}
                                                    >
                                                        {isCurrentMonth ? day : ''}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-3">
                                        <Link
                                            state={{ consultantId: consultantData?.consultant[0]?.AccountID }}
                                            to={`/appointments/`}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold text-center hover:bg-blue-700 transition-colors block"
                                        >
                                            ĐẶT LỊCH TƯ VẪN NGAY
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultantDetailsPage;