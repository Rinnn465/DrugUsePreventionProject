import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CommunityProgram, EnrollmentStatus } from "../../types/CommunityProgram";
import { parseDate } from "../../utils/parseDateUtils";
import { User } from "../../types/User";
import { toast } from 'react-toastify';
import { Survey } from "../../types/Survey";
import {
  Calendar,
  Users,
  ExternalLink,
  FileText,
  User as UserIcon,
  Star,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  Clock4
} from 'lucide-react';

const CommunityProgramDetails: React.FC = () => {
  const { programId } = useParams();
  const [programData, setProgramData] = useState<CommunityProgram | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(null);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  const getAuthToken = () => localStorage.getItem('token');
  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

        const response = await fetch(`http://localhost:5000/api/program/${programId}`, {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setProgramData(data.data);
        setUser(data.user || null);
      } catch (error) {
        console.error('Error fetching program data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSurveys = async () => {
      try {
        console.log('Fetching surveys for program:', programId);
        const response = await fetch(`http://localhost:5000/api/program-survey/${programId}`, {
          method: 'GET',
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const surveysData = await response.json();
          console.log('Surveys data received:', surveysData);
          setSurveys(surveysData);
        } else {
          console.error('Failed to fetch surveys:', response.status, await response.text());
          setSurveys([]);
        }
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setSurveys([]);
      }
    };

    const checkEnrollmentStatus = async () => {
      const token = getAuthToken();
      if (token && programId) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s
          const response = await fetch(`http://localhost:5000/api/program-attendee/${programId}/enrollment-status`, {
            headers: getAuthHeaders(),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            setEnrollmentStatus(data);
          } else if (response.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Error checking enrollment status:', error);
        }
      }
    };

    fetchProgramData();
    checkEnrollmentStatus();
    fetchSurveys();
  }, [programId]);

  const handleEnroll = async () => {
    const token = getAuthToken();
    if (!token || !user) {
      toast.error('Vui lòng đăng nhập để tham gia chương trình');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s
      const response = await fetch(`http://localhost:5000/api/program-attendee/${programId}/enroll`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      if (response.ok) {
        setEnrollmentStatus({
          isEnrolled: true,
          status: 'registered',
          registrationDate: new Date().toISOString(),
          SurveyBeforeCompleted: false,
          SurveyAfterCompleted: false
        });
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
    }
  };

  const handleUnenroll = async () => {
    toast.warn(
      <div>
        <p className="mb-3 font-medium">Bạn có chắc chắn muốn hủy đăng ký?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss();
              performUnenroll();
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

  const performUnenroll = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout 5s
      const response = await fetch(`http://localhost:5000/api/program-attendee/${programId}/unenroll`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok) {
        setEnrollmentStatus({
          isEnrolled: false,
          status: null,
          registrationDate: null,
          SurveyBeforeCompleted: false,
          SurveyAfterCompleted: false
        });
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
    }
  };

  const handleRenderSurveyForm = () => {
    console.log('=== SURVEY FORM DEBUG ===');
    console.log('programData:', programData);
    console.log('surveys:', surveys);
    console.log('surveys.length:', surveys.length);
    console.log('enrollmentStatus?.isEnrolled:', enrollmentStatus?.isEnrolled);

    if (!programData || !surveys.length || !enrollmentStatus?.isEnrolled) {
      console.log('Missing requirements for survey form');
      return null;
    }


    console.log(surveys);

    const beforeSurvey = surveys.find(s => s.Type === 'before');
    const afterSurvey = surveys.find(s => s.Type === 'after');
    const isBeforeCompleted = enrollmentStatus?.SurveyBeforeCompleted;
    const isAfterCompleted = enrollmentStatus?.SurveyAfterCompleted;

    console.log('Survey check:', { beforeSurvey, afterSurvey, isBeforeCompleted, isAfterCompleted });
    console.log('Program status:', programData.Status);

    // Tạo URL đơn giản hơn (bỏ surveyId)
    const beforeSurveyUrl = `/survey/${programData.ProgramID}/before`;
    const afterSurveyUrl = `/survey/${programData.ProgramID}/after`;


    if (programData.Status === 'upcoming' && beforeSurvey && !isBeforeCompleted) {
      console.log('✅ Rendering before survey button with URL:', beforeSurveyUrl);
      return (
        <Link to={beforeSurveyUrl}>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Star className="h-5 w-5 mr-2" />
            Khảo sát trước sự kiện
          </button>
        </Link>
      );
    } else if ((programData.Status === 'completed' || programData.Status === 'ongoing') && afterSurvey && !isAfterCompleted) {
      console.log('✅ Rendering after survey button with URL:', afterSurveyUrl);
      return (
        <Link to={afterSurveyUrl}>
          <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <Star className="h-5 w-5 mr-2" />
            Khảo sát sau sự kiện
          </button>
        </Link>
      );
    }

    console.log('No survey conditions met');
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-blue-800">Đang tải thông tin sự kiện...</p>
          <p className="text-sm text-blue-600 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md mx-4">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy chương trình</h2>
          <p className="text-gray-600 mb-6">Chương trình bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/community-programs">
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại danh sách
            </button>
          </Link>
        </div>
      </div>
    );
  }

  console.log(programData);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'upcoming':
        return {
          text: 'Sắp diễn ra',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: Clock4
        };
      case 'ongoing':
        return {
          text: 'Đang diễn ra',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircle
        };
      case 'completed':
        return {
          text: 'Đã kết thúc',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: CheckCircle
        };
      default:
        return {
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: AlertCircle
        };
    }
  };

  const statusConfig = getStatusConfig(programData.Status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/community-programs"
              className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Quay lại
            </Link>
            <div className={`inline-flex items-center px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} font-medium`}>
              <StatusIcon className="h-5 w-5 mr-2" />
              {statusConfig.text}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {programData.ProgramName}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-blue-100">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-medium">{parseDate(programData.Date)}</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">{programData.Organizer}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Details Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Thông tin chương trình</h2>
              </div>

              <div className="prose max-w-none space-y-6">
                {/* Program Image */}
                {programData.ImageUrl && (
                  <div className="mb-6">
                    <img
                      src={programData.ImageUrl}
                      alt={programData.ProgramName}
                      className="w-full h-80 object-cover rounded-xl shadow-lg"
                    />
                  </div>
                )}

                {/* Program Content (Detailed information) */}
                {programData.Content && (
                  <div>
                    <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                      {programData.Content}
                    </div>
                  </div>
                )}

                {/* Fallback if neither Description nor Content is available */}
                {!programData.Description && !programData.Content && (
                  <p className="text-gray-500 text-base italic">
                    Thông tin chi tiết chưa được cập nhật.
                  </p>
                )}
              </div>
            </div>

            {/* Survey Section */}
            {handleRenderSurveyForm() && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 rounded-full p-3 mr-4">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Khảo sát</h2>
                </div>
                {handleRenderSurveyForm()}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin nhanh</h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ngày diễn ra</p>
                    <p className="text-gray-600">{parseDate(programData.Date)}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Đơn vị tổ chức</p>
                    <p className="text-gray-600">{programData.Organizer}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            {user && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Hành động</h3>

                <div className="space-y-4">
                  {/* Chương trình đã kết thúc */}
                  {programData.Status === 'completed' && (
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Chương trình đã kết thúc</p>
                    </div>
                  )}

                  {/* Chưa đăng ký */}
                  {programData.Status !== 'completed' && !enrollmentStatus?.isEnrolled && (
                    <button
                      onClick={handleEnroll}
                      className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Tham gia sự kiện
                    </button>
                  )}

                  {/* Đã đăng ký */}
                  {programData.Status !== 'completed' && enrollmentStatus?.isEnrolled && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center p-4 bg-green-50 rounded-xl">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">Đã đăng ký tham gia</span>
                      </div>
                      
                      {/* Hiển thị nút tham gia meeting khi chương trình đang diễn ra */}
                      {programData.Status === 'ongoing' && programData.ZoomLink && (
                        <a
                          href={programData.ZoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <ExternalLink className="h-5 w-5 mr-2" />
                          Tham gia Meeting ngay
                        </a>
                      )}
                      
                      <button
                        onClick={handleUnenroll}
                        className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Hủy tham gia
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Need Login Card */}
            {!user && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Đăng nhập để tham gia</h3>
                  <p className="text-gray-600 mb-4">Bạn cần đăng nhập để có thể đăng ký tham gia sự kiện này.</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Đăng nhập ngay
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityProgramDetails;