import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { ConsultantWithSchedule } from '../../types/Consultant';
import AppointmentCalendar from '../appointments/AppointmentCalendar';

interface CounselorCardProps {
  consultant: ConsultantWithSchedule;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const CounselorCard: React.FC<CounselorCardProps> = ({ consultant, compact = false, isSelected = false, onSelect }) => {
  const [showBookingPanel, setShowBookingPanel] = useState(false);

  if (compact) {
    return (
      <div
        className={`p-4 flex items-start gap-4 hover:bg-gradient-to-r hover:from-sky-50 hover:to-blue-100 rounded-xl transition-all duration-200 border-b-2 border-sky-100 shadow-md cursor-pointer ${isSelected ? 'bg-primary-100 scale-[1.01] shadow-lg' : ''}`}
        onClick={onSelect}
      >
        <img
          src={consultant.ImageUrl}
          alt={consultant.Name}
          className="w-14 h-14 rounded-full object-cover border-4 border-sky-200 shadow-lg flex-shrink-0"
          style={{ aspectRatio: '1', borderRadius: '50%' }}
        />
        <div>
          <h3 className="font-bold text-sky-700 text-base">{consultant.Name}</h3>
          <p className="text-xs text-sky-400 mb-1">{consultant.Title}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {consultant.Specialties.map((specialty, index) => (
              <span key={index} className="bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 text-[11px] px-2 py-0.5 rounded-full font-bold border border-sky-200 shadow">
                {specialty.Name}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-6 hover:shadow-xl transition-all duration-300">
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Consultant Info */}
          <div className="lg:w-1/3 flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={consultant.ImageUrl}
                alt={consultant.Name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-blue-100 shadow-lg flex-shrink-0"
              />
              <div className="flex-1">
                <Link
                  to={`/consultant/${consultant.ConsultantID}`}
                  className="text-blue-600 hover:text-blue-800 font-bold text-base md:text-lg hover:underline"
                >
                  {consultant.Name}
                </Link>
                <p className="text-gray-600 text-sm mt-1">{consultant.Title}</p>
                <div className="text-xs text-gray-500 mt-1">
                  <ExternalLink className="h-3 w-3 inline mr-1" />
                  Xem thêm
                </div>
              </div>
            </div>

            {/* Consultant Details */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {consultant.Bio}
                </p>
              </div>



              <div className="flex flex-wrap gap-1">
                {consultant.Specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200"
                  >
                    {specialty.Name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Section */}
          <div className="lg:w-2/3 flex flex-col">

            {/* Booking Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-gray-800">TƯ VẤN ONLINE VỚI CHUYÊN GIA</span>
                </div>
                <button
                  onClick={() => setShowBookingPanel(!showBookingPanel)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium w-full md:w-auto flex items-center justify-center gap-2"
                >
                  {showBookingPanel ? 'Ẩn lịch đặt' : 'Chọn và đặt lịch'}
                  {showBookingPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Booking Panel */}
            {showBookingPanel && (
              <div className="border-t border-gray-200 pt-4">
                <AppointmentCalendar
                  consultantId={consultant.ConsultantID}
                  schedule={consultant}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorCard;