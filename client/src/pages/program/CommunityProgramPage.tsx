import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { CommunityProgram, EnrollmentStatus } from '../../types/CommunityProgram';
import { parseDate } from '../../utils/parseDateUtils';
import { User } from '../../types/User';

const CommunityProgramPage: React.FC = () => {
    const [eventSelected, setEventSelected] = useState<string>('online');
    const [events, setEvents] = useState<CommunityProgram[]>([]); // Đảm bảo khởi tạo là array rỗng
    const [user, setUser] = useState<User | null>(null);
    const [enrollmentStatuses, setEnrollmentStatuses] = useState<{ [key: number]: EnrollmentStatus }>({});
    const [loadingEnrollments, setLoadingEnrollments] = useState<{ [key: number]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(true); // Thêm loading state
    const [error, setError] = useState<string | null>(null); // Thêm error state

    // Hàm lấy token xác thực từ localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Hàm tạo headers cho các request cần xác thực
    const getAuthHeaders = () => {
        const token = getAuthToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };


    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                setLoading(true);
                setError(null);

                // Thử gọi API với headers authentication
                const response = await fetch('http://localhost:5000/api/program', {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    credentials: 'include'
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                if (!response.ok) {
                    if (response.status === 403) {
                        // Nếu 403, thử gọi lại mà không có auth headers (cho Guest)
                        const guestResponse = await fetch('http://localhost:5000/api/program', {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        });

                        if (!guestResponse.ok) {
                            throw new Error(`HTTP error! status: ${guestResponse.status}`);
                        }

                        const guestData = await guestResponse.json();
                        console.log('Guest data:', guestData);

                        // Đảm bảo data.data là array
                        setEvents(Array.isArray(guestData.data) ? guestData.data : []);
                        setUser(null); // Guest user
                        return;
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                }

                const data = await response.json();
                console.log('Fetched events:', data);

                // Đảm bảo data.data là array trước khi set
                setEvents(Array.isArray(data.data) ? data.data : []);
                setUser(data.user || null);

                // Nếu user đã đăng nhập, kiểm tra trạng thái đăng ký
                if (data.user && getAuthToken() && Array.isArray(data.data)) {
                    await checkAllEnrollmentStatuses(data.data);
                }
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
                setEvents([]); // Đảm bảo events luôn là array
            } finally {
                setLoading(false);
            }
        };
        fetchPrograms();
    }, []);

    // Kiểm tra trạng thái đăng ký cho tất cả chương trình
    const checkAllEnrollmentStatuses = async (programs: CommunityProgram[]) => {
        if (!Array.isArray(programs) || programs.length === 0) return;

        const statuses: { [key: number]: EnrollmentStatus } = {};
        const token = getAuthToken();

        if (!token) return;

        for (const program of programs) {
            try {
                const response = await fetch(`http://localhost:5000/api/program-attendee/${program.ProgramID}/enrollment-status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    statuses[program.ProgramID] = data;
                } else if (response.status === 401) {
                    // Token hết hạn hoặc không hợp lệ
                    localStorage.removeItem('token');
                    setUser(null);
                    break;
                }
            } catch (error) {
                console.error(`Error checking enrollment for program ${program.ProgramID}:`, error);
            }
        }

        setEnrollmentStatuses(statuses);
    };

    // Xử lý đăng ký tham gia
    const handleEnroll = async (programId: number) => {
        const token = getAuthToken();

        if (!token || !user) {
            alert('Vui lòng đăng nhập để tham gia chương trình');
            return;
        }

        setLoadingEnrollments(prev => ({ ...prev, [programId]: true }));

        try {
            const response = await fetch(`http://localhost:5000/api/program-attendee/${programId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setEnrollmentStatuses(prev => ({
                    ...prev,
                    [programId]: {
                        isEnrolled: true,
                        status: 'registered',
                        registrationDate: new Date().toISOString()
                    }
                }));
                alert(`Đăng ký tham gia thành công! ${data.message || ''}`);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                alert(data.message || 'Có lỗi xảy ra khi đăng ký');
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            alert('Có lỗi xảy ra khi đăng ký');
        } finally {
            setLoadingEnrollments(prev => ({ ...prev, [programId]: false }));
        }
    };

    // Xử lý hủy đăng ký
    const handleUnenroll = async (programId: number) => {
        if (!confirm('Bạn có chắc chắn muốn hủy đăng ký tham gia chương trình này?')) {
            return;
        }

        const token = getAuthToken();
        if (!token) {
            alert('Vui lòng đăng nhập để thực hiện thao tác này');
            return;
        }

        setLoadingEnrollments(prev => ({ ...prev, [programId]: true }));

        try {
            const response = await fetch(`http://localhost:5000/api/program-attendee/${programId}/unenroll`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                setEnrollmentStatuses(prev => ({
                    ...prev,
                    [programId]: {
                        isEnrolled: false,
                        status: null,
                        registrationDate: null
                    }
                }));
                alert(`Hủy đăng ký thành công! ${data.message || ''}`);
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                setUser(null);
                alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                alert(data.message || 'Có lỗi xảy ra khi hủy đăng ký');
            }
        } catch (error) {
            console.error('Unenrollment error:', error);
            alert('Có lỗi xảy ra khi hủy đăng ký');
        } finally {
            setLoadingEnrollments(prev => ({ ...prev, [programId]: false }));
        }
    };

    // Render các nút hành động
    const renderActionButton = (event: CommunityProgram) => {
        const enrollmentStatus = enrollmentStatuses[event.ProgramID];
        const isLoading = loadingEnrollments[event.ProgramID];
        const isAuthenticated = user && getAuthToken();

        if (event.IsDisabled) {
            return (
                <p className="text-center text-red-600 font-medium">
                    Chưa có thông tin chính thức
                </p>
            );
        }

        return (
            <div className="space-y-2">
                <Link
                    to={`${event.ProgramID}`}
                    className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                    Xem chi tiết
                </Link>

                {isAuthenticated ? (
                    enrollmentStatus?.isEnrolled ? (
                        <div className="space-y-2">
                            <div className="text-center text-green-600 font-medium text-sm bg-green-50 py-2 rounded-lg">
                                ✓ Đã đăng ký tham gia
                            </div>
                            <button
                                onClick={() => handleUnenroll(event.ProgramID)}
                                disabled={isLoading}
                                className="w-full px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Đang hủy...' : 'Hủy đăng ký'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleEnroll(event.ProgramID)}
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Đang đăng ký...' : 'Tham gia'}
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => alert('Vui lòng đăng nhập để tham gia chương trình')}
                        className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                        Tham gia
                    </button>
                )}
            </div>
        );
    };

    // Hiển thị loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải danh sách sự kiện...</p>
                </div>
            </div>
        );
    }

    // Hiển thị error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Tin tức sự kiện</h1>
                    <p className="text-lg text-gray-600">Khám phá các sự kiện phòng chống ma túy sắp diễn ra</p>
                    {user && (
                        <p className="text-sm text-green-600 mt-2">
                            Chào mừng, {user.Fullname || user.Username}!
                        </p>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex justify-center space-x-4 mb-12">
                    <button
                        onClick={() => setEventSelected('online')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${eventSelected === 'online'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Sự kiện Online
                    </button>
                    <button
                        onClick={() => setEventSelected('offline')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${eventSelected === 'offline'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Sự kiện Offline
                    </button>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.isArray(events) && events
                        .filter(event => event.Type === eventSelected)
                        .map((event, index) => (
                            <div key={event.ProgramID || index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                {event.ImageUrl && (
                                    <div className="relative h-48">
                                        <img
                                            src={event.ImageUrl}
                                            alt={event.ProgramName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.Type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {event.Type === 'online' ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        {/* Badge trạng thái đăng ký */}
                                        {enrollmentStatuses[event.ProgramID]?.isEnrolled && (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                                                    Đã đăng ký
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold min-h-[56px] text-gray-900 mb-2 line-clamp-2">{event.ProgramName}</h3>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{parseDate(event.Date)}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{event.Location}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {event.Description}
                                    </p>

                                    {/* Action Buttons */}
                                    {renderActionButton(event)}
                                </div>
                            </div>
                        ))}
                </div>

                {/* Empty state */}
                {Array.isArray(events) && events.filter(event => event.Type === eventSelected).length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sự kiện nào</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Hiện tại chưa có sự kiện {eventSelected === 'online' ? 'Online' : 'Offline'} nào được tổ chức.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityProgramPage;