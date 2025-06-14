import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Article } from '../../types/Article';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

const BlogPostCard: React.FC<Article> = ({
  BlogID,
  AccountID,
  ArticleTitle,
  PublishedDate,
  ImageUrl,
  Content,
  Status,
  IsDisabled,
  Author,
}) => {
  return (
    <div
      className="relative group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in flex flex-col h-full"
      style={{ minHeight: 420 }}
    >
      <div className="relative w-full h-56 overflow-hidden">
        <img
          src={ImageUrl || 'https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
          alt={ArticleTitle}
          className="w-full h-full object-cover rounded-t-3xl group-hover:brightness-75 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
        <div className="absolute bottom-2 left-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold text-primary-700 shadow group-hover:bg-primary-500 group-hover:text-white transition">
          {Status === 'published' ? 'Đã đăng' : 'Bản nháp'}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center text-xs text-gray-500 mb-2 gap-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(PublishedDate)}</span>
        </div>
        <h3
          className="h-[56px] text-xl font-bold mb-2 line-clamp-2 text-primary-700 group-hover:text-primary-500 transition cursor-pointer"
          title={ArticleTitle}
        >
          {ArticleTitle}
        </h3>
        <p className="h-[60px] text-gray-600 mb-4 line-clamp-3 text-base">{Content}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm text-gray-500 font-medium italic">{Author}</span>
          <Link
            to={`/blog/${BlogID}`}
            className="inline-block bg-primary-500 text-white font-bold px-5 py-2 rounded-lg shadow hover:bg-primary-600 hover:scale-105 transition-all text-base focus:outline-none focus:ring-2 focus:ring-primary-300"
            tabIndex={0}
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;