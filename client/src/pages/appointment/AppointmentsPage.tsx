import React, { useEffect, useState } from 'react';
import { Users, Search, Calendar as CalendarIcon, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import CounselorCard from '../../components/counselors/CounselorCard';
import { useLocation } from 'react-router-dom';
import { ConsultantWithSchedule, Qualification, Specialty } from '../../types/Consultant';


const AppointmentsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { counselorId?: number };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'selection'>('list');
  const [showSpecialtyFilter, setShowSpecialtyFilter] = useState(false);

  // Set data from fetching
  const [consultantData, setConsultantData] = useState<ConsultantWithSchedule[]>([]);
  const [specialtyData, setSpecialtyData] = useState<Specialty[]>([]);
  const [qualificationData, setQualificationData] = useState<Qualification[]>([]);

  // Handling filter data
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  useEffect(() => {
    if (state?.counselorId) {
      setSelectedCounselor(state.counselorId);
      setViewMode('selection');
      console.log(`Selected counselor ID from state: ${state.counselorId}`);
    } else {
      console.log('No counselor ID found in state, defaulting to null');
    }
  }, [state?.counselorId]);

  useEffect(() => {
    fetch('http://localhost:5000/api/consultant')
      .then(response => response.json())
      .then(data => { setConsultantData(data.data) })
      .catch(error => console.error('Error fetching counselors:', error));

    fetch('http://localhost:5000/api/consultant/qualifications')
      .then(response => response.json())
      .then(data => setQualificationData(data.data))
      .catch(error => console.error('Error fetching qualifications:', error));

    fetch('http://localhost:5000/api/consultant/specialties')
      .then(response => response.json())
      .then(data => { setSpecialtyData(data.data) })
      .catch(error => console.error('Error fetching specialties:', error));
  }, []);

  const mergeDataIntoConsultants = (
    consultantData: any[],
    specialtyData: any[],
    qualificationData: any[]
  ): ConsultantWithSchedule[] => {
    // Validate inputs
    if (
      !Array.isArray(consultantData) ||
      !Array.isArray(specialtyData) ||
      !Array.isArray(qualificationData)
    ) {
      console.warn('Invalid input data: one or more datasets are not arrays');
      return [];
    }

    // Group data by ConsultantID
    const groupedByConsultant: { [key: number]: ConsultantWithSchedule } = {};

    consultantData.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.AccountID) {
        console.warn('Invalid consultant item:', item);
        return;
      }

      const AccountID = item.AccountID;
      if (!groupedByConsultant[AccountID]) {
        // Initialize consultant object
        groupedByConsultant[AccountID] = {
          ConsultantID: item.AccountID || 0,
          Name: item.Name || 'Unknown Consultant',
          Rating: item.Rating || 0,
          Bio: item.Bio || '',
          Title: item.Title || '',
          ImageUrl: item.ImageUrl || '',
          IsDisabled: item.IsDisabled || false,
          Schedule: [],
          Specialties: [],
          Qualifications: [],
        };
      }

      if (item.ScheduleID && item.Date && item.StartTime && item.EndTime) {
        groupedByConsultant[AccountID].Schedule.push({
          ScheduleID: item.ScheduleID || 0,
          Date: item.Date || '',
          StartTime: item.StartTime || '',
          EndTime: item.EndTime || '',
        });
      }
    });

    // Process specialty data
    specialtyData.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.AccountID) {
        console.warn('Invalid specialty item:', item);
        return;
      }

      const AccountID = item.AccountID;
      if (groupedByConsultant[AccountID]) {
        groupedByConsultant[AccountID].Specialties.push({
          SpecialtyID: item.SpecialtyID,
          Name: item.Name || '',
        });
      }
    });

    // Process qualification data
    qualificationData.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.AccountID) {
        console.warn('Invalid qualification item:', item);
        return;
      }

      const AccountID = item.AccountID;
      if (groupedByConsultant[AccountID]) {
        groupedByConsultant[AccountID].Qualifications.push({
          QualificationID: item.QualificationID,
          Name: item.Name || '',
        });
      }
    });

    // Convert grouped object to array and filter out incomplete consultants
    return Object.values(groupedByConsultant).filter(
      (consultant) =>
        consultant.Name !== 'Unknown Consultant' && consultant.Schedule.length > 0
    );
  };

  const mergedConsultants = mergeDataIntoConsultants(consultantData, specialtyData, qualificationData);
  const specialtyOptions = specialtyData.map(specialty => specialty.Name);

  const normalizeString = (str: string) =>
    str
      .normalize('NFD')                      // Decompose accents
      .replace(/[\u0300-\u036f]/g, '')       // Remove accents
      .replace(/\s+/g, '')                   // Remove spaces
      .toLowerCase();                        // Convert to lowercase

  const normalizedSearch = normalizeString(searchTerm);

  const filteredConsultants = mergedConsultants.filter(consultant => {
    const normalizedName = normalizeString(consultant.Name);
    const matchesSearch = normalizedName.includes(normalizedSearch);

    const matchesSpecialty =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.some(specialty =>
        consultant.Specialties.some(s => s.Name === specialty)
      );

    return matchesSearch && matchesSpecialty;
  });
  const selectedConsultant = filteredConsultants.find(c => c.ConsultantID === selectedCounselor);

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
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <CalendarIcon className="h-6 w-6" />
              </div>
              Đặt Lịch Hẹn Trực Tuyến
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Kết nối với các chuyên gia tư vấn được chứng nhận của chúng tôi để nhận hỗ trợ và hướng dẫn cá nhân hóa
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">


        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            {/* Search Input */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên gia tư vấn..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Specialty Filter Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowSpecialtyFilter(!showSpecialtyFilter)}
                className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    Lọc theo chuyên môn
                    {selectedSpecialties.length > 0 && (
                      <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {selectedSpecialties.length}
                      </span>
                    )}
                  </span>
                </div>
                {showSpecialtyFilter ?
                  <ChevronUp className="h-5 w-5 text-gray-500" /> :
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                }
              </button>

              {/* Specialty Filter Dropdown */}
              {showSpecialtyFilter && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {specialtyOptions.map((specialty, index) => (
                      <label
                        key={index}
                        className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 ${selectedSpecialties.includes(specialty)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedSpecialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSpecialties([...selectedSpecialties, specialty]);
                            } else {
                              setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
                            }
                          }}
                        />
                        <span className="text-sm font-medium">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Specialties Tags */}
            {selectedSpecialties.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSpecialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {specialty}
                      <button
                        onClick={() => setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Summary */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                <strong>Hiển thị:</strong> {filteredConsultants.length} / {mergedConsultants.length} chuyên viên
              </div>
              {(searchTerm || selectedSpecialties.length > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialties([]);
                    setShowSpecialtyFilter(false);
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'list' ? (
          /* Full List View */
          <div className="max-w-7xl mx-auto">
            {filteredConsultants.length > 0 ? (
              <div className="space-y-6">
                {filteredConsultants.map((consultant) => (
                  <CounselorCard key={consultant.ConsultantID} consultant={consultant} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">Không tìm thấy chuyên gia tư vấn</h3>
                <p className="text-gray-500 mb-6">
                  Vui lòng điều chỉnh tiêu chí tìm kiếm của bạn để xem thêm kết quả
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialties([]);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Selection View */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-7xl mx-auto">
            {/* Left Column - Consultant List */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-primary-100">
                <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100">
                  <h3 className="text-lg font-bold text-primary-700 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Danh Sách chuyên viên
                  </h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
                  {filteredConsultants.length > 0 ? (
                    filteredConsultants.map((consultant) => (
                      <CounselorCard
                        key={consultant.ConsultantID}
                        consultant={consultant}
                        compact={true}
                        isSelected={selectedCounselor === consultant.ConsultantID}
                        onSelect={() => setSelectedCounselor(consultant.ConsultantID)}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Users className="h-10 w-10 text-primary-200 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-primary-700">Không tìm thấy chuyên gia tư vấn</h3>
                      <p className="text-primary-400">Vui lòng điều chỉnh tiêu chí tìm kiếm của bạn</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Details */}
            <div className="xl:col-span-8">
              {selectedCounselor && selectedConsultant ? (
                <CounselorCard
                  consultant={selectedConsultant}
                  compact={false}
                />
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border-2 border-blue-200 p-10 flex flex-col items-center justify-center h-full min-h-[400px]">
                  <CalendarIcon className="h-20 w-20 text-blue-200 mb-6" />
                  <h2 className="text-2xl font-bold mb-2 text-blue-600">Chưa chọn chuyên gia tư vấn</h2>
                  <p className="text-blue-400 text-center max-w-md text-base">
                    Vui lòng chọn một chuyên gia tư vấn từ danh sách bên trái để xem chi tiết và đặt lịch hẹn.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;