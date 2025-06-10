import React, { useEffect, useState } from 'react';
import { Calendar, Users, Search, Calendar as CalendarIcon, User, Filter } from 'lucide-react';
import { counselorData } from '../data/counselorData';
import CounselorCard from '../components/counselors/CounselorCard';
import AppointmentCalendar from '../components/appointments/AppointmentCalendar';
import { Link, useLocation } from 'react-router-dom';

const AppointmentsPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { counselorId?: number };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState<number | null>(null);

  useEffect(() => {
    if (state?.counselorId) {
      setSelectedCounselor(state.counselorId);
    }
  }, [state?.counselorId]);

  const specialties = [...new Set(counselorData.flatMap(counselor => counselor.specialties))];

  const filteredCounselors = counselorData.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || counselor.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="bg-sky-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-sky-700">Đặt Lịch Hẹn Trực Tuyến</h1>
          <p className="text-lg text-sky-600 mb-8">
            Kết nối với các chuyên gia tư vấn được chứng nhận của chúng tôi để nhận hỗ trợ và hướng dẫn cá nhân hóa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-sky-100 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-sky-700 flex items-center gap-2">
                <Search className="h-6 w-6 text-sky-400" /> Tìm Chuyên Gia Tư Vấn
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-sky-300 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chuyên gia tư vấn..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 bg-sky-50 text-sky-900 placeholder:text-sky-300 shadow-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <select
                    className="w-full pl-4 pr-8 py-2 border-2 border-sky-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 bg-sky-50 text-sky-900 shadow-md"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    <option value="">Tất Cả Chuyên Môn</option>
                    {specialties.map((specialty, index) => (
                      <option key={index} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-[600px] overflow-y-auto border-2 border-sky-100 animate-fade-in">
              {filteredCounselors.length > 0 ? (
                filteredCounselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    className={`border-b-2 border-sky-50 last:border-b-0 cursor-pointer transition-all duration-200 ${selectedCounselor === counselor.id ? 'bg-sky-100 scale-[1.01] shadow-lg' : 'hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-100 hover:scale-[1.01]'} animate-fade-in`}
                    onClick={() => setSelectedCounselor(counselor.id)}
                  >
                    <CounselorCard counselor={counselor} compact={true} />
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <Users className="h-10 w-10 text-sky-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-sky-700">Không tìm thấy chuyên gia tư vấn</h3>
                  <p className="text-sky-400">Vui lòng điều chỉnh tiêu chí tìm kiếm của bạn</p>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            {selectedCounselor ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-sky-100 animate-fade-in">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4 text-sky-700 flex items-center gap-2">
                    <User className="h-6 w-6 text-sky-400" /> Đặt lịch với
                    <Link
                      className='text-sky-500 underline hover:text-sky-700 ml-2'
                      to={`/counselor/${selectedCounselor}`}>
                      {counselorData.find(c => c.id === selectedCounselor)?.name}
                    </Link>
                  </h2>
                  <p className="text-sky-500">
                    Chọn khung giờ trống để đặt lịch hẹn của bạn
                  </p>
                </div>
                <AppointmentCalendar
                  counselorId={selectedCounselor}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center h-full border-2 border-sky-100 animate-fade-in">
                <CalendarIcon className="h-16 w-16 text-sky-100 mb-4" />
                <h2 className="text-xl font-bold mb-2 text-sky-700">Chọn Chuyên Gia Tư Vấn</h2>
                <p className="text-sky-400 text-center max-w-md">
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
