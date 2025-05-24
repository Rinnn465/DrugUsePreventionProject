import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, AlertTriangle, InfoIcon } from 'lucide-react';
import { assessmentData } from '../data/assessmentData';

const AssessmentsPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Công Cụ Đánh Giá Nguy Cơ</h1>
          <p className="text-lg text-gray-600 mb-8">
            Hãy thực hiện các bảng câu hỏi của chúng tôi để đánh giá mức độ rủi ro và nhận được khuyến nghị cá nhân hóa.
          </p>

          <div className="bg-accent-50 border border-accent-200 rounded-lg p-6 mb-12 text-left">
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
                  <strong>Lưu ý:</strong> Những công cụ này không thay thế cho chẩn đoán chuyên môn. Nếu bạn lo ngại về việc sử dụng chất kích thích, vui lòng tham khảo ý kiến chuyên gia y tế.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {assessmentData.map((assessment) => (
            <div key={assessment.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full bg-${assessment.color}-100 text-${assessment.color}-600`}>
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
                    <p className="h-[96px] text-gray-600 mb-4">{assessment.description}</p>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Đề xuất cho:</h4>
                      <div className="flex flex-wrap gap-2">
                        {assessment.audiences.map((audience, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {audience}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>{assessment.questionCount} câu hỏi</span>
                        <span className="mx-2">•</span>
                        <span>~{assessment.timeToComplete} phút</span>
                      </div>
                      <Link
                        to={`/assessments/${assessment.id}`}
                        className={`bg-primary-600 text-white font-medium py-2 px-4 rounded hover:bg-${assessment.color}-700 transition-colors`}
                      >
                        Bắt đầu đánh giá
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 p-6 bg-warning-50 border border-warning-200 rounded-lg">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-warning-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-warning-800 mb-2">Cần hỗ trợ khẩn cấp?</h3>
              <p className="text-warning-700 mb-4">
                Nếu bạn hoặc ai đó đang gặp tình trạng khẩn cấp liên quan đến sử dụng chất kích thích hoặc khủng hoảng tâm lý,
                vui lòng liên hệ với dịch vụ khẩn cấp hoặc đường dây hỗ trợ ngay lập tức.
              </p>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <p className="font-semibold text-gray-800 mb-2">Đường dây nóng quốc gia:</p>
                <ul className="space-y-2 text-gray-700">
                  <li>Cơ quan Quản lý Dịch vụ Sức khỏe Tâm thần và Lạm dụng Chất (SAMHSA): 1-800-662-HELP (4357)</li>
                  <li>Đường dây Phòng chống Tự tử Quốc gia: 1-800-273-TALK (8255)</li>
                  <li>Đường dây nhắn tin khẩn cấp: Gửi từ khóa HOME đến 741741</li>
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
