import React, { useEffect, useState, useMemo } from 'react';
import { Newspaper, Search, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Article } from '../../types/Article';

// Thêm hàm gọi API chuẩn RESTful
const API_URL = 'http://localhost:5000/api/article';

const fetchArticles = async (): Promise<Article[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Lỗi khi lấy danh sách bài viết');
  return res.json();
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const HorizontalBlogCard: React.FC<Article> = ({
  BlogID,
  ArticleTitle,
  PublishedDate,
  ImageUrl,
  Content,
  Description,
}) => {
  return (
    <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3 relative overflow-hidden">
          <img
            src={ImageUrl || 'https://images.pexels.com/photos/8197525/pexels-photo-8197525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
            alt={ArticleTitle}
            className="w-full h-48 md:h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content Section */}
        <div className="md:w-2/3 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span>{formatDate(PublishedDate)}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              <Link to={`/article/${BlogID}`}>
                {ArticleTitle}
              </Link>
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
              {Description || (Content && Content.replace(/<[^>]*>/g, '').substring(0, 200))}
            </p>
          </div>

          <div className="flex items-center justify-end">
            <Link
              to={`/article/${BlogID}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
            >
              Đọc thêm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const ArticlePage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArticles()
      .then(data => {
        setBlogPosts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        setLoading(false);
      });
  }, []);

  // Filter logic
  const filteredPosts = useMemo(() => {
    return blogPosts?.filter(post => {
      if (!searchTerm) return true;
      return (
        post.ArticleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.Description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }) || [];
  }, [blogPosts, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Newspaper className="h-6 w-6" />
              </div>
              Blog Kiến thức
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Cập nhật tin tức, kiến thức và kinh nghiệm phòng chống tệ nạn xã hội
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Blog Posts */}
          {loading ? (
            <div className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 h-48 bg-gray-200 rounded-lg"></div>
                    <div className="md:w-2/3 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((blog) => (
                  <HorizontalBlogCard key={blog.BlogID} {...blog} />
                ))
              ) : (
                <div className="text-center py-20">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Newspaper className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                      Không tìm thấy bài viết phù hợp
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Hãy thử từ khóa khác để tìm kiếm bài viết
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xóa tìm kiếm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;