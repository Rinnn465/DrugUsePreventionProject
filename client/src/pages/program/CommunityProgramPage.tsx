import { Link } from 'react-router-dom';
import React, { useEffect, useState, useMemo } from 'react';
import { Users, Filter, X, Calendar, Clock, MapPin, Star, Sparkles, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CommunityProgram, EnrollmentStatus } from '../../types/CommunityProgram';
import { parseDate } from '../../utils/parseDateUtils';
import { User } from '../../types/User';
import { toast } from 'react-toastify';
import Modal from '@/components/modal/ModalNotification';
import useModal from '@/hooks/useModal';

const CommunityProgramPage: React.FC = () => {
  const [events, setEvents] = useState<CommunityProgram[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<{ [key: number]: EnrollmentStatus }>({});
  const [loadingEnrollments, setLoadingEnrollments] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRegistrationStatus, setSelectedRegistrationStatus] = useState<string>('all');

  const { isOpen, openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const getAuthToken = () => localStorage.getItem('token');

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Hide completed programs for non-enrolled users
      if (event.Status === 'completed') {
        const enrollmentStatus = enrollmentStatuses[event.ProgramID];
        // If user is not enrolled, hide completed programs
        if (!enrollmentStatus?.isEnrolled) {
          return false;
        }
      }

      // Filter by status
      if (selectedStatus !== 'all' && event.Status !== selectedStatus) {
        return false;
      }

      // Filter by registration status
      if (selectedRegistrationStatus !== 'all') {
        const enrollmentStatus = enrollmentStatuses[event.ProgramID];
        if (selectedRegistrationStatus === 'registered' && !enrollmentStatus?.isEnrolled) {
          return false;
        }
        if (selectedRegistrationStatus === 'not_registered' && enrollmentStatus?.isEnrolled) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedStatus, selectedRegistrationStatus, enrollmentStatuses]);

  const clearFilters = () => {
    setSelectedStatus('all');
    setSelectedRegistrationStatus('all');
  };

  const hasActiveFilters = selectedStatus !== 'all' || selectedRegistrationStatus !== 'all';



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
        setError('Không thể tải danh sách chương trình. Vui lòng thử lại sau.');
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
      openModal();
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
        <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
          <p className="text-red-600 font-semibold text-sm">
            Chưa có thông tin chính thức
          </p>
        </div>
      );
    }

    // Check if program is completed
    const isProgramCompleted = event.Status === 'completed';

    return (
      <div className="space-y-3">
        <Link
          to={`${event.ProgramID}`}
          className="group inline-block w-full text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center gap-2">
            Thông tin chương trình
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        {/* Chương trình đã kết thúc */}
        {isProgramCompleted && (
          <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 py-4 rounded-2xl border border-green-200">
            <p className="text-green-700 font-semibold text-sm">Chương trình đã kết thúc</p>
          </div>
        )}

        {/* User đã đăng nhập và chương trình chưa kết thúc */}
        {!isProgramCompleted && isAuthenticated && (
          <>
                        {/* User đã đăng ký */}
            {enrollmentStatus?.isEnrolled && (
              <button
                onClick={() => handleUnenroll(event.ProgramID)}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  btn.classList.add('hovered');
                  const normalText = btn.querySelector('.normal-text') as HTMLElement;
                  const hoverText = btn.querySelector('.hover-text') as HTMLElement;
                  if (normalText) normalText.style.display = 'none';
                  if (hoverText) hoverText.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget;
                  btn.classList.remove('hovered');
                  const normalText = btn.querySelector('.normal-text') as HTMLElement;
                  const hoverText = btn.querySelector('.hover-text') as HTMLElement;
                  if (normalText) normalText.style.display = 'block';
                  if (hoverText) hoverText.style.display = 'none';
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-red-500 hover:to-pink-500 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full hover:translate-x-[-200%] transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang hủy...
                    </>
                  ) : (
                    <>
                      <span className="normal-text">✓ Đã đăng ký tham gia</span>
                      <span className="hover-text" style={{ display: 'none' }}>Hủy đăng ký</span>
                    </>
                  )}
                </span>
              </button>
            )}

            {/* User chưa đăng ký */}
            {!enrollmentStatus?.isEnrolled && (
              <button
                onClick={() => handleEnroll(event.ProgramID)}
                disabled={isLoading}
                className="group w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Đang đăng ký...
                    </>
                                     ) : (
                     <>
                       Tham gia ngay
                       <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                     </>
                   )}
                </span>
              </button>
            )}
          </>
        )}

        {/* User chưa đăng nhập và chương trình chưa kết thúc */}
        {!isProgramCompleted && !isAuthenticated && (
          <button
            onClick={() => openModal()}
            className="group w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
            <span className="relative flex items-center justify-center gap-2">
              Tham gia ngay
              <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            </span>
          </button>
        )}
      </div>
    );
  };

  // Skeleton Loading Component
  const ProgramCardSkeleton = () => (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-8">
        <div className="h-8 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section Skeleton */}
        <div className="bg-[#1f54cf]">
          <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="h-8 bg-white/20 rounded-lg w-64 animate-pulse"></div>
            </div>
            <div className="h-6 bg-white/15 rounded-lg w-3/4 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
           {/* Filter Skeleton */}
           <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 animate-pulse">
             <div className="h-5 sm:h-6 bg-gray-200 rounded-lg mb-4 sm:mb-6 w-1/2 sm:w-1/4"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
               <div className="h-10 sm:h-12 bg-gray-200 rounded-xl"></div>
               <div className="h-10 sm:h-12 bg-gray-200 rounded-xl"></div>
             </div>
           </div>

           {/* Cards Skeleton */}
           <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
             {[...Array(6)].map((_, index) => (
               <ProgramCardSkeleton key={index} />
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mx-auto flex items-center justify-center text-white text-4xl shadow-2xl">
              ⚠️
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Oops! Có lỗi xảy ra
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="group px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              Thử lại ngay
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Simple Hero Section */}
      <div className="bg-[#1f54cf]">
        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
              Chương Trình Cộng Đồng
            </h1>
          </div>
          <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Khám phá các chương trình phòng chống ma túy trực tuyến sắp diễn ra
          </p>
        </div>
      </div>

             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
         {/* Enhanced Filter Section */}
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title="Bạn cần đăng nhập"
          description="Vui lòng đăng nhập để tham gia chương trình này."
          confirmMessage="Đăng nhập ngay"
          confirmUrl={() => {
            navigate('/login');
          }}
        />
        
                 <div className="mb-8 sm:mb-12 lg:mb-16">
           <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12 hover:shadow-xl transition-all duration-300">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
               <div className="flex items-center gap-3 sm:gap-4">
                 <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl text-white shadow-lg">
                   <Filter className="h-5 w-5 sm:h-6 sm:w-6" />
                 </div>
                 <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                   Tìm chương trình phù hợp
                 </h2>
               </div>
               {hasActiveFilters && (
                 <button
                   onClick={clearFilters}
                   className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 rounded-lg sm:rounded-xl transition-all duration-300 border border-red-200 hover:border-red-300 sm:ml-auto"
                 >
                   <X className="h-3 w-3 sm:h-4 sm:w-4" />
                   Xóa bộ lọc
                 </button>
               )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Status Filter */}
              <div className="group">
                <label htmlFor="status-filter" className="block text-sm font-bold text-gray-700 mb-3">
                  Trạng thái chương trình
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                                     className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm hover:border-gray-300 transition-all duration-300 text-gray-700 font-medium"
                 >
                   <option value="all">Tất cả trạng thái</option>
                   <option value="upcoming">Sắp diễn ra</option>
                   <option value="ongoing">Đang diễn ra</option>
                   <option value="completed">Đã kết thúc</option>
                </select>
              </div>

              {/* Registration Status Filter */}
              {user && (
                <div className="group">
                  <label htmlFor="registration-status-filter" className="block text-sm font-bold text-gray-700 mb-3">
                    Trạng thái đăng ký của bạn
                  </label>
                  <select
                    id="registration-status-filter"
                    value={selectedRegistrationStatus}
                    onChange={(e) => setSelectedRegistrationStatus(e.target.value)}
                                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 bg-white/80 backdrop-blur-sm hover:border-gray-300 transition-all duration-300 text-gray-700 font-medium"
                   >
                     <option value="all">Tất cả</option>
                     <option value="registered">Đã đăng ký</option>
                     <option value="not_registered">Chưa đăng ký</option>
                  </select>
                </div>
              )}
            </div>

                         {/* Results Count */}
             <div className="mt-4 sm:mt-6 flex items-center gap-2 text-xs sm:text-sm">
               <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                 <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
               </div>
               <span className="text-gray-600">
                 Hiển thị <span className="font-bold text-blue-600 text-sm sm:text-lg">{filteredEvents.length}</span> / {events.length} chương trình
               </span>
             </div>
          </div>
        </div>

                 {/* Enhanced Events Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {Array.isArray(filteredEvents) && filteredEvents.map((event, index) => (
            <div key={event.ProgramID || index} className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
              {/* Enhanced Image Header */}
              <div className="relative h-64 overflow-hidden">
                {event.ImageUrl ? (
                  <img
                    src={event.ImageUrl}
                    alt={event.ProgramName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                    <div className="text-white text-6xl font-bold opacity-60 z-10">
                      📅
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
                  </div>
                )}
                
                                 {/* Status and Online Badge */}
                 <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                   <span className="px-3 py-1.5 text-xs font-medium rounded-full text-white bg-green-600 shadow-md">
                     Online
                   </span>
                   {event.Status === 'upcoming' && (
                     <span className="px-3 py-1.5 text-xs font-medium rounded-full text-white bg-blue-600 shadow-md">
                       Sắp diễn ra
                     </span>
                   )}
                   {event.Status === 'ongoing' && (
                     <span className="px-3 py-1.5 text-xs font-medium rounded-full text-white bg-orange-600 shadow-md animate-pulse">
                       Đang live
                     </span>
                   )}
                   {event.Status === 'completed' && (
                     <span className="px-3 py-1.5 text-xs font-medium rounded-full text-white bg-green-600 shadow-md">
                       Đã kết thúc
                     </span>
                   )}
                 </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

                             {/* Enhanced Content Section */}
               <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
                                 {/* Event Title */}
                 <div className="mb-4 sm:mb-6">
                   <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                     {event.ProgramName}
                   </h3>
                 </div>

                 {/* Event Details */}
                 <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                   <div className="flex items-center text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                     <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg sm:rounded-xl mr-3 sm:mr-4 group-hover:bg-blue-100 transition-colors duration-300">
                       <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                     </div>
                     <span className="font-semibold text-xs sm:text-sm">{parseDate(event.Date)}</span>
                   </div>
                 </div>

                 {/* Event Description */}
                 <p className="text-gray-600 mb-6 sm:mb-8 line-clamp-3 flex-grow text-sm sm:text-base leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                   {event.Description}
                 </p>

                {/* Enhanced Action Buttons */}
                <div className="mt-auto">
                  {renderActionButton(event)}
                </div>
              </div>
            </div>
          ))}
        </div>

                 {/* Enhanced Empty state - Filtered */}
         {Array.isArray(filteredEvents) && filteredEvents.length === 0 && events.length > 0 && (
           <div className="text-center py-12 sm:py-16 lg:py-20">
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-12 max-w-lg mx-auto">
               <div className="relative mb-6 sm:mb-8">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                   <Filter className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                 </div>
               </div>
               <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                 Không tìm thấy chương trình phù hợp
               </h3>
               <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-2">
                 Hãy thử điều chỉnh bộ lọc để tìm thấy chương trình phù hợp với bạn, hoặc hãy quay lại sau để xem các chương trình mới.
               </p>
               <button
                 onClick={clearFilters}
                 className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
               >
                 <span className="flex items-center gap-2">
                   <X className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform" />
                   Xóa tất cả bộ lọc
                 </span>
               </button>
             </div>
           </div>
         )}

         {/* Enhanced Empty state - No events at all */}
         {Array.isArray(events) && events.length === 0 && (
           <div className="text-center py-12 sm:py-16 lg:py-20">
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-gray-200 p-6 sm:p-8 lg:p-12 max-w-lg mx-auto">
               <div className="relative mb-6 sm:mb-8">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                   <Calendar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                 </div>
               </div>
               <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
                 Chưa có chương trình nào
               </h3>
               <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base px-2">
                 Hiện tại chưa có chương trình nào được tổ chức. Hãy quay lại sau để khám phá các chương trình phòng chống ma túy thú vị nhé!
               </p>
               <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                 <div className="flex items-center gap-1">
                   <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                   <span>Luôn miễn phí</span>
                 </div>
                 <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                 <div className="flex items-center gap-1">
                   <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />
                   <span>Chất lượng cao</span>
                 </div>
               </div>
             </div>
           </div>
         )}
      </div>
    </div>
  );
};

export default CommunityProgramPage;