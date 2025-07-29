import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-xl">DrugPrevention</span>
            </Link>
            <p className="text-gray-400 max-w-xs">
              Hỗ trợ cộng đồng trong việc phòng ngừa và giảm thiểu tác hại của ma túy thông qua giáo dục, tư vấn và các chương trình hỗ trợ.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">Về chúng tôi</Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-white transition-colors">Khóa học</Link>
              </li>
              <li>
                <Link to="/assessments" className="text-gray-400 hover:text-white transition-colors">Trắc nghiệm đánh giá</Link>
              </li>
              <li>
                <Link to="/appointments" className="text-gray-400 hover:text-white transition-colors">Tư vẫn</Link>
              </li>
              <li>
                <Link to="/programs" className="text-gray-400 hover:text-white transition-colors">Chương trình</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Tài nguyên</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Chính sách quyền riêng tư</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Điều khoản dịch vụ</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Tình nguyện</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Quyên góp</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Thông tin liên lạc</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">123 Prevention St., Community City, State 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400">(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400">contact@drugprevention.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Drug Prevention Organization. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;