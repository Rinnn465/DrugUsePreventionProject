import React, { useEffect, useState, useMemo } from 'react';
import { Newspaper, Filter, X } from 'lucide-react';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { Article } from '../../types/Article';

// Thêm hàm gọi API chuẩn RESTful
const API_URL = 'http://localhost:5000/api/article';

const fetchArticles = async (): Promise<Article[]> => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Lỗi khi lấy danh sách bài viết');
  return res.json();
};

const ArticlePage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');

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
      // Filter by date range
      if (selectedDateRange !== 'all') {
        const postDate = new Date(post.PublishedDate);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (selectedDateRange) {
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'quarter':
            if (daysDiff > 90) return false;
            break;
        }
      }

      return true;
    }) || [];
  }, [blogPosts, selectedDateRange]);

  const clearFilters = () => {
    setSelectedDateRange('all');
  };

  const hasActiveFilters = selectedDateRange !== 'all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-primary-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-16 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-24 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex items-center justify-center gap-3 text-white">
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

      <div className="container mx-auto px-4 py-16">
        {/* Filter Section */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Lọc bài viết</h2>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thời gian đăng
                </label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">3 tháng qua</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Hiển thị <span className="font-semibold text-blue-600">{filteredPosts.length}</span> / {blogPosts.length} bài viết
            </div>
          </div>
        </div>

        {/* Blog Results Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bài viết mới nhất
                {filteredPosts.length > 0 && (
                  <span className="text-primary-600"> ({filteredPosts.length} bài viết)</span>
                )}
              </h2>
              <p className="text-gray-600">
                Khám phá những bài viết hữu ích và cập nhật nhất
              </p>
            </div>
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((blog) => (
                <BlogPostCard key={blog.BlogID} {...blog} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Newspaper className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                    Không tìm thấy bài viết phù hợp
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Hãy thử điều chỉnh bộ lọc để tìm thấy bài viết phù hợp với bạn
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* No posts at all */}
        {blogPosts.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Chưa có bài viết</h3>
              <p className="text-gray-600">Hãy quay lại sau để xem những bài viết mới nhất</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;