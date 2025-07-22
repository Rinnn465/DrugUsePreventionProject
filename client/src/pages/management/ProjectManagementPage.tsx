import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Target,
    Search,
    ChevronDown,
    Users,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    BarChart3,
    Filter,
    Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';

// Mock data interface for projects
interface Project {
    id: number;
    name: string;
    description: string;
    status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
    priority: 'low' | 'medium' | 'high';
    startDate: string;
    endDate: string;
    budget: number;
    teamMembers: number;
    progress: number;
    manager: string;
    category: string;
}

const ProjectManagementPage: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Form data state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        startDate: '',
        endDate: '',
        budget: '',
        manager: '',
        category: 'prevention'
    });

    // Mock data - replace with actual API calls
    useEffect(() => {
        const mockProjects: Project[] = [
            {
                id: 1,
                name: "Chiến dịch tuyên truyền phòng chống tệ nạn xã hội tại các trường THPT",
                description: "Tổ chức các buổi tuyên truyền, hội thảo và phát tài liệu tại 10 trường THPT trong thành phố",
                status: "in-progress",
                priority: "high",
                startDate: "2024-01-15",
                endDate: "2024-06-30",
                budget: 500000000,
                teamMembers: 12,
                progress: 65,
                manager: "Nguyễn Văn A",
                category: "education"
            },
            {
                id: 2,
                name: "Xây dựng mạng lưới tư vấn trực tuyến",
                description: "Phát triển nền tảng tư vấn trực tuyến và đào tạo đội ngũ tư vấn viên",
                status: "planning",
                priority: "medium",
                startDate: "2024-03-01",
                endDate: "2024-12-31",
                budget: 800000000,
                teamMembers: 8,
                progress: 15,
                manager: "Trần Thị B",
                category: "technology"
            },
            {
                id: 3,
                name: "Nghiên cứu tình hình tệ nạn xã hội trong thanh niên",
                description: "Khảo sát và phân tích xu hướng tệ nạn xã hội trong giới trẻ để đưa ra giải pháp",
                status: "completed",
                priority: "high",
                startDate: "2023-06-01",
                endDate: "2024-01-31",
                budget: 300000000,
                teamMembers: 6,
                progress: 100,
                manager: "Phạm Minh C",
                category: "research"
            }
        ];

        setTimeout(() => {
            setProjects(mockProjects);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter projects
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Get status color and text
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'planning':
                return { color: 'bg-blue-100 text-blue-800', text: 'Lập kế hoạch' };
            case 'in-progress':
                return { color: 'bg-yellow-100 text-yellow-800', text: 'Đang thực hiện' };
            case 'completed':
                return { color: 'bg-green-100 text-green-800', text: 'Hoàn thành' };
            case 'on-hold':
                return { color: 'bg-red-100 text-red-800', text: 'Tạm dừng' };
            default:
                return { color: 'bg-gray-100 text-gray-800', text: 'Không xác định' };
        }
    };

    // Get priority color and text
    const getPriorityInfo = (priority: string) => {
        switch (priority) {
            case 'low':
                return { color: 'bg-gray-100 text-gray-800', text: 'Thấp' };
            case 'medium':
                return { color: 'bg-blue-100 text-blue-800', text: 'Trung bình' };
            case 'high':
                return { color: 'bg-red-100 text-red-800', text: 'Cao' };
            default:
                return { color: 'bg-gray-100 text-gray-800', text: 'Thấp' };
        }
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement API call
        toast.success('Dự án đã được tạo thành công!');
        setShowCreateModal(false);
        // Reset form
        setFormData({
            name: '',
            description: '',
            status: 'planning',
            priority: 'medium',
            startDate: '',
            endDate: '',
            budget: '',
            manager: '',
            category: 'prevention'
        });
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                                <Target className="h-8 w-8 mr-3 text-blue-600" />
                                Quản lý dự án
                            </h1>
                            <p className="text-gray-600">
                                Theo dõi và quản lý các dự án phòng chống tệ nạn xã hội
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Tạo dự án mới
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Tổng dự án</p>
                                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-yellow-100">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Đang thực hiện</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {projects.filter(p => p.status === 'in-progress').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-green-100">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {projects.filter(p => p.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-lg bg-purple-100">
                                <BarChart3 className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn thành</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {projects.length > 0 
                                        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) 
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-64">
                            <div className="relative">
                                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm dự án..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="planning">Lập kế hoạch</option>
                            <option value="in-progress">Đang thực hiện</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="on-hold">Tạm dừng</option>
                        </select>
                        
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả độ ưu tiên</option>
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                        </select>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Danh sách dự án ({filteredProjects.length})
                        </h3>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dự án
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Độ ưu tiên
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tiến độ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày kết thúc
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngân sách
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProjects.map((project) => {
                                        const statusInfo = getStatusInfo(project.status);
                                        const priorityInfo = getPriorityInfo(project.priority);
                                        
                                        return (
                                            <tr key={project.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                                {project.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                {project.description}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityInfo.color}`}>
                                                        {priorityInfo.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                            <div 
                                                                className="bg-blue-600 h-2 rounded-full" 
                                                                style={{ width: `${project.progress}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-sm text-gray-900 w-10">
                                                            {project.progress}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(project.endDate).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency(project.budget)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button className="text-green-600 hover:text-green-900 p-1 rounded">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 p-1 rounded">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            
                            {filteredProjects.length === 0 && (
                                <div className="text-center py-12">
                                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Không có dự án nào
                                    </h3>
                                    <p className="text-gray-500">
                                        {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                                            ? 'Không tìm thấy dự án phù hợp với bộ lọc hiện tại.'
                                            : 'Bắt đầu bằng cách tạo dự án đầu tiên của bạn.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProjectManagementPage; 