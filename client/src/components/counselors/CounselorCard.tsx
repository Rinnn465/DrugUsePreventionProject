import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar } from 'lucide-react';
import { Counselor } from '../../types/Counselor';

interface CounselorCardProps {
  counselor: Counselor;
  compact?: boolean;
}

const CounselorCard: React.FC<CounselorCardProps> = ({ counselor, compact = false }) => {
  if (compact) {
    return (
      <div className="p-4">
        <div className="flex items-start gap-4">
          <img
            src={counselor.imageUrl}
            alt={counselor.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold">{counselor.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{counselor.title}</p>
            <div className="flex flex-wrap gap-1">
              {counselor.specialties.slice(0, 3).map((specialty, index) => (
                <span key={index} className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <img
              src={counselor.imageUrl}
              alt={counselor.name}
              className="w-24 h-24 rounded-full object-cover mx-auto sm:mx-0"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{counselor.name}</h3>
              <div className="flex items-center text-warning-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm ml-1">{counselor.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-3">{counselor.title}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {counselor.specialties.map((specialty, index) => (
                <span key={index} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                  {specialty}
                </span>
              ))}
            </div>

            <p className="text-gray-700 mb-4 line-clamp-3">{counselor.bio}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{counselor.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{counselor.availability}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to={`/appointments?counselor=${counselor.id}`}
            className="bg-primary-600 text-white font-medium py-2 px-4 rounded hover:bg-primary-700 transition-colors"
          >
            Đặt lịch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CounselorCard;