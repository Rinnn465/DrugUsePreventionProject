import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import { 
    User, 
    Edit2, 
    Save, 
    X, 
    Calendar, 
    UserCheck,
    Shield,
    Camera,
    Upload
} from 'lucide-react';
import { Account } from '../../types/Account';
import { useUser } from '../../context/UserContext';

const AdminProfilePage: React.FC = () => {
    const { user, setUser } = useUser();
    const [profile, setProfile] = useState<Account | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editForm, setEditForm] = useState({
        FullName: '',
        Email: '',
        Username: '',
        DateOfBirth: ''
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            if (!user?.AccountID) return;
            
            const response = await fetch(`http://localhost:5000/api/account/${user.AccountID}`, {
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setEditForm({
                    FullName: data.FullName || '',
                    Email: data.Email || '',
                    Username: data.Username || '',
                    DateOfBirth: data.DateOfBirth ? new Date(data.DateOfBirth).toISOString().split('T')[0] : ''
                });
            } else {
                throw new Error('Không thể tải thông tin profile');
            }
        } catch (error) {
            console.error('Lỗi khi tải profile:', error);
            toast.error('Không thể tải thông tin profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            if (!user?.AccountID) return;

            const updateData = {
                FullName: editForm.FullName,
                Email: editForm.Email,
                Username: editForm.Username,
                DateOfBirth: editForm.DateOfBirth || null
            };

            const response = await fetch(`http://localhost:5000/api/account/${user.AccountID}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                toast.success('Cập nhật thông tin thành công!');
                setIsEditing(false);
                fetchProfile();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Không thể cập nhật thông tin');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi cập nhật profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật thông tin';
            toast.error(errorMessage);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (profile) {
            setEditForm({
                FullName: profile.FullName || '',
                Email: profile.Email || '',
                Username: profile.Username || '',
                DateOfBirth: profile.DateOfBirth ? new Date(profile.DateOfBirth).toISOString().split('T')[0] : ''
            });
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file ảnh hợp lệ');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('profilePicture', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/account/${user?.AccountID}/upload-avatar`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                // Update profile state
                setProfile(prev => prev ? { ...prev, ProfilePicture: data.profilePicture } : null);
                // Update user context
                if (user && setUser) {
                    setUser({ ...user, ProfilePicture: data.profilePicture });
                    localStorage.setItem('user', JSON.stringify({ ...user, ProfilePicture: data.profilePicture }));
                }
                toast.success('Cập nhật ảnh đại diện thành công!');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Không thể upload ảnh');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi upload ảnh:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi upload ảnh';
            toast.error(errorMessage);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            if (!user?.AccountID) return;

            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/account/${user.AccountID}/remove-avatar`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Update profile state
                setProfile(prev => prev ? { ...prev, ProfilePicture: null } : null);
                // Update user context
                if (user && setUser) {
                    setUser({ ...user, ProfilePicture: null });
                    localStorage.setItem('user', JSON.stringify({ ...user, ProfilePicture: null }));
                }
                toast.success('Xóa ảnh đại diện thành công!');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Không thể xóa ảnh');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi xóa ảnh:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa ảnh';
            toast.error(errorMessage);
        }
    };

    const formatDate = (dateValue: Date | string | null) => {
        if (!dateValue) return 'Chưa cập nhật';
        const dateString = typeof dateValue === 'string' ? dateValue : dateValue.toISOString();
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (loading) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Đang tải thông tin profile...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!profile) {
        return (
            <AdminLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600">Không thể tải thông tin profile</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white shadow-sm border-b">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <User className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
                                    <p className="text-gray-600">Trung tâm quản lý thông tin cá nhân</p>
                                </div>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Lưu
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Hủy
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-600 w-20">Avatar</span>
                                    <span className="text-sm text-gray-500">150x150px JPEG, PNG Image (max 5MB)</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                                            {profile?.ProfilePicture ? (
                                                <img 
                                                    src={profile.ProfilePicture} 
                                                    alt={`Avatar của ${profile.FullName || 'Admin'}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <User className="h-8 w-8 text-blue-600" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            disabled={uploadingImage}
                                            className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                                        >
                                            {uploadingImage ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Camera className="h-4 w-4" />
                                            )}
                                        </button>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </div>
                                    {profile?.ProfilePicture && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Bạn có chắc muốn xóa ảnh đại diện?')) {
                                                    handleRemoveAvatar();
                                                }
                                            }}
                                            className="text-red-600 hover:text-red-700 text-sm"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Name */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4 flex-1">
                                    <span className="text-sm font-medium text-gray-600 w-20">Họ tên</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.FullName}
                                            onChange={(e) => setEditForm({...editForm, FullName: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập họ tên"
                                        />
                                    ) : (
                                        <span className="text-gray-900">{profile.FullName || 'Chưa cập nhật'}</span>
                                    )}
                                </div>
                                {!isEditing && (
                                    <Edit2 className="h-4 w-4 text-blue-600 cursor-pointer" onClick={() => setIsEditing(true)} />
                                )}
                            </div>

                            {/* Role */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-600 w-20">Vai trò</span>
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4 text-red-600" />
                                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                            {profile.RoleName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Username */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4 flex-1">
                                    <span className="text-sm font-medium text-gray-600 w-20">Username</span>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editForm.Username}
                                            onChange={(e) => setEditForm({...editForm, Username: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập username"
                                        />
                                    ) : (
                                        <span className="text-gray-900">{profile.Username}</span>
                                    )}
                                </div>
                                {!isEditing && (
                                    <Edit2 className="h-4 w-4 text-blue-600 cursor-pointer" onClick={() => setIsEditing(true)} />
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4 flex-1">
                                    <span className="text-sm font-medium text-gray-600 w-20">Email</span>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editForm.Email}
                                            onChange={(e) => setEditForm({...editForm, Email: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập email"
                                        />
                                    ) : (
                                        <span className="text-gray-900">{profile.Email}</span>
                                    )}
                                </div>
                                {!isEditing && (
                                    <Edit2 className="h-4 w-4 text-blue-600 cursor-pointer" onClick={() => setIsEditing(true)} />
                                )}
                            </div>

                            {/* Date of Birth */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4 flex-1">
                                    <span className="text-sm font-medium text-gray-600 w-20">Ngày sinh</span>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editForm.DateOfBirth}
                                            onChange={(e) => setEditForm({...editForm, DateOfBirth: e.target.value})}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <span className="text-gray-900">{formatDate(profile.DateOfBirth)}</span>
                                    )}
                                </div>
                                {!isEditing && (
                                    <Edit2 className="h-4 w-4 text-blue-600 cursor-pointer" onClick={() => setIsEditing(true)} />
                                )}
                            </div>

                            {/* Account Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-600 w-20">Trạng thái</span>
                                    <div className="flex items-center space-x-2">
                                        <UserCheck className="h-4 w-4 text-green-600" />
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                            {profile.IsDisabled ? 'Đã vô hiệu hóa' : 'Hoạt động'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Created Date */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-gray-600 w-20">Ngày tạo</span>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-600" />
                                        <span className="text-gray-900">{formatDate(profile.CreatedAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfilePage;
