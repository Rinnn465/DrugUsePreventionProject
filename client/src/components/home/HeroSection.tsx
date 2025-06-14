import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Ảnh nền chủ đề phòng chống ma túy do user cung cấp, bao gồm cả ảnh banner slogan có chữ
const backgrounds = [
  'https://resource.kinhtedothi.vn/resources2025/1/users/186/0000000000000000-17483525682831984571985-1748394118.jpg',
  'https://pcmatuy.bocongan.gov.vn/Portals/0/N%C4%82M%202025/HUY%20H%C3%80%20-2025/27.jpg?ver=2025-06-12-192749-710',
  'https://datafiles.nghean.gov.vn/nan-ubnd/4147/quantritintuc20236/mt1638216685949813674.jpg',
  'https://ninhson.tayninh.gov.vn/uploads/news/2024_06/noi-khong-voi-ma-tuy.jpg',
  // Thêm ảnh banner slogan có chữ nếu có
  // 'https://i.imgur.com/0QwQw7A.png',
];

const HeroSection: React.FC = () => {
  const [bgIndex, setBgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setBgIndex((prev) => (prev + 1) % backgrounds.length);
        setFade(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative text-white shadow-lg rounded-b-3xl"
      style={{ minHeight: 420 }}
    >
      {/* Ảnh nền động */}
      <div className="absolute inset-0 w-full h-full z-0 rounded-b-3xl overflow-hidden">
        <img
          src={backgrounds[bgIndex]}
          alt="background hero"
          className={`w-full h-full object-cover transition-opacity duration-700 ${fade ? 'opacity-100' : 'opacity-0'}`}
          style={{ minHeight: 420 }}
        />
        {/* Overlay gradient xanh tím */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/80 via-indigo-700/70 to-blue-600/60" />
      </div>
    </section>
  );
};

export default HeroSection;