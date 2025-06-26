import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { CommunityProgram, EnrollmentStatus } from '../../types/CommunityProgram';
import { parseDate } from '../../utils/parseDateUtils';
import { User } from '../../types/User';
import { toast } from 'react-toastify';

const CommunityProgramPage: React.FC = () => {
  const [events, setEvents] = useState<CommunityProgram[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<{ [key: number]: EnrollmentStatus }>({});
  const [loadingEnrollments, setLoadingEnrollments] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('token');

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

        const response = await fetch('http://localhost:5000/api/program', {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!response.ok) {
          if (response.status === 403) {
            const guestResponse = await fetch('http://localhost:5000/api/program', {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal
            });
            if (!guestResponse.ok) throw new Error(`HTTP error! status: ${guestResponse.status}`);
            const guestData = await guestResponse.json();
            setEvents(Array.isArray(guestData.data) ? guestData.data : []);
            setUser(null);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched events:', data);

        setEvents(Array.isArray(data.data) ? data.data : []);
        setUser(data.user || null);

        if (data.user && getAuthToken() && Array.isArray(data.data)) {
          await checkAllEnrollmentStatuses(data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const checkAllEnrollmentStatuses = async (programs: CommunityProgram[]) => {
    if (!Array.isArray(programs) || programs.length === 0) return;

    const statuses: { [key: number]: EnrollmentStatus } = {};
    const token = getAuthToken();

    if (!token) return;

    // Giới hạn số lượng request đồng thời để tối ưu hiệu suất
    const batchSize = 5;
    for (let i = 0; i < programs.length; i += batchSize) {
      const batch = programs.slice(i, i + batchSize);
      const promises = batch.map(async (program) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s
          const response = await fetch(`http://localhost:5000/api/program-attendee/${program.ProgramID}/enrollment-status`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            statuses[program.ProgramID] = data;
          } else if (response.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
            throw new Error('Unauthorized');
          }
        } catch (error) {
          console.error(`Error checking enrollment for program ${program.ProgramID}:`, error);
        }
      });
      await Promise.all(promises);
    }

    setEnrollmentStatuses(statuses);
  };

  const handleEnroll = async (programId: number) => {
    const token = getAuthToken();

    if (!token || !user) {
      toast.error('Vui lòng đăng nhập để tham gia chương trình');
      return;
    }

    setLoadingEnrollments(prev => ({ ...prev, [programId]: true }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s
      const response = await fetch(`http://localhost:5000/api/program-attendee/${programId}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (response.ok) {
        setEnrollmentStatuses(prev => ({
          ...prev,
          [programId]: {
            isEnrolled: true,
            status: 'registered',
            registrationDate: new Date().toISOString(),
            SurveyBeforeCompleted: false,
            SurveyAfterCompleted: false
          }
        }));
        toast.success(`Đăng ký tham gia thành công! ${data.message || ''}`);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(data.message || 'Có lỗi xảy ra khi đăng ký');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoadingEnrollments(prev => ({ ...prev, [programId]: false }));
    }
  };

  const handleUnenroll = async (programId: number) => {
    toast.warn(
      <div>
        <p className="mb-3 font-medium">Bạn có chắc chắn muốn hủy đăng ký?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss();
              performUnenroll(programId);
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600"
          >
            Xác nhận hủy
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm font-medium hover:bg-gray-600"
          >
            Giữ lại
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const performUnenroll = async (programId: number) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
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
            registrationDate: null,
            SurveyBeforeCompleted: false,
            SurveyAfterCompleted: false
          }
        }));
        toast.success(`Hủy đăng ký thành công! ${data.message || ''}`);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error(data.message || 'Có lỗi xảy ra khi hủy đăng ký');
      }
    } catch (error) {
      console.error('Unenrollment error:', error);
      toast.error('Có lỗi xảy ra khi hủy đăng ký');
    } finally {
      setLoadingEnrollments(prev => ({ ...prev, [programId]: false }));
    }
  };

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

    // Check if program is completed
    const isProgramCompleted = event.Status === 'completed';

    return (
      <div className="space-y-2">
        <Link
          to={`${event.ProgramID}`}
          className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Xem chi tiết
        </Link>

        {isProgramCompleted ? (
          <div className="text-center text-gray-600 font-medium text-sm bg-gray-100 py-3 rounded-lg">
            Chương trình đã hoàn thành
          </div>
        ) : isAuthenticated ? (
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
            onClick={() => toast.info('Vui lòng đăng nhập để tham gia chương trình')}
            className="w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            Tham gia
          </button>
        )}
      </div>
    );
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex items-center justify-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              Tin Tức Sự Kiện
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Khám phá các sự kiện phòng chống ma túy trực tuyến sắp diễn ra
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Buttons - Chỉ hiển thị Online */}
        <div className="flex justify-center mb-12">
          <button
            className="px-6 py-3 rounded-full font-medium bg-blue-600 text-white shadow-lg"
          >
            Sự kiện Online
          </button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.isArray(events) && events.map((event, index) => (
            <div key={event.ProgramID || index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
              {event.ImageUrl && (
                <div className="relative h-48">
                  <img
                    src={event.ImageUrl}
                    alt={event.ProgramName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Online
                    </span>
                  </div>
                  {/* Badge trạng thái chương trình */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${event.Status === 'upcoming' ? 'bg-blue-500' : event.Status === 'ongoing' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                      {event.Status === 'upcoming' ? 'Sắp diễn ra' : event.Status === 'ongoing' ? 'Đang diễn ra' : 'Đã hoàn thành'}
                    </span>
                  </div>
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                    </svg>
                    <a href={event.Url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                      {event.Url}
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">
                  {event.Description}
                </p>

                <div className="mt-auto">
                  {renderActionButton(event)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {Array.isArray(events) && events.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sự kiện nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              Hiện tại chưa có sự kiện Online nào được tổ chức.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityProgramPage;