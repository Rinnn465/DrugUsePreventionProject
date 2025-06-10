import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-blue-400 rounded-3xl p-8 text-center shadow-2xl border-2 border-primary-200/40 transform transition duration-300 select-none hover:scale-105 hover:shadow-3xl animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="bg-white/30 p-4 rounded-full shadow-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-extrabold mb-2 text-white drop-shadow-lg">{value}</div>
      <div className="text-primary-100 text-lg font-medium">{label}</div>
    </div>
  );
};

export default StatCard;