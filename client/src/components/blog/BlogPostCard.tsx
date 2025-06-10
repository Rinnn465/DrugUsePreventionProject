import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Article, BlogPostCardProps } from '../../types/Article';

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
    <div className="bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-3xl shadow-2xl border-2 border-primary-100/40 overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-3xl animate-fade-in">
      <img
        src={ImageUrl || 'https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
        alt={Status}
        className="w-full h-56 object-cover rounded-t-3xl"
      />
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{PublishedDate}</span>
        </div>
        <h3 className="h-[56px] text-2xl font-bold mb-3 line-clamp-2 text-primary-700">{ArticleTitle}</h3>
        <p className="h-[72px] text-gray-600 mb-4 line-clamp-3 text-lg">{Content}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 font-semibold">{Author}</span>
          <Link
            to={`/blog/${BlogID}`}
            className="inline-block bg-primary-500 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-primary-600 transition-all"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;