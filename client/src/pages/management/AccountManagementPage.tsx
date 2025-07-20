import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import { 
    Users, 
    Search, 
    Filter, 
    Plus, 
    Edit, 
    Trash2, 
    UserCheck, 
    UserX, 
    Calendar,
    Mail,
    Shield
} from 'lucide-react';
import { Account, CreateAccountData, UpdateAccountData, AccountRole } from '../../types/Account';

const AccountManagementPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [roles, setRoles] = useState<AccountRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [formData, setFormData] = useState<CreateAccountData>({
        Username: '',
        Email: '',
        Password: '',
        FullName: '',
        DateOfBirth: null,
        RoleID: 1
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

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName?.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'manager': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'staff': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'consultant': return 'bg-green-100 text-green-800 border-green-200';
            case 'member': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // API calls
    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/account', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setAccounts(data);
            } else {
                toast.error('Không thể tải danh sách tài khoản');
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Lỗi khi tải danh sách tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            // Thử gọi API /roles trước
            const response = await fetch('http://localhost:5000/api/account/roles', {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const rolesData = await response.json();
                setRoles(rolesData);
            } else {
                // Fallback: extract từ accounts nếu API fail
                const uniqueRoles = accounts.reduce((acc, account) => {
                    if (!acc.find(role => role.RoleID === account.RoleID)) {
                        acc.push({ RoleID: account.RoleID, RoleName: account.RoleName });
                    }
                    return acc;
                }, [] as AccountRole[]);
                setRoles(uniqueRoles);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            // Fallback: extract từ accounts
            const uniqueRoles = accounts.reduce((acc, account) => {
                if (!acc.find(role => role.RoleID === account.RoleID)) {
                    acc.push({ RoleID: account.RoleID, RoleName: account.RoleName });
                }
                return acc;
            }, [] as AccountRole[]);
            setRoles(uniqueRoles);
        }
    };

    const createAccount = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/account', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Tạo tài khoản thành công!');
                setShowCreateModal(false);
                resetForm();
                fetchAccounts();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể tạo tài khoản');
            }
        } catch (error) {
            console.error('Error creating account:', error);
            toast.error('Lỗi khi tạo tài khoản');
        }
    };

    const updateAccount = async () => {
        if (!selectedAccount) return;

        try {
            const updateData: UpdateAccountData = {
                Username: formData.Username,
                Email: formData.Email,
                FullName: formData.FullName,
                DateOfBirth: formData.DateOfBirth,
                RoleID: formData.RoleID
            };

            const response = await fetch(`http://localhost:5000/api/account/${selectedAccount.AccountID}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                toast.success('Cập nhật tài khoản thành công!');
                setShowEditModal(false);
                resetForm();
                fetchAccounts();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể cập nhật tài khoản');
            }
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error('Lỗi khi cập nhật tài khoản');
        }
    };

    const deleteAccount = async () => {
        if (!selectedAccount) return;

        try {
            const response = await fetch(`http://localhost:5000/api/account/${selectedAccount.AccountID}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                toast.success('Xóa tài khoản thành công!');
                setShowDeleteModal(false);
                setSelectedAccount(null);
                fetchAccounts();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể xóa tài khoản');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Lỗi khi xóa tài khoản');
        }
    };

    const toggleAccountStatus = async (account: Account) => {
        try {
            const updateData = { IsDisabled: !account.IsDisabled };
            const response = await fetch(`http://localhost:5000/api/account/${account.AccountID}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                toast.success(`Tài khoản đã được ${account.IsDisabled ? 'kích hoạt' : 'vô hiệu hóa'}!`);
                fetchAccounts();
            } else {
                const error = await response.json();
                toast.error(error.message || 'Không thể thay đổi trạng thái tài khoản');
            }
        } catch (error) {
            console.error('Error toggling account status:', error);
            toast.error('Lỗi khi thay đổi trạng thái tài khoản');
        }
    };

    // Form handlers
    const resetForm = () => {
        setFormData({
            Username: '',
            Email: '',
            Password: '',
            FullName: '',
            DateOfBirth: null,
            RoleID: 1
        });
        setSelectedAccount(null);
    };

    const handleCreateAccount = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleEditAccount = (account: Account) => {
        setSelectedAccount(account);
        setFormData({
            Username: account.Username,
            Email: account.Email,
            Password: '', // Don't show password
            FullName: account.FullName,
            DateOfBirth: account.DateOfBirth,
            RoleID: account.RoleID
        });
        setShowEditModal(true);
    };

    const handleDeleteAccount = (account: Account) => {
        setSelectedAccount(account);
        setShowDeleteModal(true);
    };

    // Filter accounts
    const filteredAccounts = accounts.filter(account => {
        const matchesSearch = 
            account.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.Username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.Email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || account.RoleID.toString() === roleFilter;
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && !account.IsDisabled) ||
            (statusFilter === 'disabled' && account.IsDisabled);

        return matchesSearch && matchesRole && matchesStatus;
    });

    useEffect(() => {
        fetchAccounts();
        fetchRoles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Tài khoản</h1>
                                    <p className="text-gray-600 mt-1">Quản lý người dùng và phân quyền hệ thống</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCreateAccount}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Tạo tài khoản</span>
                            </button>
                        </div>
                    </div>
                </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm tài khoản..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả vai trò</option>
                                {roles.map(role => (
                                    <option key={role.RoleID} value={role.RoleID.toString()}>
                                        {role.RoleName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="disabled">Đã vô hiệu hóa</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Accounts Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Danh sách tài khoản ({filteredAccounts.length})
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Người dùng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vai trò
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAccounts.map((account) => (
                                        <tr key={account.AccountID} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <Users className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {account.FullName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            @{account.Username}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Mail className="h-4 w-4 mr-1" />
                                                            {account.Email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(account.RoleName)}`}>
                                                    {account.RoleName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {formatDate(account.CreatedAt)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    account.IsDisabled 
                                                        ? 'bg-red-100 text-red-800 border border-red-200' 
                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                }`}>
                                                    {account.IsDisabled ? (
                                                        <>
                                                            <UserX className="h-3 w-3 mr-1" />
                                                            Vô hiệu hóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserCheck className="h-3 w-3 mr-1" />
                                                            Hoạt động
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => toggleAccountStatus(account)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            account.IsDisabled
                                                                ? 'text-green-600 hover:bg-green-100'
                                                                : 'text-orange-600 hover:bg-orange-100'
                                                        }`}
                                                        title={account.IsDisabled ? 'Kích hoạt' : 'Vô hiệu hóa'}
                                                    >
                                                        {account.IsDisabled ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditAccount(account)}
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAccount(account)}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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

                            {filteredAccounts.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài khoản</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Không tìm thấy tài khoản nào phù hợp với bộ lọc hiện tại.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Tạo tài khoản mới</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên đăng nhập *
                                </label>
                                <input
                                    type="text"
                                    value={formData.Username}
                                    onChange={(e) => setFormData({...formData, Username: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên đăng nhập"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.Email}
                                    onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mật khẩu *
                                </label>
                                <input
                                    type="password"
                                    value={formData.Password}
                                    onChange={(e) => setFormData({...formData, Password: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập mật khẩu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    value={formData.FullName}
                                    onChange={(e) => setFormData({...formData, FullName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    value={formData.DateOfBirth ? new Date(formData.DateOfBirth).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setFormData({...formData, DateOfBirth: e.target.value ? new Date(e.target.value) : null})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò *
                                </label>
                                <select
                                    value={formData.RoleID}
                                    onChange={(e) => setFormData({...formData, RoleID: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {roles.map(role => (
                                        <option key={role.RoleID} value={role.RoleID}>
                                            {role.RoleName}
                                        </option>
                                    ))}
                                </select>
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
                                onClick={createAccount}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Tạo tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedAccount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa tài khoản</h3>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên đăng nhập *
                                </label>
                                <input
                                    type="text"
                                    value={formData.Username}
                                    onChange={(e) => setFormData({...formData, Username: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập tên đăng nhập"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.Email}
                                    onChange={(e) => setFormData({...formData, Email: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên *
                                </label>
                                <input
                                    type="text"
                                    value={formData.FullName}
                                    onChange={(e) => setFormData({...formData, FullName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nhập họ và tên"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    value={formData.DateOfBirth ? new Date(formData.DateOfBirth).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setFormData({...formData, DateOfBirth: e.target.value ? new Date(e.target.value) : null})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vai trò *
                                </label>
                                <select
                                    value={formData.RoleID}
                                    onChange={(e) => setFormData({...formData, RoleID: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {roles.map(role => (
                                        <option key={role.RoleID} value={role.RoleID}>
                                            {role.RoleName}
                                        </option>
                                    ))}
                                </select>
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
                                onClick={updateAccount}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedAccount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                        </div>
                        <div className="px-6 py-4">
                            <p className="text-gray-600">
                                Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedAccount.FullName}</strong>?
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
                                onClick={deleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Xóa tài khoản
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </AdminLayout>
    );
};

export default AccountManagementPage;
