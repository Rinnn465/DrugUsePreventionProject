import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Calendar,
    Search,
    ChevronDown,
    Users,
    RefreshCw,
    FileText
} from 'lucide-react';
import { CommunityProgram } from '../../types/CommunityProgram';
import { toast } from 'react-toastify';
import SurveyResponseModal from '../../components/modal/SurveyResponseModal';
import AdminLayout from '../../components/AdminLayout';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Pagination from '@/components/pagination/Pagination';
import { usePagination } from '@/hooks/usePagination';

const ProgramManagementPage: React.FC = () => {
    const [programs, setPrograms] = useState<CommunityProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [showSurveyModal, setShowSurveyModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<CommunityProgram | null>(null);
    const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [sendingInvite, setSendingInvite] = useState(false);
    const [regeneratingZoom, setRegeneratingZoom] = useState(false);

    // Helper function to format status text
    const formatStatus = (status: string): string => {
        const statusMap: { [key: string]: string } = {
            'registered': 'Đã đăng ký'
        };
        return statusMap[status?.toLowerCase()] || 'Đã đăng ký';
    };

    // Form data state
    const [formData, setFormData] = useState({
        ProgramName: '',
        Type: 'online',
        date: '',
        Description: '',
        Content: '',
        Organizer: '',
        ImageUrl: '',
        Status: 'upcoming',
        IsDisabled: false
    });
    const formik = useFormik({
        initialValues: formData,
        validationSchema: Yup.object({
            ProgramName: Yup.string()
                .required('Tên chương trình là bắt buộc')
                .matches(/^[a-zA-Z0-9\sÀ-ỹ]+$/, 'Tên chương trình không được chứa ký tự đặc biệt'),
            date: Yup.date()
                .required('Ngày diễn ra là bắt buộc').min(new Date(), 'Ngày không được trong quá khứ'),
            Description:
                Yup.string(),
            Content:
                Yup.string()
                    .required('Nội dung là bắt buộc')
                    .matches(/^[a-zA-Z0-9\sÀ-ỹ]+$/, 'Nội dung chương trình không được chứa ký tự đặc biệt'),
            Organizer:
                Yup.string().required('Người tổ chức là bắt buộc'),
            ImageUrl: Yup.string(),
        }),
        onSubmit: (values) => {
            console.log(values);
            handleCreateProgram();
        }
    })

    // Fetch programs
    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('🚀 Fetching programs with token:', token ? 'Has token' : 'No token');
            console.log('👤 User info:', user);

            if (token) {
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    try {
                        const payload = JSON.parse(atob(tokenParts[1]));
                        console.log('🎫 Token payload:', payload);
                    } catch (e) {
                        console.log('⚠️ Could not decode token');
                    }
                }
            }

            const response = await fetch('http://localhost:5000/api/program', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Programs loaded successfully:', result);
                setPrograms(result.data ?? []);
            } else {
                const errorText = await response.text();
                console.error('❌ Failed to fetch programs:', response.status, errorText);
                toast.error(`Không thể tải danh sách chương trình (Status: ${response.status})`);
            }
        } catch (error) {
            console.error('💥 Network error fetching programs:', error);
            toast.error('Có lỗi xảy ra khi tải chương trình - Kiểm tra server');
        } finally {
            setLoading(false);
        }
    };

    // Fetch attendees for a program
    const fetchAttendees = async (programId: number) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program-attendee/program/${programId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setAttendees(result);
            } else {
                toast.error('Không thể tải danh sách người tham gia');
            }
        } catch (error) {
            console.error('Error fetching attendees:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách người tham gia');
        }
    };

    // Send Zoom invite to all attendees
    const sendZoomInvite = async (program: CommunityProgram) => {
        // Validation: Không cho phép gửi lời mời khi chương trình đã kết thúc
        if (program.Status === 'completed') {
            toast.error('Không thể gửi lời mời cho chương trình đã kết thúc.');
            return;
        }

        try {
            setSendingInvite(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program-attendee/send-invite/${program.ProgramID}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                const { summary } = result;
                if (summary.failed > 0) {
                    toast.success(`Đã gửi lời mời cho ${summary.success}/${summary.total} người tham gia. ${summary.failed} email gửi thất bại.`, {
                        autoClose: 5000
                    });
                } else {
                    toast.success(`Gửi lời mời thành công cho tất cả ${summary.success} người tham gia!`);
                }

                // Refresh attendees list
                if (selectedProgram) {
                    fetchAttendees(selectedProgram.ProgramID);
                }
            } else {
                toast.error(result.message || 'Không thể gửi lời mời Zoom');
            }
        } catch (error) {
            console.error('Error sending Zoom invite:', error);
            toast.error('Có lỗi xảy ra khi gửi lời mời Zoom');
        } finally {
            setSendingInvite(false);
        }
    };
    // Regenerate Zoom link for a program
    const regenerateZoomLink = async (program: CommunityProgram) => {
        try {
            setRegeneratingZoom(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program/${program.ProgramID}/regenerate-zoom`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                toast.success('Tạo link Zoom mới thành công!');

                // Refresh programs list to get updated Zoom info
                fetchPrograms();

                // Fetch fresh program data and update selectedProgram
                const freshResponse = await fetch(`http://localhost:5000/api/program/${program.ProgramID}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (freshResponse.ok) {
                    const freshResult = await freshResponse.json();
                    setSelectedProgram(freshResult.data);
                }
            } else {
                toast.error(result.message || 'Không thể tạo link Zoom mới');
            }
        } catch (error) {
            console.error('Error regenerating Zoom link:', error);
            toast.error('Có lỗi xảy ra khi tạo link Zoom mới');
        } finally {
            setRegeneratingZoom(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    // Validate date is not in the past
    const validateDate = (dateString: string): boolean => {
        if (!dateString) return false;

        // Date picker returns YYYY-MM-DD format
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);
        console.log(selectedDate, today);
        return selectedDate >= today;
    };

    // Create program
    const handleCreateProgram = async () => {

        // Validate date
        if (!validateDate(formik.values.date)) {

            toast.error('Không thể thêm chương trình với ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi.');
            return;
        }

        try {
            // Form data already in YYYY-MM-DD format from date picker
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/program', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formik.values)
            });

            if (response.ok) {
                setShowCreateModal(false);
                resetForm();
                fetchPrograms();
                toast.success('Thêm chương trình thành công!');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Có lỗi xảy ra khi thêm chương trình');
            }
        } catch (error) {
            console.error('Error creating program:', error);
            toast.error('Có lỗi xảy ra khi thêm chương trình');
        }
    };

    // Update program
    const handleUpdateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgram) return;

        // Validate date
        if (!validateDate(formik.values.date)) {
            toast.error('Không thể cập nhật chương trình với ngày trong quá khứ. Vui lòng chọn ngày từ hôm nay trở đi.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program/${selectedProgram.ProgramID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formik.values)
            });

            if (response.ok) {
                setShowEditModal(false);
                setSelectedProgram(null);
                resetForm();
                fetchPrograms();
                toast.success('Cập nhật chương trình thành công!');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Có lỗi xảy ra khi cập nhật chương trình');
            }
        } catch (error) {
            console.error('Error updating program:', error);
            toast.error('Có lỗi xảy ra khi cập nhật chương trình');
        }
    };

    // Delete program
    const handleDeleteProgram = async () => {
        if (!selectedProgram) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program/${selectedProgram.ProgramID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setShowDeleteModal(false);
                setSelectedProgram(null);
                fetchPrograms();
                toast.success('Xóa chương trình thành công!');
            } else {
                toast.error(`Có lỗi xảy ra khi xóa chương trình`);
            }
        } catch (error) {
            console.error('Error deleting program:', error);
            toast.error('Có lỗi xảy ra khi xóa chương trình');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            ProgramName: '',
            Type: 'online',
            date: '',
            Description: '',
            Content: '',
            Organizer: '',
            ImageUrl: '',
            Status: 'upcoming',
            IsDisabled: false
        });
    };

    // Open edit modal
    const openEditModal = async (program: CommunityProgram) => {
        try {
            // Fetch fresh program data to get latest ZoomLink
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program/${program.ProgramID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                const freshProgram = result.data;

                setSelectedProgram(freshProgram);

                // Format date for input type="date" (YYYY-MM-DD format)
                const programDate = new Date(freshProgram.Date);
                const formattedDate = programDate.toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh'
                }); // en-CA gives YYYY-MM-DD format

                setFormData({
                    ProgramName: freshProgram.ProgramName,
                    Type: freshProgram.Type ?? 'online',
                    date: formattedDate,
                    Description: freshProgram.Description ?? '',
                    Content: freshProgram.Content ?? '',
                    Organizer: freshProgram.Organizer ?? '',
                    ImageUrl: freshProgram.ImageUrl ?? '',
                    Status: freshProgram.Status,
                    IsDisabled: freshProgram.IsDisabled
                });
            } else {
                // Fallback to original program data if fetch fails
                setSelectedProgram(program);
                const programDate = new Date(program.Date);
                const formattedDate = programDate.toLocaleDateString('en-CA', {
                    timeZone: 'Asia/Ho_Chi_Minh'
                });

                setFormData({
                    ProgramName: program.ProgramName,
                    Type: program.Type ?? 'online',
                    date: formattedDate,
                    Description: program.Description ?? '',
                    Content: program.Content ?? '',
                    Organizer: program.Organizer ?? '',
                    ImageUrl: program.ImageUrl ?? '',
                    Status: program.Status,
                    IsDisabled: program.IsDisabled
                });
            }
        } catch (error) {
            console.error('Error fetching fresh program data:', error);
            // Fallback to original program data
            setSelectedProgram(program);
            const programDate = new Date(program.Date);
            const formattedDate = programDate.toLocaleDateString('en-CA', {
                timeZone: 'Asia/Ho_Chi_Minh'
            });

            setFormData({
                ProgramName: program.ProgramName,
                Type: program.Type ?? 'online',
                date: formattedDate,
                Description: program.Description ?? '',
                Content: program.Content ?? '',
                Organizer: program.Organizer ?? '',
                ImageUrl: program.ImageUrl ?? '',
                Status: program.Status,
                IsDisabled: program.IsDisabled
            });
        }

        setShowEditModal(true);
    };

    // Open attendees modal
    const openAttendeesModal = (program: CommunityProgram) => {
        setSelectedProgram(program);
        fetchAttendees(program.ProgramID);
        setShowAttendeesModal(true);
    };

    const filteredPrograms = programs.filter(program => {
        const matchesSearch = program.ProgramName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            program.Description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || program.Status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const {
        currentPage,
        totalPages,
        currentItems: currentPrograms,
        setCurrentPage,
        totalItems
    } = usePagination({
        data: filteredPrograms,
        itemsPerPage: 5,
        resetTriggers: [searchTerm, statusFilter] // Reset to page 1 when these change
    });




    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // Format theo múi giờ Việt Nam với định dạng dd/mm/yyyy
        return date.toLocaleDateString('en-GB', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get type display text
    const getTypeDisplayText = (type: string) => {
        switch (type) {
            case 'online': return 'Trực tuyến';
            case 'offline': return 'Trực tiếp';
            case 'hybrid': return 'Kết hợp';
            default: return type;
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusMap = {
            'upcoming': { text: 'Sắp diễn ra', color: 'bg-blue-100 text-blue-800' },
            'ongoing': { text: 'Đang diễn ra', color: 'bg-green-100 text-green-800' },
            'completed': { text: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' }
        };
        const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, color: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Quản lý Chương trình Cộng đồng</h1>
                                <p className="text-gray-600 mt-1">Thêm, chỉnh sửa và xóa các chương trình phòng chống tệ nạn xã hội</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Thêm chương trình</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm chương trình..."
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
                                <option value="upcoming">Sắp diễn ra</option>
                                <option value="ongoing">Đang diễn ra</option>
                                <option value="completed">Đã kết thúc</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        </div>
                    </div>
                </div>

                {/* Programs List */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chương trình</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày diễn ra</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tổ chức</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zoom Link</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentPrograms.map((program) => (
                                    <tr key={program.ProgramID} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                        <Calendar className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {program.ProgramName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {program.Description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {getTypeDisplayText(program.Type ?? 'online')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(program.Date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(program.Status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {program.Organizer ?? 'Không rõ'}
                                        </td>                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            {program.ZoomLink ? (
                                                <a href={program.ZoomLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    Zoom Link
                                                </a>
                                            ) : (
                                                <span className="text-gray-400">Chưa có link</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => openAttendeesModal(program)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                >
                                                    <Users className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(program)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProgram(program);
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

                    {filteredPrograms.length === 0 && (
                        <div className="text-center py-12">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có chương trình nào</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Không tìm thấy chương trình phù hợp với bộ lọc.'
                                    : 'Bắt đầu bằng cách thêm chương trình đầu tiên.'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm chương trình mới
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={5}
                        onPageChange={setCurrentPage}
                        itemName="chương trình"
                        showInfo={true}
                    />
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm chương trình mới</h3>
                            <form onSubmit={formik.handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="programName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên chương trình *
                                    </label>
                                    <input
                                        id="programName"
                                        name="ProgramName"
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.ProgramName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.ProgramName && formik.errors.ProgramName && (
                                        <div className="text-red-600 text-sm mt-1">{formik.errors.ProgramName}</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Loại chương trình
                                        </label>
                                        <input
                                            id="type"
                                            type="text"
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                            value="Trực tuyến"
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái
                                        </label>
                                        <input
                                            id="status"
                                            type="text"
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                            value="Sắp diễn ra"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Ngày diễn ra *
                                    </label>
                                    <input
                                        id="date"
                                        type="date"
                                        name="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.date}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.date && formik.errors.date && (
                                        <div className="text-red-600 text-sm mt-1">{formik.errors.date}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Người tổ chức
                                    </label>
                                    <input
                                        id="organizer"
                                        name='Organizer'
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.Organizer}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.Organizer && formik.errors.Organizer && (
                                        <div className="text-red-600 text-sm mt-1">{formik.errors.Organizer}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        URL Hình ảnh
                                    </label>
                                    <input
                                        id="imageUrl"
                                        name="ImageUrl"
                                        type="url"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.ImageUrl}
                                        onChange={formik.handleChange}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        id="description"
                                        name='Description'
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.Description}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.Description && formik.errors.Description && (
                                        <div className="text-red-600 text-sm mt-1">{formik.errors.Description}</div>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nội dung chi tiết
                                    </label>
                                    <textarea
                                        id="content"
                                        name="Content"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.Content}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.Content && formik.errors.Content && (
                                        <div className="text-red-600 text-sm mt-1">{formik.errors.Content}</div>
                                    )}
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
                                        Thêm chương trình
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedProgram && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa chương trình</h3>
                            <form onSubmit={handleUpdateProgram} className="space-y-4">
                                <div>
                                    <label htmlFor="editProgramName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên chương trình *
                                    </label>
                                    <input
                                        id="editProgramName"
                                        name="ProgramName"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formik.values.ProgramName}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    <div className="text-red-600 text-sm mt-1">
                                        {formik.touched.ProgramName && formik.errors.ProgramName}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="editType" className="block text-sm font-medium text-gray-700 mb-1">
                                                Loại chương trình
                                            </label>
                                            <input
                                                id="editType"
                                                type="text"
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                                value="Trực tuyến"
                                                readOnly
                                            />
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
                                                <option value="upcoming">Sắp diễn ra</option>
                                                <option value="ongoing">Đang diễn ra</option>
                                                <option value="completed">Đã kết thúc</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày diễn ra *
                                        </label>
                                        <input
                                            id="editDate"
                                            name='date'
                                            type="date"
                                            required
                                            min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formik.values.date}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <div className="text-red-600 text-sm mt-1">
                                            {formik.touched.date && formik.errors.date}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="editOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                                            Người tổ chức
                                        </label>
                                        <input
                                            id="editOrganizer"
                                            name='Organizer'
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formik.values.Organizer}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <div className="text-red-600 text-sm mt-1">
                                            {formik.touched.Organizer && formik.errors.Organizer}
                                        </div>
                                    </div>

                                    {/* Zoom Link Section */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-blue-800">
                                                Liên kết Zoom Meeting
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => selectedProgram && regenerateZoomLink(selectedProgram)}
                                                disabled={regeneratingZoom}
                                                className={`px-3 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${regeneratingZoom
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                    }`}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <RefreshCw className={`h-3 w-3 ${regeneratingZoom ? 'animate-spin' : ''}`} />
                                                    <span>{regeneratingZoom ? 'Đang tạo...' : 'Tạo link mới'}</span>
                                                </div>
                                            </button>
                                        </div>

                                        <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                            <p className="font-medium">  ID Phòng: {selectedProgram?.MeetingRoomName || 'Chưa có'}</p>
                                            <p className="mt-1 break-all">
                                                Link: {selectedProgram?.ZoomLink ? (
                                                    <a
                                                        href={selectedProgram.ZoomLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {selectedProgram.ZoomLink}
                                                    </a>
                                                ) : 'Chưa có'}
                                            </p>
                                        </div>

                                        <p className="text-xs text-blue-600 mt-2">
                                            Nhấn "Tạo link mới" để tạo một meeting Zoom hoàn toàn mới cho chương trình này
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="editImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                            URL Hình ảnh
                                        </label>
                                        <input
                                            id="editImageUrl"
                                            name='ImageUrl'
                                            type="url"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formik.values.ImageUrl}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                            Mô tả
                                        </label>
                                        <textarea
                                            id="editDescription"
                                            name='Description'
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formik.values.Description}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nội dung chi tiết
                                        </label>
                                        <textarea
                                            id="editContent"
                                            name='Content'
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            value={formik.values.Content}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setSelectedProgram(null);
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
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedProgram && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">Xóa chương trình</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    Bạn có chắc chắn muốn xóa chương trình "{selectedProgram.ProgramName}"?
                                    Hành động này không thể hoàn tác.
                                </p>
                            </div>
                            <div className="flex justify-center space-x-3 px-7 py-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedProgram(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md hover:bg-gray-400"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeleteProgram}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendees Modal */}
            {showAttendeesModal && selectedProgram && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-4/5 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Danh sách người tham gia: {selectedProgram.ProgramName}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ Tên</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khảo sát</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendees.map((attendee) => (
                                            <tr key={`${attendee.ProgramID}-${attendee.AccountID}`}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.FullName}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.Username}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {attendee.Email ? (
                                                        <span className="text-green-600">{attendee.Email}</span>
                                                    ) : (
                                                        <span className="text-red-500">Chưa có email</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(attendee.RegistrationDate)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${attendee.Status === 'registered'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {formatStatus(attendee.Status)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex space-x-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${attendee.HasBeforeSurvey
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            Trước: {attendee.HasBeforeSurvey ? '✓' : '✗'}
                                                        </span>
                                                        <span className={`px-2 py-1 text-xs rounded-full ${attendee.HasAfterSurvey
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            Sau: {attendee.HasAfterSurvey ? '✓' : '✗'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex space-x-2">
                                                        {(attendee.HasBeforeSurvey || attendee.HasAfterSurvey) ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAttendee(attendee);
                                                                    setShowSurveyModal(true);
                                                                }}
                                                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                                                            >
                                                                <FileText className="w-3 h-3 mr-1" />
                                                                Xem phản hồi
                                                            </button>
                                                        ) : (
                                                            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                                                Chưa có dữ liệu khảo sát
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowAttendeesModal(false);
                                        setSelectedProgram(null);
                                        setAttendees([]);
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Đóng
                                </button>
                                <button
                                    onClick={() => sendZoomInvite(selectedProgram)}
                                    disabled={sendingInvite || selectedProgram?.Status === 'completed'}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${sendingInvite || selectedProgram?.Status === 'completed'
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    title={selectedProgram?.Status === 'completed' ? 'Không thể gửi lời mời cho chương trình đã kết thúc' : ''}
                                >
                                    {sendingInvite ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang gửi...
                                        </div>
                                    ) : selectedProgram?.Status === 'completed' ? (
                                        'Chương trình đã kết thúc'
                                    ) : (
                                        'Gửi lời mời Zoom'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Survey Response Modal */}
            {showSurveyModal && selectedAttendee && selectedProgram && (
                <SurveyResponseModal
                    isOpen={showSurveyModal}
                    onClose={() => {
                        setShowSurveyModal(false);
                        setSelectedAttendee(null);
                    }}
                    programId={selectedProgram.ProgramID}
                    accountId={selectedAttendee.AccountID}
                    attendeeName={selectedAttendee.FullName}
                />
            )}
        </AdminLayout>
    );
};

export default ProgramManagementPage;