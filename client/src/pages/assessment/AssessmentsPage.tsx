import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, AlertTriangle, InfoIcon, Filter, X } from 'lucide-react';
import { assessmentData } from '../../data/assessmentData';

type AssessmentColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
const colorMap: Record<AssessmentColor, { gradient: string; text: string; badge: string; button: string }> = {
  primary: {
    gradient: 'from-primary-100 to-primary-50',
    text: 'text-primary-700',
    badge: 'bg-primary-100 text-primary-700',
    button: 'from-primary-500 to-primary-400 hover:from-primary-600 hover:to-primary-600',
  },
  secondary: {
    gradient: 'from-secondary-100 to-secondary-50',
    text: 'text-secondary-700',
    badge: 'bg-secondary-100 text-secondary-700',
    button: 'from-secondary-500 to-secondary-400 hover:from-secondary-600 hover:to-secondary-600',
  },
  accent: {
    gradient: 'from-accent-100 to-accent-50',
    text: 'text-accent-700',
    badge: 'bg-accent-100 text-accent-700',
    button: 'from-accent-500 to-accent-400 hover:from-accent-600 hover:to-accent-600',
  },
  success: {
    gradient: 'from-success-100 to-success-50',
    text: 'text-success-700',
    badge: 'bg-success-100 text-success-700',
    button: 'from-success-500 to-success-400 hover:from-success-600 hover:to-success-600',
  },
  warning: {
    gradient: 'from-warning-100 to-warning-50',
    text: 'text-warning-700',
    badge: 'bg-warning-100 text-warning-700',
    button: 'from-warning-500 to-warning-400 hover:from-warning-600 hover:to-warning-600',
  },
  error: {
    gradient: 'from-error-100 to-error-50',
    text: 'text-error-700',
    badge: 'bg-error-100 text-error-700',
    button: 'from-error-500 to-error-400 hover:from-error-600 hover:to-error-600',
  },
};

const AssessmentsPage: React.FC = () => {
  const [selectedAudience, setSelectedAudience] = useState<string>('all');

  // Get unique audiences from assessment data
  const audiences = useMemo(() => {
    const allAudiences = assessmentData.flatMap(assessment => assessment.audiences);
    return [...new Set(allAudiences)];
  }, []);

  // Filter assessments based on selected filters
  const filteredAssessments = useMemo(() => {
    return assessmentData.filter(assessment => {
      // Filter by audience
      if (selectedAudience !== 'all' && !assessment.audiences.includes(selectedAudience)) {
        return false;
      }

      return true;
    });
  }, [selectedAudience]);

  const clearFilters = () => {
    setSelectedAudience('all');
  };

  const hasActiveFilters = selectedAudience !== 'all';

  return (
    <div className="bg-gray-50 min-h-screen">
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
                <ClipboardCheck className="h-6 w-6" />
              </div>
              Trắc Nghiệm Đánh Giá
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Hãy thực hiện các bài trắc nghiệm của chúng tôi để đánh giá mức độ rủi ro và nhận được khuyến nghị cá nhân hóa
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto mb-12">
          {/* Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Lọc bài trắc nghiệm</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Audience Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Đối tượng
                </label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Tất cả đối tượng</option>
                  {audiences.map((audience) => (
                    <option key={audience} value={audience}>
                      mọi người
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-blue-600">{filteredAssessments.length}</span> / {assessmentData.length} bài trắc nghiệm
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mb-8 text-left">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <InfoIcon className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-accent-800 mb-2">Về các công cụ đánh giá của chúng tôi</h3>
                <p className="text-accent-700 mb-4">
                  Những khảo sát tiêu chuẩn này giúp xác định mức độ rủi ro tiềm ẩn và hướng dẫn bước tiếp theo phù hợp.
                  Câu trả lời của bạn sẽ được bảo mật và chỉ dùng để cung cấp khuyến nghị cá nhân hóa.
                </p>
                <p className="text-accent-700">
                  <strong>Lưu ý:</strong> Những công cụ này không thay thế cho chẩn đoán chuyên môn. Nếu bạn lo ngại về việc sử dụng các chất gây nghiện, vui lòng tham khảo ý kiến chuyên gia y tế.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <ClipboardCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Không tìm thấy bài trắc nghiệm phù hợp
                </h3>
                <p className="text-gray-500 mb-4">
                  Hãy thử điều chỉnh bộ lọc để tìm thấy bài trắc nghiệm phù hợp với bạn.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            </div>
          ) : (
            filteredAssessments.map((assessment) => {
            const colorKey = (assessment.color || 'primary') as AssessmentColor;
            return (
              <div key={assessment.id} className="bg-gradient-to-br from-white via-primary-50 to-accent-50 rounded-2xl shadow-2xl overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 border-accent-100 animate-fade-in">
                <div className="p-6">
                  <div className="flex items-center gap-6">
                    <div className={`flex-shrink-0 p-4 rounded-full bg-gradient-to-br ${colorMap[colorKey].gradient} ${colorMap[colorKey].text} shadow-lg`}>
                      <ClipboardCheck className="h-10 w-10" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-grow">
                          <h3 className={`text-2xl font-bold mb-2 ${colorMap[colorKey].text}`}>{assessment.title}</h3>
                          <p className="text-gray-600 mb-4 font-medium text-lg leading-relaxed">{assessment.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="text-sm font-semibold text-gray-700">Đề xuất cho:</span>
                              <span
                                className={`text-sm px-3 py-1 rounded-full font-bold shadow ${colorMap[colorKey].badge}`}
                              >
                                mọi người
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Link
                            to={`/assessments/${assessment.id}`}
                            className={`inline-block bg-gradient-to-r ${colorMap[colorKey].button} text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl text-lg`}
                          >
                            Bắt đầu đánh giá
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })
          )}
        </div>

        <div className="max-w-4xl mx-auto mt-12 p-6 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-warning-800 mb-2">Cần hỗ trợ khẩn cấp?</h3>
              <p className="text-warning-700 mb-4">
                Nếu bạn hoặc ai đó đang gặp tình trạng khẩn cấp liên quan đến sử dụng các chất gây nghiện hoặc khủng hoảng tâm lý,
                vui lòng liên hệ với dịch vụ khẩn cấp hoặc đường dây hỗ trợ ngay lập tức.
              </p>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">Đường dây nóng quốc gia:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>Cơ quan Tư vẫn chăm sóc Sức khỏe Tâm thần: 0784604598</li>
                  <li>Cơ quan cấp cứu về ý tế: 115</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentsPage;
