import React, { useEffect, useState } from 'react';
import { Search, Newspaper, TrendingUp, Users, BookOpen, Filter } from 'lucide-react';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { Article } from '../../types/Article';

const ArticlePage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/article')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setBlogPosts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        setLoading(false);
      });
  }, []);

  const filteredPosts = blogPosts?.filter(post => 
    post.ArticleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.Content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight flex items-center justify-center gap-3">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Newspaper className="h-6 w-6" />
              </div>
              Blog 
              <span className="text-yellow-300"> Kiến thức</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-blue-100 leading-relaxed">
              Cập nhật tin tức, kiến thức và kinh nghiệm phòng chống tệ nạn xã hội
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <Filter className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Tìm kiếm bài viết</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors text-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Blog Results Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'Kết quả tìm kiếm' : 'Bài viết mới nhất'}
                {filteredPosts.length > 0 && (
                  <span className="text-primary-600"> ({filteredPosts.length} bài viết)</span>
                )}
              </h2>
              <p className="text-gray-600">
                {searchTerm 
                  ? `Tìm thấy ${filteredPosts.length} bài viết cho "${searchTerm}"` 
                  : 'Khám phá những bài viết hữu ích và cập nhật nhất'
                }
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
                    {searchTerm ? 'Không tìm thấy bài viết' : 'Chưa có bài viết'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm 
                      ? 'Hãy thử từ khóa khác hoặc xóa bộ lọc' 
                      : 'Hãy quay lại sau để xem những bài viết mới nhất'
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;