import React, { useState } from 'react';
import {
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    FileText,
    Eye,
    Edit,
    Trash2,
    Plus,
    Filter,
    Search,
    Info,
    List,
    CalendarDays,
    Tag
} from 'lucide-react';

interface Task {
    id: number;
    title: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'overdue';
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    assignedBy: string;
    type: 'course' | 'event' | 'report' | 'other';
    project?: string;
    campaign?: string;
    attachments?: string[];
    subtasks?: string[];
}

const StaffManagementTable: React.FC = () => {
    const [tasks] = useState<Task[]>([
        {
            id: 1,
            title: "Hỗ trợ khóa học 'Phòng chống tệ nạn xã hội'",
            description: "Theo dõi tiến độ học viên và hỗ trợ giải đáp thắc mắc",
            status: 'in-progress',
            priority: 'high',
            dueDate: '2024-12-25',
            assignedBy: 'Manager Nguyễn Văn A',
            type: 'course',
            project: 'Nâng cao nhận thức Q4/2024',
            campaign: 'Chiến dịch giáo dục học đường',
            attachments: ['slide-bai-giang.pptx', 'tai-lieu-tham-khao.pdf'],
            subtasks: ['Chuẩn bị slide', 'Thống kê học viên', 'Phản hồi câu hỏi']
        },
        {
            id: 2,
            title: "Chuẩn bị tài liệu sự kiện cộng đồng",
            description: "Soạn thảo và chuẩn bị tài liệu cho sự kiện tuần tới",
            status: 'pending',
            priority: 'medium',
            dueDate: '2024-12-20',
            assignedBy: 'Manager Trần Thị B',
            type: 'event',
            project: 'Nâng cao nhận thức Q4/2024',
            campaign: 'Tuyên truyền cộng đồng',
            attachments: ['poster-su-kien.jpg', 'checklist-chuan-bi.docx'],
            subtasks: ['Thiết kế poster', 'Liên hệ địa điểm', 'Chuẩn bị vật dụng']
        },
        {
            id: 3,
            title: "Báo cáo hoạt động tuần",
            description: "Tổng kết hoạt động và tiến độ công việc trong tuần",
            status: 'completed',
            priority: 'low',
            dueDate: '2024-12-15',
            assignedBy: 'Manager Nguyễn Văn A',
            type: 'report',
            project: 'Báo cáo định kỳ',
            attachments: ['bao-cao-tuan-48.xlsx'],
            subtasks: ['Thu thập dữ liệu', 'Phân tích kết quả', 'Viết báo cáo']
        },
        {
            id: 4,
            title: "Phản hồi đánh giá học viên",
            description: "Xem xét và phản hồi các đánh giá từ học viên trong khóa học",
            status: 'overdue',
            priority: 'high',
            dueDate: '2024-12-10',
            assignedBy: 'Manager Lê Văn C',
            type: 'course',
            project: 'Cải thiện chất lượng đào tạo',
            campaign: 'Chiến dịch giáo dục học đường',
            attachments: ['danh-gia-hoc-vien.csv'],
            subtasks: ['Đọc đánh giá', 'Phân loại phản hồi', 'Trả lời học viên']
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'in-progress':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Calendar className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status) {
            case 'completed':
                return `${baseClasses} bg-green-100 text-green-800`;
            case 'in-progress':
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'overdue':
                return `${baseClasses} bg-red-100 text-red-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
        switch (priority) {
            case 'high':
                return `${baseClasses} bg-red-100 text-red-800`;
            case 'medium':
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseClasses} bg-green-100 text-green-800`;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'in-progress':
                return 'Đang thực hiện';
            case 'overdue':
                return 'Quá hạn';
            default:
                return 'Chờ xử lý';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'Cao';
            case 'medium':
                return 'Trung bình';
            default:
                return 'Thấp';
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesPriority;
    });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Quản lý công việc</h3>
                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <List className="h-4 w-4" />
                            <span className="text-sm">Danh sách</span>
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                                viewMode === 'calendar' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <CalendarDays className="h-4 w-4" />
                            <span className="text-sm">Lịch</span>
                        </button>
                    </div>
                    <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        <Plus className="h-4 w-4" />
                        <span>Thêm công việc</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm công việc..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="in-progress">Đang thực hiện</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="overdue">Quá hạn</option>
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Tất cả mức độ</option>
                        <option value="high">Cao</option>
                        <option value="medium">Trung bình</option>
                        <option value="low">Thấp</option>
                    </select>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? (
                /* List View - Table */
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Công việc</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Dự án/Chiến dịch</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Trạng thái</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Mức độ</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Hạn hoàn thành</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Người giao</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.map((task) => (
                                <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4">
                                        <div className="flex items-start gap-3">
                                            {getStatusIcon(task.status)}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                                                <p className="text-sm text-gray-600">{task.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="space-y-1">
                                            {task.project && (
                                                <div className="flex items-center gap-1">
                                                    <Tag className="h-3 w-3 text-blue-500" />
                                                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                                        {task.project}
                                                    </span>
                                                </div>
                                            )}
                                            {task.campaign && (
                                                <div className="flex items-center gap-1">
                                                    <Tag className="h-3 w-3 text-green-500" />
                                                    <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                                                        {task.campaign}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={getStatusBadge(task.status)}>
                                            {getStatusText(task.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={getPriorityBadge(task.priority)}>
                                            {getPriorityText(task.priority)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600">
                                        {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-600">
                                        {task.assignedBy}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Info className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                title="Xem"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                title="Xóa"
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
            ) : (
                /* Calendar View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTasks.map((task) => (
                        <div key={task.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-400">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(task.status)}
                                    <span className={getPriorityBadge(task.priority)}>
                                        {getPriorityText(task.priority)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                        {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            {task.project && (
                                <div className="flex items-center gap-1 mb-2">
                                    <Tag className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                        {task.project}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className={getStatusBadge(task.status)}>
                                    {getStatusText(task.status)}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button 
                                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Info className="h-4 w-4" />
                                    </button>
                                    <button 
                                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Không tìm thấy công việc nào</p>
                </div>
            )}
        </div>
    );
};

export default StaffManagementTable; 