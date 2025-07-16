import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Calendar,
    Search,
    ChevronDown,
    ArrowLeft,
    Users
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CommunityProgram } from '../../types/CommunityProgram';
import { toast } from 'react-toastify';

const ProgramManagementPage: React.FC = () => {
    const { userId } = useParams();
    const [programs, setPrograms] = useState<CommunityProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAttendeesModal, setShowAttendeesModal] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState<CommunityProgram | null>(null);
    const [attendees, setAttendees] = useState<any[]>([]);

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

    // Fetch programs
    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/program', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                setPrograms(result.data ?? []);
            } else {
                toast.error('Không thể tải danh sách chương trình');
            }
        } catch (error) {
            console.error('Error fetching programs:', error);
            toast.error('Có lỗi xảy ra khi tải chương trình');
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
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program-attendee/send-invite/${program.ProgramID}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('Gửi lời mời Zoom thành công!');
            } else {
                toast.error('Không thể gửi lời mời Zoom');
            }
        } catch (error) {
            console.error('Error sending Zoom invite:', error);
            toast.error('Có lỗi xảy ra khi gửi lời mời Zoom');
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, []);

    // Create program
    const handleCreateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/program', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowCreateModal(false);
                resetForm();
                fetchPrograms();
                toast.success('Tạo chương trình thành công!');
            } else {
                toast.error('Có lỗi xảy ra khi tạo chương trình');
            }
        } catch (error) {
            console.error('Error creating program:', error);
            toast.error('Có lỗi xảy ra khi tạo chương trình');
        }
    };

    // Update program
    const handleUpdateProgram = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgram) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/program/${selectedProgram.ProgramID}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setShowEditModal(false);
                setSelectedProgram(null);
                resetForm();
                fetchPrograms();
                toast.success('Cập nhật chương trình thành công!');
            } else {
                toast.error('Có lỗi xảy ra khi cập nhật chương trình');
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
    const openEditModal = (program: CommunityProgram) => {
        setSelectedProgram(program);
        // Format date for input type="date" (YYYY-MM-DD format)
        const programDate = new Date(program.Date);
        const formattedDate = programDate.toLocaleDateString('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh'
        }); // en-CA gives YYYY-MM-DD format
        
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
        setShowEditModal(true);
    };

    // Open attendees modal
    const openAttendeesModal = (program: CommunityProgram) => {
        setSelectedProgram(program);
        fetchAttendees(program.ProgramID);
        setShowAttendeesModal(true);
    };

    // Filter programs
    const filteredPrograms = programs.filter(program => {
        const matchesSearch = program.ProgramName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            program.Description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || program.Status === statusFilter;
        
        return matchesSearch && matchesStatus;
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
            'completed': { text: 'Đã hoàn thành', color: 'bg-gray-100 text-gray-800' }
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link 
                                to="/admin"
                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <ArrowLeft className="h-8 w-8 text-gray-600" />
                            </Link>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Calendar className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Quản lý Chương trình Cộng đồng</h1>
                                <p className="text-gray-600 mt-1">Tạo, chỉnh sửa và xóa các chương trình phòng chống tệ nạn xã hội</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Tạo chương trình</span>
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
                                <option value="completed">Đã hoàn thành</option>
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
                                {filteredPrograms.map((program) => (
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
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                                            <a href={program.Url} target="_blank" rel="noopener noreferrer">
                                                Zoom Link
                                            </a>
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
                                    : 'Bắt đầu bằng cách tạo chương trình đầu tiên.'}
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tạo chương trình mới
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
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo chương trình mới</h3>
                            <form onSubmit={handleCreateProgram} className="space-y-4">
                                <div>
                                    <label htmlFor="programName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên chương trình *
                                    </label>
                                    <input
                                        id="programName"
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.ProgramName}
                                        onChange={(e) => setFormData({...formData, ProgramName: e.target.value})}
                                    />
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
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Người tổ chức
                                    </label>
                                    <input
                                        id="organizer"
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Organizer}
                                        onChange={(e) => setFormData({...formData, Organizer: e.target.value})}
                                    />
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

                                <div>
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nội dung chi tiết
                                    </label>
                                    <textarea
                                        id="content"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Content}
                                        onChange={(e) => setFormData({...formData, Content: e.target.value})}
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
                                        Tạo chương trình
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
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.ProgramName}
                                        onChange={(e) => setFormData({...formData, ProgramName: e.target.value})}
                                    />
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
                                            onChange={(e) => setFormData({...formData, Status: e.target.value})}
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
                                        type="date"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="editOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Người tổ chức
                                    </label>
                                    <input
                                        id="editOrganizer"
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Organizer}
                                        onChange={(e) => setFormData({...formData, Organizer: e.target.value})}
                                    />
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

                                <div>
                                    <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nội dung chi tiết
                                    </label>
                                    <textarea
                                        id="editContent"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={formData.Content}
                                        onChange={(e) => setFormData({...formData, Content: e.target.value})}
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
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Danh sách người tham gia: {selectedProgram.ProgramName}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng ký</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendees.map((attendee) => (
                                            <tr key={`${attendee.ProgramID}-${attendee.AccountID}`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.FullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.Username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(attendee.RegistrationDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attendee.Status}</td>
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
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                    Gửi lại lời mời Zoom
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgramManagementPage;