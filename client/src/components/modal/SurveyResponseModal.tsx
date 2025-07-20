import React, { useState, useEffect, useCallback } from 'react';
import { X, User, Calendar, FileText, MessageSquare } from 'lucide-react';

interface SurveyResponseData {
  ResponseID: number;
  SurveyType: 'before' | 'after';
  ResponseData: Record<string, unknown>; // Changed from any
  ProcessedData?: { [key: string]: { value: unknown; displayText: string } }; // Changed from any
  CreatedAt: string;
  FullName: string;
  Email: string;
  ProgramName?: string;
}

interface SurveyResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  accountId: number;
  attendeeName: string;
}

const SurveyResponseModal: React.FC<SurveyResponseModalProps> = ({
  isOpen,
  onClose,
  programId,
  accountId,
  attendeeName
}) => {
  const [responses, setResponses] = useState<SurveyResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponseData | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  const fetchSurveyResponses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/survey/responses/${programId}/${accountId}`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponses(data);
        if (data.length > 0) {
          setSelectedResponse(data[0]);
        }
      } else {
        console.error('Failed to fetch survey responses');
      }
    } catch (error) {
      console.error('Error fetching survey responses:', error);
    } finally {
      setLoading(false);
    }
  }, [programId, accountId]);

  useEffect(() => {
    if (isOpen && programId && accountId) {
      fetchSurveyResponses();
    }
  }, [isOpen, programId, accountId, fetchSurveyResponses]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderSurveyContent = (response: SurveyResponseData) => {
    // Sử dụng ProcessedData nếu có, fallback về ResponseData
    const data = response.ProcessedData || response.ResponseData;
    
    // Helper function để lấy giá trị an toàn
    const safeGetValue = (key: string): string => {
      if (data && typeof data === 'object' && key in data) {
        const value = data[key];
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null && 'displayText' in value) {
          return (value as { displayText: string }).displayText;
        }
        return String(value);
      }
      return 'Không có thông tin';
    };
    
    if (response.SurveyType === 'before') {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Thông tin cá nhân</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Họ tên:</span>
                <p className="font-medium">{safeGetValue('fullName')}</p>
              </div>
              <div>
                <span className="text-gray-600">Tuổi:</span>
                <p className="font-medium">{safeGetValue('age')}</p>
              </div>
              <div>
                <span className="text-gray-600">Nghề nghiệp:</span>
                <p className="font-medium">{safeGetValue('occupation')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Kinh nghiệm và kỳ vọng</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Kinh nghiệm trước đây:</span>
                <p className="font-medium mt-1">{safeGetValue('experience')}</p>
              </div>
              <div>
                <span className="text-gray-600">Kỳ vọng từ chương trình:</span>
                <p className="font-medium mt-1">{safeGetValue('expectation')}</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Đánh giá chung</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Mức độ hài lòng:</span>
                <p className="font-medium">{safeGetValue('overallSatisfaction')}</p>
              </div>
              <div>
                <span className="text-gray-600">Kiến thức thu được:</span>
                <p className="font-medium">{safeGetValue('knowledgeGained')}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Phản hồi chi tiết</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Thay đổi hành vi:</span>
                <p className="font-medium mt-1">{safeGetValue('behaviorChange')}</p>
              </div>
              <div>
                <span className="text-gray-600">Khuyến nghị:</span>
                <p className="font-medium mt-1">{safeGetValue('recommendation')}</p>
              </div>
              <div>
                <span className="text-gray-600">Đề xuất cải thiện:</span>
                <p className="font-medium mt-1">{safeGetValue('improvements')}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Phản hồi khảo sát - {attendeeName}
              </h2>
              <p className="text-sm text-gray-600">
                Xem chi tiết phản hồi khảo sát của người tham gia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Danh sách khảo sát */}
          <div className="w-1/3 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Danh sách khảo sát</h3>
              
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {!loading && responses.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có phản hồi khảo sát</p>
                </div>
              )}
              
              {!loading && responses.length > 0 && (
                <div className="space-y-2">
                  {responses.map((response) => (
                    <button
                      key={response.ResponseID}
                      onClick={() => setSelectedResponse(response)}
                      className={`w-full p-3 text-left rounded-lg border transition-colors ${
                        selectedResponse?.ResponseID === response.ResponseID
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="font-medium text-sm">
                          Khảo sát {response.SurveyType === 'before' ? 'trước' : 'sau'} chương trình
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(response.CreatedAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main content - Chi tiết khảo sát */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {selectedResponse ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Khảo sát {selectedResponse.SurveyType === 'before' ? 'trước' : 'sau'} chương trình
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Thời gian: {formatDate(selectedResponse.CreatedAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Người trả lời: {selectedResponse.FullName}</span>
                      </div>
                    </div>
                  </div>

                  {renderSurveyContent(selectedResponse)}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Chọn một khảo sát để xem chi tiết</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResponseModal;
