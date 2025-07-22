import React, { useState, useEffect } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Download,
    Calendar,
    Users,
    Target,
    FileText,
    Eye,
    Filter,
    ChevronDown,
    PieChart,
    Activity,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';

// Mock data interfaces
interface ReportData {
    id: string;
    name: string;
    type: 'project' | 'program' | 'impact' | 'financial';
    generatedDate: string;
    status: 'completed' | 'generating' | 'error';
    size: string;
    description: string;
}

interface StatCard {
    title: string;
    value: string | number;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ComponentType<any>;
    color: string;
}

const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [selectedType, setSelectedType] = useState('all');
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Form state for generating new reports
    const [reportForm, setReportForm] = useState({
        type: 'project',
        period: 'month',
        format: 'pdf',
        includeCharts: true,
        includeDetails: true
    });

    // Mock analytics data
    const [analyticsData, setAnalyticsData] = useState({
        totalReach: 15420,
        programsCompleted: 12,
        successRate: 87.5,
        budgetUtilization: 92.3,
        monthlyTrend: [65, 72, 68, 85, 92, 78, 95],
        projectsByStatus: {
            completed: 8,
            inProgress: 5,
            planning: 3,
            onHold: 1
        },
        impactMetrics: {
            schoolsReached: 25,
            studentsImpacted: 8500,
            consultationsSessions: 156,
            materialDistributed: 3200
        }
    });

    // Stats cards data
    const statsCards: StatCard[] = [
        {
            title: "Báo cáo trong tháng",
            value: reports.length,
            change: "+3 từ tháng trước",
            changeType: "positive",
            icon: FileText,
            color: "bg-blue-500"
        },
        {
            title: "Tỷ lệ thành công chương trình",
            value: `${analyticsData.successRate}%`,
            change: "+2.5% từ tháng trước",
            changeType: "positive",
            icon: TrendingUp,
            color: "bg-green-500"
        },
        {
            title: "Người được tiếp cận",
            value: analyticsData.totalReach.toLocaleString(),
            change: "+1,250 từ tháng trước",
            changeType: "positive",
            icon: Users,
            color: "bg-purple-500"
        },
        {
            title: "Sử dụng ngân sách",
            value: `${analyticsData.budgetUtilization}%`,
            change: "Trong kế hoạch",
            changeType: "neutral",
            icon: Target,
            color: "bg-orange-500"
        }
    ];

    // Mock reports data
    useEffect(() => {
        const mockReports: ReportData[] = [
            {
                id: '1',
                name: 'Báo cáo tác động chương trình tháng 12/2024',
                type: 'impact',
                generatedDate: '2024-12-15',
                status: 'completed',
                size: '2.5 MB',
                description: 'Phân tích tác động các chương trình phòng chống tệ nạn trong tháng 12'
            },
            {
                id: '2', 
                name: 'Báo cáo tài chính quý 4/2024',
                type: 'financial',
                generatedDate: '2024-12-31',
                status: 'completed',
                size: '1.8 MB',
                description: 'Tổng kết thu chi và hiệu quả sử dụng ngân sách quý 4'
            },
            {
                id: '3',
                name: 'Báo cáo tiến độ dự án THPT',
                type: 'project', 
                generatedDate: '2024-12-10',
                status: 'completed',
                size: '3.2 MB',
                description: 'Tiến độ thực hiện chiến dịch tuyên truyền tại các trường THPT'
            },
            {
                id: '4',
                name: 'Báo cáo chương trình cộng đồng',
                type: 'program',
                generatedDate: '2024-12-20',
                status: 'generating',
                size: 'Đang xử lý...',
                description: 'Đánh giá hiệu quả các chương trình cộng đồng trong tháng'
            }
        ];

        setTimeout(() => {
            setReports(mockReports);
            setLoading(false);
        }, 1000);
    }, []);

    // Filter reports
    const filteredReports = reports.filter(report => {
        const matchesType = selectedType === 'all' || report.type === selectedType;
        return matchesType;
    });

    // Get report type info
    const getReportTypeInfo = (type: string) => {
        switch (type) {
            case 'project':
                return { color: 'bg-blue-100 text-blue-800', text: 'Dự án' };
            case 'program':
                return { color: 'bg-green-100 text-green-800', text: 'Chương trình' };
            case 'impact':
                return { color: 'bg-purple-100 text-purple-800', text: 'Tác động' };
            case 'financial':
                return { color: 'bg-yellow-100 text-yellow-800', text: 'Tài chính' };
            default:
                return { color: 'bg-gray-100 text-gray-800', text: 'Khác' };
        }
    };

    // Get status info
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'completed':
                return { 
                    color: 'bg-green-100 text-green-800', 
                    text: 'Hoàn thành',
                    icon: CheckCircle2
                };
            case 'generating':
                return { 
                    color: 'bg-blue-100 text-blue-800', 
                    text: 'Đang tạo',
                    icon: Activity
                };
            case 'error':
                return { 
                    color: 'bg-red-100 text-red-800', 
                    text: 'Lỗi',
                    icon: AlertCircle
                };
            default:
                return { 
                    color: 'bg-gray-100 text-gray-800', 
                    text: 'Không xác định',
                    icon: AlertCircle
                };
        }
    };

    // Handle generate report
    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Báo cáo đang được tạo. Bạn sẽ nhận được thông báo khi hoàn thành.');
        setShowGenerateModal(false);
        
        // Add new report to list (mock)
        const newReport: ReportData = {
            id: Date.now().toString(),
            name: `Báo cáo ${reportForm.type} - ${new Date().toLocaleDateString('vi-VN')}`,
            type: reportForm.type as any,
            generatedDate: new Date().toISOString().split('T')[0],
            status: 'generating',
            size: 'Đang xử lý...',
            description: 'Báo cáo đang được tạo tự động'
        };
        
        setReports(prev => [newReport, ...prev]);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                                <BarChart3 className="h-8 w-8 mr-3 text-indigo-600" />
                                Báo cáo & Phân tích
                            </h1>
                            <p className="text-gray-600">
                                Theo dõi hiệu suất và tạo báo cáo tổng hợp
                            </p>
                        </div>
                        <button
                            onClick={() => setShowGenerateModal(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                        >
                            <FileText className="h-5 w-5 mr-2" />
                            Tạo báo cáo mới
                        </button>
                    </div>
                </div>



                {/* Reports Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Báo cáo đã tạo ({filteredReports.length})
                            </h3>
                            <div className="flex items-center space-x-3">
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="all">Tất cả loại</option>
                                    <option value="project">Dự án</option>
                                    <option value="program">Chương trình</option>
                                    <option value="impact">Tác động</option>
                                    <option value="financial">Tài chính</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredReports.map((report) => {
                                const typeInfo = getReportTypeInfo(report.type);
                                const statusInfo = getStatusInfo(report.status);
                                const StatusIcon = statusInfo.icon;
                                
                                return (
                                    <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="text-md font-medium text-gray-900">
                                                        {report.name}
                                                    </h4>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                                                        {typeInfo.text}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {statusInfo.text}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-1">{report.description}</p>
                                                <div className="text-xs text-gray-500">
                                                    Tạo ngày {new Date(report.generatedDate).toLocaleDateString('vi-VN')} • {report.size}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded"
                                                    disabled={report.status !== 'completed'}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    className="text-green-600 hover:text-green-900 p-2 rounded"
                                                    disabled={report.status !== 'completed'}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredReports.length === 0 && (
                                <div className="text-center py-12">
                                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Không có báo cáo nào
                                    </h3>
                                    <p className="text-gray-500">
                                        Tạo báo cáo đầu tiên để bắt đầu theo dõi hiệu suất.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Generate Report Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Tạo báo cáo mới
                        </h3>
                        <form onSubmit={handleGenerateReport}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại báo cáo
                                    </label>
                                    <select
                                        value={reportForm.type}
                                        onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="project">Báo cáo dự án</option>
                                        <option value="program">Báo cáo chương trình</option>
                                        <option value="impact">Báo cáo tác động</option>
                                        <option value="financial">Báo cáo tài chính</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Khoảng thời gian
                                    </label>
                                    <select
                                        value={reportForm.period}
                                        onChange={(e) => setReportForm(prev => ({ ...prev, period: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="week">Tuần này</option>
                                        <option value="month">Tháng này</option>
                                        <option value="quarter">Quý này</option>
                                        <option value="year">Năm này</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Định dạng
                                    </label>
                                    <select
                                        value={reportForm.format}
                                        onChange={(e) => setReportForm(prev => ({ ...prev, format: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="pdf">PDF</option>
                                        <option value="excel">Excel</option>
                                        <option value="word">Word</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={reportForm.includeCharts}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, includeCharts: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Bao gồm biểu đồ</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={reportForm.includeDetails}
                                            onChange={(e) => setReportForm(prev => ({ ...prev, includeDetails: e.target.checked }))}
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Bao gồm chi tiết</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                                >
                                    Tạo báo cáo
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ReportsPage; 