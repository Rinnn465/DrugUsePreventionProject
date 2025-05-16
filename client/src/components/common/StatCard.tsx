import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
  return (
    <div className="bg-primary-700 rounded-lg p-6 text-center transform transition duration-300 hover:scale-105">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="text-primary-200">{label}</div>
    </div>
  );
};

export default StatCard;