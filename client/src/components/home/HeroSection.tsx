import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white pb-0 border-b-4 border-b-blue-100">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Vì một cộng đồng <br /> không tồn tại ma túy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Nền tảng hỗ trợ phòng ngừa ma túy đầu tiên của Việt Nam
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;