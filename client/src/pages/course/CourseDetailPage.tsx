import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    BookOpen, 
    Clock, 
    Tag, 
    AlertTriangle,
    CheckCircle,
    PlayCircle
} from 'lucide-react';
import { SqlCourse } from '../../types/Course';

const CourseDetailPage: React.FC = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<SqlCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourseDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/course/${courseId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    setCourse(result.data);
                } else {
                    setError('Không thể tải thông tin khóa học');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải thông tin khóa học');
                console.error('Error fetching course detail:', err);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourseDetail();
        }
    }, [courseId]);

    // Get risk badge
    const getRiskBadge = (risk: string) => {
        const riskConfig = {
            'cao': { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cao', icon: AlertTriangle },
            'trung bình': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Trung bình', icon: AlertTriangle },
            'thấp': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Thấp', icon: CheckCircle },
        };
        const config = riskConfig[risk as keyof typeof riskConfig] ?? riskConfig['thấp'];
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                <IconComponent className="h-4 w-4 mr-1" />
                Mức độ rủi ro: {config.text}
            </span>
        );
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'active': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Hoạt động', icon: CheckCircle },
            'inactive': { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Không hoạt động', icon: AlertTriangle },
            'draft': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Bản nháp', icon: AlertTriangle },
        };
        const config = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.active;
        const IconComponent = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                <IconComponent className="h-4 w-4 mr-1" />
                {config.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin khóa học...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-red-500 mb-4">
                        <AlertTriangle className="h-12 w-12" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
                    <p className="text-gray-600 mb-4">{error ?? 'Không tìm thấy khóa học'}</p>
                    <Link 
                        to="/courses" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/courses" 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-600" />
                        </Link>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{course.CourseName}</h1>
                            <p className="text-gray-600 mt-1">Chi tiết khóa học</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Course Image */}
                        {course.ImageUrl && (
                            <div className="mb-8">
                                <img 
                                    src={course.ImageUrl} 
                                    alt={course.CourseName}
                                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                                />
                            </div>
                        )}

                        {/* Course Description */}
                        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mô tả khóa học</h2>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    {course.Description ?? 'Chưa có mô tả cho khóa học này.'}
                                </p>
                            </div>
                        </div>

                        {/* Course Categories */}
                        {course.Category && course.Category.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh mục</h2>
                                <div className="flex flex-wrap gap-2">
                                    {course.Category.map((category) => (
                                        <span 
                                            key={category.CategoryID}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                        >
                                            <Tag className="h-4 w-4 mr-1" />
                                            {category.CategoryName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Course Stats */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khóa học</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-sm text-gray-600">Thời lượng</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {course.Duration ? `${course.Duration} giờ` : 'Chưa xác định'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Course Status */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
                            <div className="space-y-3">
                                {getStatusBadge(course.Status ?? 'active')}
                                <br />
                                {getRiskBadge(course.Risk)}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Bắt đầu học
                                </button>
                                <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Xem chương trình học
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
