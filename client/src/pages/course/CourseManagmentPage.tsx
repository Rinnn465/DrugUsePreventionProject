import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    BookOpen,
    Search,
    ChevronDown,
    Clock,
    FileText,
    Video,
    Users
} from 'lucide-react';
import { SqlCourse, CourseFormData } from '../../types/Course';
import { sqlLesson } from '../../types/Lesson';
import AdminLayout from '../../components/AdminLayout';
import CourseEnrollmentsModal from '../../components/courses/CourseEnrollmentsModal';
import { toast } from 'react-toastify';


const CourseManagmentPage: React.FC = () => {
    const [courses, setCourses] = useState<SqlCourse[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<SqlCourse | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Lesson management states
    const [showLessonsModal, setShowLessonsModal] = useState(false);
    const [lessons, setLessons] = useState<sqlLesson[]>([]);
    const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
    const [showEditLessonModal, setShowEditLessonModal] = useState(false);
    const [showDeleteLessonModal, setShowDeleteLessonModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<sqlLesson | null>(null);
    const [lessonFormData, setLessonFormData] = useState({
        Title: '',
        BriefDescription: '',
        Content: '',
        Duration: null as number | null,
        VideoUrl: '',
        Status: 'active',
        IsDisabled: false
    });

    // Enrollments modal state
    const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);

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
                toast.error('Không thể tải danh sách khóa học');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            toast.error('Có lỗi xảy ra khi tải khóa học');
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
                toast.error('Không thể tải danh mục khóa học');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Có lỗi xảy ra khi tải danh mục');
        }
    };

    // Fetch lessons for a course
    const fetchLessons = async (courseId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lesson/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setLessons(result.data ?? []);
            } else {
                toast.error('Không thể tải danh sách bài học');
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
            toast.error('Có lỗi xảy ra khi tải bài học');
        }
    };

    // Create lesson
    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/lesson', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...lessonFormData,
                    CourseID: selectedCourse.CourseID
                })
            });

            if (response.ok) {
                closeCreateLessonModal();
                fetchLessons(selectedCourse.CourseID);
                toast.success('Tạo bài học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(`Có lỗi xảy ra khi tạo bài học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating lesson:', error);
            toast.error('Có lỗi xảy ra khi tạo bài học');
        }
    };

    // Update lesson
    const handleUpdateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLesson) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lesson/${selectedLesson.LessonID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lessonFormData)
            });

            if (response.ok) {
                closeEditLessonModal();
                if (selectedCourse) {
                    fetchLessons(selectedCourse.CourseID);
                }
                toast.success('Cập nhật bài học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(`Có lỗi xảy ra khi cập nhật bài học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating lesson:', error);
            toast.error('Có lỗi xảy ra khi cập nhật bài học');
        }
    };

    // Delete lesson
    const handleDeleteLesson = async () => {
        if (!selectedLesson) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/lesson/${selectedLesson.LessonID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setShowDeleteLessonModal(false);
                setSelectedLesson(null);
                if (selectedCourse) {
                    fetchLessons(selectedCourse.CourseID);
                }
                toast.success('Xóa bài học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(`Có lỗi xảy ra khi xóa bài học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            toast.error('Có lỗi xảy ra khi xóa bài học');
        }
    };

    // Reset lesson form
    const resetLessonForm = () => {
        setLessonFormData({
            Title: '',
            BriefDescription: '',
            Content: '',
            Duration: null,
            VideoUrl: '',
            Status: 'active',
            IsDisabled: false
        });
    };

    // Open lessons modal
    const openLessonsModal = (course: SqlCourse) => {
        setSelectedCourse(course);
        setShowLessonsModal(true);
        fetchLessons(course.CourseID);
    };

    // Open edit lesson modal
    const openEditLessonModal = (lesson: sqlLesson) => {
        setSelectedLesson(lesson);
        setLessonFormData({
            Title: lesson.Title,
            BriefDescription: lesson.BriefDescription || '',
            Content: lesson.Content || '',
            Duration: lesson.Duration ?? null,
            VideoUrl: lesson.VideoUrl || '',
            Status: lesson.Status || 'active',
            IsDisabled: lesson.IsDisabled || false
        });
        setShowEditLessonModal(true);
    };

    // Open create lesson modal
    const openCreateLessonModal = () => {
        resetLessonForm();
        setShowCreateLessonModal(true);
    };

    // Close edit lesson modal and reset form
    const closeEditLessonModal = () => {
        setShowEditLessonModal(false);
        setSelectedLesson(null);
        resetLessonForm();
    };

    // Close create lesson modal and reset form
    const closeCreateLessonModal = () => {
        setShowCreateLessonModal(false);
        resetLessonForm();
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
                toast.success('Thêm khoá học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(`Có lỗi xảy ra khi thêm khoá học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error('Có lỗi xảy ra khi thêm khoá học');
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
                toast.success('Cập nhật khóa học thành công!');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                toast.error(`Có lỗi xảy ra khi cập nhật khóa học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Có lỗi xảy ra khi cập nhật khóa học');
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
                toast.success('Xóa khóa học thành công');
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Delete failed:', response.status, errorData);
                toast.error(`Có lỗi xảy ra khi xóa khóa học: ${errorData.message ?? 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('Có lỗi xảy ra khi xóa khóa học');
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
        <AdminLayout>
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
                                <p className="text-gray-600 mt-1">Thêm, chỉnh sửa và xóa các khóa học phòng chống tệ nạn xã hội</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Thêm khóa học</span>
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
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowEnrollmentsModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                    title="Xem danh sách người tham gia"
                                                >
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openLessonsModal(course)}
                                                    className="text-green-600 hover:text-green-900 p-1 rounded"
                                                    title="Quản lý bài học"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
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
                                    : 'Bắt đầu bằng cách thêm khóa học đầu tiên.'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm khóa học mới
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
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm khóa học mới</h3>
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
                                        onChange={(e) => setFormData({ ...formData, CourseName: e.target.value })}
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
                                            onChange={(e) => setFormData({ ...formData, Risk: e.target.value })}
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
                                            onChange={(e) => setFormData({ ...formData, Duration: e.target.value ? parseInt(e.target.value) : null })}
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
                                        onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
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
                                        onChange={(e) => setFormData({ ...formData, ImageUrl: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
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
                                        Thêm khóa học
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
                                        onChange={(e) => setFormData({ ...formData, CourseName: e.target.value })}
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
                                            onChange={(e) => setFormData({ ...formData, Risk: e.target.value })}
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
                                            onChange={(e) => setFormData({ ...formData, Duration: e.target.value ? parseInt(e.target.value) : null })}
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
                                        onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
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
                                        onChange={(e) => setFormData({ ...formData, ImageUrl: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
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

            {/* Lessons Modal */}
            {showLessonsModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900">
                                Quản lý bài học - {selectedCourse.CourseName}
                            </h3>
                            <button
                                onClick={() => setShowLessonsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="sr-only">Đóng</span>✕
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Add lesson button */}
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-md font-medium text-gray-900">Danh sách bài học</h4>
                                <button
                                    onClick={openCreateLessonModal}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Thêm bài học</span>
                                </button>
                            </div>

                            {/* Lessons list */}
                            <div className="border rounded-lg overflow-hidden">
                                {lessons.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>Chưa có bài học nào</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời lượng</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Video</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {lessons.map((lesson) => (
                                                <tr key={lesson.LessonID} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{lesson.Title}</div>
                                                            <div className="text-sm text-gray-500">{lesson.BriefDescription}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {lesson.Duration ? `${lesson.Duration} phút` : 'Chưa xác định'}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {lesson.VideoUrl ? (
                                                            <div className="flex items-center text-green-600">
                                                                <Video className="h-4 w-4 mr-1" />
                                                                <span>Có video</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">Chưa có video</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            lesson.Status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {lesson.Status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => openEditLessonModal(lesson)}
                                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLesson(lesson);
                                                                    setShowDeleteLessonModal(true);
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Lesson Modal */}
            {showCreateLessonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Thêm bài học mới</h3>
                            <button
                                onClick={closeCreateLessonModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateLesson} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="create-lesson-title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
                                <input
                                    id="create-lesson-title"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.Title}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, Title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="create-lesson-description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                <input
                                    id="create-lesson-description"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.BriefDescription}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, BriefDescription: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="create-lesson-content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                <textarea
                                    id="create-lesson-content"
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.Content}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, Content: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="create-lesson-duration" className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
                                    <input
                                        id="create-lesson-duration"
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={lessonFormData.Duration || ''}
                                        onChange={(e) => setLessonFormData({ ...lessonFormData, Duration: e.target.value ? parseInt(e.target.value) : null })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="create-lesson-status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        id="create-lesson-status"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={lessonFormData.Status}
                                        onChange={(e) => setLessonFormData({ ...lessonFormData, Status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="create-lesson-video" className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
                                <input
                                    id="create-lesson-video"
                                    type="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.VideoUrl}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, VideoUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeCreateLessonModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Tạo bài học
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Lesson Modal */}
            {showEditLessonModal && selectedLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-medium text-gray-900">Chỉnh sửa bài học</h3>
                            <button
                                onClick={closeEditLessonModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateLesson} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="edit-lesson-title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học</label>
                                <input
                                    id="edit-lesson-title"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.Title}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, Title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="edit-lesson-description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                <input
                                    id="edit-lesson-description"
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.BriefDescription}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, BriefDescription: e.target.value })}
                                />
                            </div>

                            <div>
                                <label htmlFor="edit-lesson-content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                                <textarea
                                    id="edit-lesson-content"
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.Content}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, Content: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-lesson-duration" className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
                                    <input
                                        id="edit-lesson-duration"
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={lessonFormData.Duration || ''}
                                        onChange={(e) => setLessonFormData({ ...lessonFormData, Duration: e.target.value ? parseInt(e.target.value) : null })}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="edit-lesson-status" className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        id="edit-lesson-status"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={lessonFormData.Status}
                                        onChange={(e) => setLessonFormData({ ...lessonFormData, Status: e.target.value })}
                                    >
                                        <option value="active">Hoạt động</option>
                                        <option value="inactive">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="edit-lesson-video" className="block text-sm font-medium text-gray-700 mb-1">URL Video</label>
                                <input
                                    id="edit-lesson-video"
                                    type="url"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={lessonFormData.VideoUrl}
                                    onChange={(e) => setLessonFormData({ ...lessonFormData, VideoUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={closeEditLessonModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Lesson Modal */}
            {showDeleteLessonModal && selectedLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa bài học</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Bạn có chắc chắn muốn xóa bài học "{selectedLesson.Title}"? Hành động này không thể hoàn tác.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteLessonModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteLesson}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Enrollments Modal */}
            {showEnrollmentsModal && selectedCourse && (
                <CourseEnrollmentsModal
                    isOpen={showEnrollmentsModal}
                    onClose={() => setShowEnrollmentsModal(false)}
                    courseId={selectedCourse.CourseID}
                    courseName={selectedCourse.CourseName}
                />
            )}
        </AdminLayout>
    );
};

export default CourseManagmentPage;