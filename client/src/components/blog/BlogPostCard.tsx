import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Article } from '../../types/Article';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const BlogPostCard: React.FC<Article> = ({
  BlogID,
  ArticleTitle,
  PublishedDate,
  ImageUrl,
  Content,
  Description,
  Author,
}) => {
  return (
    <article className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2 flex flex-col h-full border border-gray-100 hover:border-primary-200">
      <div className="relative overflow-hidden">
        <img
          src={ImageUrl || 'https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
          alt={ArticleTitle}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700">
              {formatDate(PublishedDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors duration-200 leading-tight min-h-[56px] line-clamp-2">
          {ArticleTitle}
        </h3>
        
        <p className="text-gray-600 mb-6 line-clamp-3 flex-grow leading-relaxed">
          {Description || Content}
        </p>

        {/* Author Info */}
        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{Author}</p>
              <p className="text-xs text-gray-500">Tác giả</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          <Link
            to={`/article/${BlogID}`}
            className="group/btn w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Đọc bài viết</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogPostCard;