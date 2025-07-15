import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    BookOpen,
    Search,
    ChevronDown,
    Clock
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { SqlCourse } from '../../types/Course';
import { CourseFormData } from '../../types/Course';
import AdminLayout from '../../components/AdminLayout';


const CourseManagmentPage: React.FC = () => {
    const { userId } = useParams();
    const [courses, setCourses] = useState<SqlCourse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<SqlCourse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form data state
    const [formData, setFormData] = useState<CourseFormData>({
        CourseName: '',
        Risk: 'thấp',
        Duration: null,
        Description: '',
        ImageUrl: '',
        Status: 'active',
        IsDisabled: false,
        Categories: []
    });

    // Fetch courses
    const fetchCourses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/course', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setCourses(result.data ?? []);
            } else {
                console.error('Failed to fetch courses');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/course/category', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // Categories data stored but not displayed in current implementation
                console.log('Categories fetched:', result.data ?? []);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
        fetchCategories();
    }, []);

    // Create course
    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { Categories, ...formDataWithoutCategories } = formData;
            const createData = {
                ...formDataWithoutCategories,
                EnrollCount: 0 // Initialize enrollment count to 0 for new courses
            };
            
            console.log('Creating course with data:', createData);
            
            const response = await fetch('http://localhost:5000/api/course', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createData)
            });

            if (response.ok) {
                setShowCreateModal(false);
                resetForm();
                fetchCourses();
                alert('Tạo khóa học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                alert(`Có lỗi xảy ra khi tạo khóa học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating course:', error);
            alert('Có lỗi xảy ra khi tạo khóa học');
        }
    };

    // Update course
    const handleUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;

        try {
            const token = localStorage.getItem('token');
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { Categories, ...formDataWithoutCategories } = formData;
            const updateData = {
                ...formDataWithoutCategories,
                EnrollCount: selectedCourse.EnrollCount || 0 // Keep existing enrollment count
            };
            
            console.log('Updating course with data:', updateData);
            
            const response = await fetch(`http://localhost:5000/api/course/${selectedCourse.CourseID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setShowEditModal(false);
                setSelectedCourse(null);
                resetForm();
                fetchCourses();
                alert('Cập nhật khóa học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                alert(`Có lỗi xảy ra khi cập nhật khóa học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating course:', error);
            alert('Có lỗi xảy ra khi cập nhật khóa học');
        }
    };

    // Delete course
    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/course/${selectedCourse.CourseID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedCourse(null);
                fetchCourses();
                alert('Xóa khóa học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Delete failed:', response.status, errorData);
                alert(`Có lỗi xảy ra khi xóa khóa học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Có lỗi xảy ra khi xóa khóa học');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            CourseName: '',
            Risk: 'thấp',
            Duration: null,
            Description: '',
            ImageUrl: '',
            Status: 'active',
            IsDisabled: false,
            Categories: []
        });
    };

    // Open edit modal
    const openEditModal = (course: SqlCourse) => {
        setSelectedCourse(course);
        setFormData({
            CourseName: course.CourseName,
            Risk: course.Risk,
            Duration: course.Duration,
            Description: course.Description,
            ImageUrl: course.ImageUrl || '',
            Status: course.Status ?? 'active',
            IsDisabled: course.IsDisabled || false,
            Categories: course.Category ? course.Category.map(cat => cat.CategoryID) : []
        });
        setShowEditModal(true);
    };

    // Filter courses
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.CourseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            course.Description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || course.Status === statusFilter;
        const matchesRisk = riskFilter === 'all' || course.Risk === riskFilter;
        
        return matchesSearch && matchesStatus && matchesRisk;
    });

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            'active': { color: 'bg-green-100 text-green-800', text: 'Hoạt động' },
            'inactive': { color: 'bg-gray-100 text-gray-800', text: 'Không hoạt động' },
            'draft': { color: 'bg-yellow-100 text-yellow-800', text: 'Bản nháp' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    // Get risk badge
    const getRiskBadge = (risk: string) => {
        const riskConfig = {
            'cao': { color: 'bg-red-100 text-red-800', text: 'Cao' },
            'trung bình': { color: 'bg-yellow-100 text-yellow-800', text: 'Trung bình' },
            'thấp': { color: 'bg-green-100 text-green-800', text: 'Thấp' },
        };
        const config = riskConfig[risk as keyof typeof riskConfig] || riskConfig['thấp'];
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    };

    return (
        <AdminLayout title="Quản lý Khóa học" breadcrumb="Quản lý Khóa học">
            {/* Page Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Quản lý Khóa học</h1>
                                <p className="text-gray-600 mt-1">Tạo, chỉnh sửa và xóa các khóa học phòng chống tệ nạn xã hội</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Tạo khóa học</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm khóa học..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="draft">Bản nháp</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                        <div className="relative">
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                            >
                                <option value="all">Tất cả mức độ rủi ro</option>
                                <option value="cao">Cao</option>
                                <option value="trung bình">Trung bình</option>
                                <option value="thấp">Thấp</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khóa học</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức độ rủi ro</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời lượng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCourses.map((course) => (
                                    <tr key={course.CourseID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {course.ImageUrl ? (
                                                        <img 
                                                            className="h-10 w-10 rounded-lg object-cover" 
                                                            src={course.ImageUrl} 
                                                            alt={course.CourseName}
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <BookOpen className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {course.CourseName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                                        {course.Description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRiskBadge(course.Risk)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                                                {course.Duration ? `${course.Duration} giờ` : 'Chưa xác định'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(course.Status ?? 'active')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => openEditModal(course)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredCourses.length === 0 && (
                        <div className="text-center py-12">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có khóa học nào</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all' || riskFilter !== 'all' 
                                    ? 'Không tìm thấy khóa học phù hợp với bộ lọc.' 
                                    : 'Bắt đầu bằng cách tạo khóa học đầu tiên.'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tạo khóa học mới
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo khóa học mới</h3>
                            <form onSubmit={handleCreateCourse} className="space-y-4">
                                <div>
                                    <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên khóa học *
                                    </label>
                                    <input
                                        id="courseName"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.CourseName}
                                        onChange={(e) => setFormData({...formData, CourseName: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="risk" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mức độ rủi ro
                                        </label>
                                        <select
                                            id="risk"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formData.Risk}
                                            onChange={(e) => setFormData({...formData, Risk: e.target.value})}
                                        >
                                            <option value="thấp">Thấp</option>
                                            <option value="trung bình">Trung bình</option>
                                            <option value="cao">Cao</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                                            Thời lượng (giờ)
                                        </label>
                                        <input
                                            id="duration"
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formData.Duration ?? ''}
                                            onChange={(e) => setFormData({...formData, Duration: e.target.value ? parseInt(e.target.value) : null})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái
                                    </label>
                                    <select
                                        id="status"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Status}
                                        onChange={(e) => setFormData({...formData, Status: e.target.value})}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                        <option value="draft">Bản nháp</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        URL Hình ảnh
                                    </label>
                                    <input
                                        id="imageUrl"
                                        type="url"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.ImageUrl}
                                        onChange={(e) => setFormData({...formData, ImageUrl: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Description}
                                        onChange={(e) => setFormData({...formData, Description: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                    >
                                        Tạo khóa học
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedCourse && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa khóa học</h3>
                            <form onSubmit={handleUpdateCourse} className="space-y-4">
                                <div>
                                    <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên khóa học *
                                    </label>
                                    <input
                                        id="editCourseName"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.CourseName}
                                        onChange={(e) => setFormData({...formData, CourseName: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="editRisk" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mức độ rủi ro
                                        </label>
                                        <select
                                            id="editRisk"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formData.Risk}
                                            onChange={(e) => setFormData({...formData, Risk: e.target.value})}
                                        >
                                            <option value="thấp">Thấp</option>
                                            <option value="trung bình">Trung bình</option>
                                            <option value="cao">Cao</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="editDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                            Thời lượng (giờ)
                                        </label>
                                        <input
                                            id="editDuration"
                                            type="number"
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formData.Duration ?? ''}
                                            onChange={(e) => setFormData({...formData, Duration: e.target.value ? parseInt(e.target.value) : null})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái
                                    </label>
                                    <select
                                        id="editStatus"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Status}
                                        onChange={(e) => setFormData({...formData, Status: e.target.value})}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                        <option value="draft">Bản nháp</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="editImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        URL Hình ảnh
                                    </label>
                                    <input
                                        id="editImageUrl"
                                        type="url"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.ImageUrl}
                                        onChange={(e) => setFormData({...formData, ImageUrl: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="editDescription"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Description}
                                        onChange={(e) => setFormData({...formData, Description: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedCourse(null);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                    >
                                        Cập nhật
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCourse && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">Xóa khóa học</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Bạn có chắc chắn muốn xóa khóa học "{selectedCourse.CourseName}"? 
                                    Hành động này không thể hoàn tác.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-3 px-7 py-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedCourse(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteCourse}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default CourseManagmentPage;