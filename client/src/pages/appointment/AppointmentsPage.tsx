import React, { useEffect, useState } from 'react';
import { Users, Search, Calendar as CalendarIcon, User } from 'lucide-react';
import { counselorData } from '../../data/counselorData';
import CounselorCard from '../../components/counselors/CounselorCard';
import AppointmentCalendar from '../../components/appointments/AppointmentCalendar';
import { Link, useLocation } from 'react-router-dom';
import { ConsultantWithSchedule, Qualification, Specialty } from '../../types/Consultant';

const AppointmentsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { counselorId?: number };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState<number | null>(null);

  //set data from fetching
  const [consultantData, setConsultantData] = useState<ConsultantWithSchedule[]>([]);
  const [specialtyData, setSpecialtyData] = useState<Specialty[]>([]);
  const [qualificationData, setQualificationData] = useState<Qualification[]>([]);

  //handling filter data
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  useEffect(() => {
    if (state?.counselorId) {
      setSelectedCounselor(state.counselorId);
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
      .catch(error => console.error('Error fetching qualifications:', error))

    fetch('http://localhost:5000/api/consultant/specialties')
      .then(response => response.json())
      .then(data => { setSpecialtyData(data.data) })
      .catch(error => console.error('Error fetching specialties:', error));
  }, [])


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
      if (!item || typeof item !== 'object' || !item.ConsultantID) {
        console.warn('Invalid consultant item:', item);
        return;
      }

      const consultantId = item.ConsultantID;
      if (!groupedByConsultant[consultantId]) {
        // Initialize consultant object
        groupedByConsultant[consultantId] = {
          ConsultantID: item.ConsultantID || 0,
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


      // Add schedule to the consultant's Schedule array
      if (item.ScheduleID && item.Date && item.StartTime && item.EndTime) {
        groupedByConsultant[consultantId].Schedule.push({
          ScheduleID: item.ScheduleID || 0,
          Date: item.Date || '',
          StartTime: item.StartTime || '',
          EndTime: item.EndTime || '',
        });
      }
    });

    // Process specialty data
    specialtyData.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.ConsultantID || !item.SpecialtyID) {
        console.warn('Invalid specialty item:', item);
        return;
      }

      const consultantId = item.ConsultantID;
      if (groupedByConsultant[consultantId]) {
        groupedByConsultant[consultantId].Specialties.push({
          SpecialtyID: item.SpecialtyID,
          Name: item.Name || '',
        });
      }
    });

    // Process qualification data
    qualificationData.forEach((item) => {
      if (!item || typeof item !== 'object' || !item.ConsultantID || !item.QualificationID) {
        console.warn('Invalid qualification item:', item);
        return;
      }

      const consultantId = item.ConsultantID;
      if (groupedByConsultant[consultantId]) {
        groupedByConsultant[consultantId].Qualifications.push({
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

  const filteredConsunltants = mergedConsultants.filter(consultant => {
    const matchesSearch = consultant.Name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty ? consultant.Specialties.some(s => s.Name === selectedSpecialty) : true;
    return matchesSearch && matchesSpecialty;
  });

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
              Đặt Lịch Hẹn 
              <span className="text-yellow-300"> Trực Tuyến</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Kết nối với các chuyên gia tư vấn được chứng nhận của chúng tôi để nhận hỗ trợ và hướng dẫn cá nhân hóa
            </p>
          </div>
        </div>
             </div>
       
       <div className="container mx-auto px-4 py-12">
        {/* Search Section - Full Width */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="bg-gradient-to-br from-primary-50 via-white to-blue-50 rounded-2xl shadow-2xl p-6 border-2 border-primary-100 animate-fade-in">
            <h2 className="text-xl font-bold mb-6 text-primary-700 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary-400" /> Tìm Chuyên Gia Tư Vấn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-primary-300 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm chuyên gia tư vấn..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 bg-primary-50 text-primary-900 placeholder:text-primary-300 shadow-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <select
                  className="w-full pl-4 pr-8 py-2 border-2 border-primary-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 bg-primary-50 text-primary-900 shadow-md"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">Tất Cả Chuyên Môn</option>
                  {specialtyOptions.map((specialty, index) => (
                    <option key={index} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[600px] overflow-y-auto border-2 border-primary-100 animate-fade-in">
              {filteredConsunltants.length > 0 ? (
                filteredConsunltants.map((consultant) => (
                  <div
                    key={consultant.ConsultantID}
                    className={`border-b-2 border-primary-50 last:border-b-0 cursor-pointer transition-all duration-200 ${selectedCounselor === consultant.ConsultantID ? 'bg-primary-100 scale-[1.01] shadow-lg' : 'hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-100 hover:scale-[1.01]'} animate-fade-in`}
                    onClick={() => setSelectedCounselor(consultant.ConsultantID)}
                  >
                    <CounselorCard consultant={consultant} compact={true} />
                  </div>
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
          <div className="lg:col-span-2">
            {selectedCounselor ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-primary-100 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4 text-primary-700 flex items-center gap-2">
                    <User className="h-6 w-6 text-primary-400" /> Đặt lịch với
                    <Link
                      className='text-primary-500 underline hover:text-primary-700 ml-2'
                      to={`/counselor/${selectedCounselor}`}>
                      {counselorData.find(c => c.id === selectedCounselor)?.name}
                    </Link>
                  </h2>
                  <p className="text-primary-500">
                    Chọn khung giờ trống để đặt lịch hẹn của bạn
                  </p>
                </div>
                <AppointmentCalendar
                  schedule={filteredConsunltants.find(c => c.ConsultantID === selectedCounselor) || undefined}
                  consultantId={selectedCounselor}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center h-full border-2 border-primary-100 animate-fade-in">
                <CalendarIcon className="h-16 w-16 text-primary-100 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-primary-700">Chọn Chuyên Gia Tư Vấn</h2>
                <p className="text-primary-400 text-center max-w-md">
                  Vui lòng chọn một chuyên gia tư vấn từ danh sách để xem các khung giờ hẹn có sẵn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;