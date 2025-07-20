import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import { 
    FileText, 
    Search, 
    Filter, 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Calendar,
    User,
    AlertCircle
} from 'lucide-react';
import { Article, CreateArticleData, UpdateArticleData } from '../../types/Article';

const ArticleManagementPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [formData, setFormData] = useState<CreateArticleData>({
        Title: '',
        Content: '',
        Author: ''
    });

    // Helper functions
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'published': return 'bg-green-100 text-green-800 border-green-200';
            case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    // API calls
    const fetchArticles = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/article', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            } else {
                toast.error('Không thể tải danh sách bài viết');
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
            toast.error('Lỗi khi tải danh sách bài viết');
        } finally {
            setLoading(false);
        }
    }, []);

    const createArticle = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/article', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Thêm bài viết thành công!');
                setShowCreateModal(false);
                resetForm();
                fetchArticles();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể thêm bài viết');
            }
        } catch (error) {
            console.error('Error creating article:', error);
            toast.error('Lỗi khi thêm bài viết');
        }
    };

    const updateArticle = async () => {
        if (!selectedArticle) return;

        try {
            const updateData: UpdateArticleData = {
                Title: formData.Title,
                Content: formData.Content,
                Author: formData.Author
            };

            const response = await fetch(`http://localhost:5000/api/article/${selectedArticle.BlogID}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                toast.success('Cập nhật bài viết thành công!');
                setShowEditModal(false);
                resetForm();
                fetchArticles();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể cập nhật bài viết');
            }
        } catch (error) {
            console.error('Error updating article:', error);
            toast.error('Lỗi khi cập nhật bài viết');
        }
    };

    const deleteArticle = async () => {
        if (!selectedArticle) return;

        try {
            const response = await fetch(`http://localhost:5000/api/article/${selectedArticle.BlogID}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                toast.success('Xóa bài viết thành công!');
                setShowDeleteModal(false);
                setSelectedArticle(null);
                fetchArticles();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể xóa bài viết');
            }
        } catch (error) {
            console.error('Error deleting article:', error);
            toast.error('Lỗi khi xóa bài viết');
        }
    };

    const toggleArticleStatus = async (article: Article) => {
        try {
            const updateData = { IsDisabled: !article.IsDisabled };
            const response = await fetch(`http://localhost:5000/api/article/${article.BlogID}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                toast.success(`Bài viết đã được ${article.IsDisabled ? 'kích hoạt' : 'ẩn'}!`);
                fetchArticles();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể thay đổi trạng thái bài viết');
            }
        } catch (error) {
            console.error('Error toggling article status:', error);
            toast.error('Lỗi khi thay đổi trạng thái bài viết');
        }
    };

    // Form handlers
    const resetForm = () => {
        setFormData({
            Title: '',
            Content: '',
            Author: ''
        });
        setSelectedArticle(null);
    };

    const handleCreateArticle = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleEditArticle = (article: Article) => {
        setSelectedArticle(article);
        setFormData({
            Title: article.ArticleTitle,
            Content: article.Content,
            Author: article.Author || ''
        });
        setShowEditModal(true);
    };

    const handleDeleteArticle = (article: Article) => {
        setSelectedArticle(article);
        setShowDeleteModal(true);
    };

    // Filter articles
    const filteredArticles = articles.filter(article => {
        const matchesSearch = 
            article.ArticleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.Author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.Content.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && !article.IsDisabled) ||
            (statusFilter === 'disabled' && article.IsDisabled) ||
            (statusFilter === article.Status.toLowerCase());

        return matchesSearch && matchesStatus;
    });

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <FileText className="h-8 w-8 text-purple-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Bài viết</h1>
                                    <p className="text-gray-600 mt-1">Quản lý nội dung và bài viết trên website</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCreateArticle}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Thêm bài viết</span>
                            </button>
                        </div>
                    </div>
                </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hiển thị</option>
                                <option value="disabled">Đã ẩn</option>
                                <option value="published">Đã xuất bản</option>
                                <option value="draft">Bản nháp</option>
                                <option value="archived">Lưu trữ</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Articles Grid */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Danh sách bài viết ({filteredArticles.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <div className="p-6">
                            {filteredArticles.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có bài viết</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredArticles.map((article) => (
                                        <div key={article.BlogID} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Article Header */}
                                            <div className="p-4 border-b border-gray-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                                            {article.ArticleTitle}
                                                        </h4>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                                            <User className="h-4 w-4" />
                                                            <span>{article.Author}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{formatDate(article.PublishedDate)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(article.Status)}`}>
                                                            {article.Status}
                                                        </span>
                                                        {article.IsDisabled && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                                <EyeOff className="h-3 w-3 mr-1" />
                                                                Ẩn
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Article Content Preview */}
                                            <div className="p-4">
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {truncateContent(article.Content, 150)}
                                                </p>
                                                {article.Description && (
                                                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                                        <div className="flex items-start space-x-2">
                                                            <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                            <p className="text-sm text-blue-700">
                                                                {truncateContent(article.Description, 100)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Article Actions */}
                                            <div className="px-4 py-3 bg-gray-100 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => toggleArticleStatus(article)}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                article.IsDisabled
                                                                    ? 'text-green-600 hover:bg-green-100'
                                                                    : 'text-orange-600 hover:bg-orange-100'
                                                            }`}
                                                            title={article.IsDisabled ? 'Hiển thị' : 'Ẩn bài viết'}
                                                        >
                                                            {article.IsDisabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditArticle(article)}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteArticle(article)}
                                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Thêm bài viết mới</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label htmlFor="createTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề *
                                </label>
                                <input
                                    id="createTitle"
                                    type="text"
                                    value={formData.Title}
                                    onChange={(e) => setFormData({...formData, Title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Nhập tiêu đề bài viết"
                                />
                            </div>
                            <div>
                                <label htmlFor="createAuthor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tác giả
                                </label>
                                <input
                                    id="createAuthor"
                                    type="text"
                                    value={formData.Author}
                                    onChange={(e) => setFormData({...formData, Author: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Nhập tên tác giả"
                                />
                            </div>
                            <div>
                                <label htmlFor="createContent" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung *
                                </label>
                                <textarea
                                    id="createContent"
                                    value={formData.Content}
                                    onChange={(e) => setFormData({...formData, Content: e.target.value})}
                                    rows={10}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Nhập nội dung bài viết"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={createArticle}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Thêm bài viết
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa bài viết</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề *
                                </label>
                                <input
                                    id="editTitle"
                                    type="text"
                                    value={formData.Title}
                                    onChange={(e) => setFormData({...formData, Title: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Nhập tiêu đề bài viết"
                                />
                            </div>
                            <div>
                                <label htmlFor="editAuthor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tác giả
                                </label>
                                <input
                                    id="editAuthor"
                                    type="text"
                                    value={formData.Author}
                                    onChange={(e) => setFormData({...formData, Author: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Nhập tên tác giả"
                                />
                            </div>
                            <div>
                                <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nội dung *
                                </label>
                                <textarea
                                    id="editContent"
                                    value={formData.Content}
                                    onChange={(e) => setFormData({...formData, Content: e.target.value})}
                                    rows={10}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Nhập nội dung bài viết"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={updateArticle}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedArticle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-600">
                                Bạn có chắc chắn muốn xóa bài viết <strong>{selectedArticle.ArticleTitle}</strong>?
                            </p>
                            <p className="text-red-600 text-sm mt-2">
                                Thao tác này không thể hoàn tác!
                            </p>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={deleteArticle}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xóa bài viết
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
    );
};

export default ArticleManagementPage;
