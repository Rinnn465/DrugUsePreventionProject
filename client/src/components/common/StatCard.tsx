import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-blue-400 rounded-3xl p-8 text-center border-2 border-primary-200/40 select-none">
      <div className="flex justify-center mb-6">
        <div className="bg-white/30 p-4 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-extrabold mb-2 text-white drop-shadow-lg">{value}</div>
      <div className="text-primary-100 text-lg font-medium">{label}</div>
    </div>
  );
};

export default StatCard;