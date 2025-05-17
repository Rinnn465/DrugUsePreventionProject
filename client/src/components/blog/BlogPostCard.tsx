import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { BlogPostCardProps } from '../../types/Blog';

const BlogPostCard: React.FC<BlogPostCardProps> = ({
  title,
  excerpt,
  date,
  author,
  imageUrl,
  slug
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{date}</span>
        </div>
        <h3 className="h-[56px] text-xl font-semibold mb-3 line-clamp-2">{title}</h3>
        <p className="h-[72px] text-gray-600 mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{author}</span>
          <Link
            to={`/blog/${slug}`}
            className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Read More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;