import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CommunityProgram, EnrollmentStatus } from "../../types/CommunityProgram";
import { parseDate } from "../../utils/parseDateUtils";
import { User } from "../../types/User";
import { toast } from 'react-toastify';
import { Survey } from "../../types/Survey";


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
        <div className="mt-6">
          <Link to={beforeSurveyUrl}>
            <button className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200">
              Khảo sát trước sự kiện
            </button>
          </Link>
        </div>
      );
    } else if ((programData.Status === 'completed' || programData.Status === 'ongoing') && afterSurvey && !isAfterCompleted) {
      console.log('✅ Rendering after survey button with URL:', afterSurveyUrl);
      return (
        <div className="mt-6">
          <Link to={afterSurveyUrl}>
            <button className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200">
              Khảo sát sau sự kiện
            </button>
          </Link>
        </div>
      );
    }

    console.log('No survey conditions met');
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!programData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy chương trình</h2>
          <Link to="/community-programs">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Quay lại danh sách
            </button>
          </Link>
        </div>
      </div>
    );
  }

  console.log(programData);


  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-6 md:px-16 space-y-12">
        <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">{programData.ProgramName}</h1>

          <div className="grid gap-4 text-gray-700">
            <div className="text-lg">
              <strong className="block font-semibold">🗓 Thời gian:</strong>
              {parseDate(programData.Date)}
            </div>
            <div className="text-lg">
              <strong className="block font-semibold">📡 Liên kết:</strong>
              <a href={programData.Url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {programData.Url}
              </a>
            </div>
            <div className="text-base">
              <strong className="block font-semibold">📄 Mô tả:</strong>
              {programData.Description}
            </div>
            <div className="text-base">
              <strong className="block font-semibold">👥 Đơn vị tổ chức:</strong>
              {programData.Organizer}
            </div>
            <div className="text-base">
              <strong className="block font-semibold">🔄 Trạng thái:</strong>
              {programData.Status === 'upcoming' ? 'Sắp diễn ra' : programData.Status === 'ongoing' ? 'Đang diễn ra' : 'Đã hoàn thành'}
            </div>
          </div>

          {handleRenderSurveyForm()}

          {programData.ImageUrl && (
            <figure className="mt-10">
              <img
                src={programData.ImageUrl}
                alt={programData.ProgramName}
                className="w-full h-auto rounded-lg object-cover shadow-sm"
              />
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                Hình ảnh minh họa cho sự kiện
              </figcaption>
            </figure>
          )}

          {user && (
            <div className="mt-6 space-y-2">
              {programData.Status === 'completed' ? (
                <div className="text-center text-gray-600 font-medium text-sm bg-gray-100 py-3 rounded-lg">
                  Chương trình đã hoàn thành
                </div>
              ) : !enrollmentStatus?.isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tham gia
                </button>
              ) : (
                <button
                  onClick={handleUnenroll}
                  className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy tham gia
                </button>
              )}
            </div>
          )}
        </div>

        <Link to="/community-programs">
          <button className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
            Quay lại danh sách sự kiện
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CommunityProgramDetails;