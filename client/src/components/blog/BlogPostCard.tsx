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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={'https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
        alt={Status}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{PublishedDate}</span>
        </div>
        <h3 className="h-[56px] text-xl font-semibold mb-3 line-clamp-2">{ArticleTitle}</h3>
        <p className="h-[72px] text-gray-600 mb-4 line-clamp-3">{Content}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{Author}</span>
          <Link
            to={`/blog/${BlogID}`}
            className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;