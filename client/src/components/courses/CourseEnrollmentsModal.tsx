import React, { useState, useEffect } from 'react';
import { X, Users, Calendar, User, Mail, Phone, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface EnrollmentUser {
    Username: string;
    Email: string;
    FullName: string;
    DateOfBirth: string;
    AccountCreatedAt: string;
    ProfilePicture: string | null;
    RoleName: string;
}

interface Enrollment {
    EnrollmentID: number;
    CourseID: number;
    AccountID: number;
    EnrollmentDate: string;
    CompletedDate: string | null;
    Status: string;
    User: EnrollmentUser;
}

interface CourseEnrollmentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    courseName: string;
}

const CourseEnrollmentsModal: React.FC<CourseEnrollmentsModalProps> = ({
    isOpen,
    onClose,
    courseId,
    courseName
}) => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (isOpen && courseId) {
            fetchEnrollments();
        }
    }, [isOpen, courseId]);

    const fetchEnrollments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/course/${courseId}/enrollments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setEnrollments(result.data || []);
            } else {
                toast.error('Không thể tải danh sách người tham gia');
            }
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách người tham gia');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Chưa xác định';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'enrolled': { color: 'bg-blue-100 text-blue-800', text: 'Đã đăng ký', icon: Clock },
            'completed': { color: 'bg-green-100 text-green-800', text: 'Đã hoàn thành', icon: CheckCircle },
            'in_progress': { color: 'bg-yellow-100 text-yellow-800', text: 'Đang học', icon: AlertCircle },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['enrolled'];
        const IconComponent = config.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <IconComponent className="h-3 w-3 mr-1" />
                {config.text}
            </span>
        );
    };

    const getRoleBadge = (roleName: string) => {
        const roleConfig = {
            'Admin': { color: 'bg-red-100 text-red-800', text: 'Admin' },
            'Manager': { color: 'bg-purple-100 text-purple-800', text: 'Manager' },
            'Staff': { color: 'bg-blue-100 text-blue-800', text: 'Staff' },
            'Consultant': { color: 'bg-indigo-100 text-indigo-800', text: 'Consultant' },
            'Member': { color: 'bg-green-100 text-green-800', text: 'Member' },
        };
        const config = roleConfig[roleName as keyof typeof roleConfig] || roleConfig['Member'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const filteredEnrollments = enrollments.filter(enrollment => {
        const matchesSearch = 
            enrollment.User.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.User.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enrollment.User.Username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || enrollment.Status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Danh sách người tham gia
                            </h3>
                            <p className="text-sm text-gray-500">{courseName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo tên, email..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="sm:w-48">
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="enrolled">Đã đăng ký</option>
                                <option value="in_progress">Đang học</option>
                                <option value="completed">Đã hoàn thành</option>
                            </select>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Users className="h-8 w-8 text-blue-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-600">Tổng số</p>
                                    <p className="text-2xl font-bold text-blue-900">{enrollments.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-600">Đã hoàn thành</p>
                                    <p className="text-2xl font-bold text-green-900">
                                        {enrollments.filter(e => e.Status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <AlertCircle className="h-8 w-8 text-yellow-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-yellow-600">Đang học</p>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {enrollments.filter(e => e.Status === 'in_progress').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Clock className="h-8 w-8 text-gray-600" />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-600">Đã đăng ký</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {enrollments.filter(e => e.Status === 'enrolled').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enrollments List */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Đang tải danh sách...</p>
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có người tham gia</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Không tìm thấy người tham gia phù hợp với bộ lọc.'
                                    : 'Chưa có ai đăng ký khóa học này.'}
                            </p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người tham gia
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vai trò
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày đăng ký
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày hoàn thành
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEnrollments.map((enrollment) => (
                                        <tr key={enrollment.EnrollmentID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {enrollment.User.ProfilePicture ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={enrollment.User.ProfilePicture}
                                                                alt={enrollment.User.FullName}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {enrollment.User.FullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            {enrollment.User.Email}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            @{enrollment.User.Username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getRoleBadge(enrollment.User.RoleName)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(enrollment.EnrollmentDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {enrollment.CompletedDate ? formatDate(enrollment.CompletedDate) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(enrollment.Status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseEnrollmentsModal; 