import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Article } from '../../types/Article';
import BlogPostCard from '../../components/blog/BlogPostCard';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArticleDetailsPage = () => {
    const { articleId } = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticleDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/article/${articleId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch blog details');
                }
                const data = await response.json();
                setArticle(data);
            } catch (error) {
                console.error('Error fetching blog details:', error);
            }
        };

        const fetchRelatedArticles = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/article');
                if (!response.ok) {
                    throw new Error('Failed to fetch related articles');
                }
                const data = await response.json();
                console.log('Related articles data:', data); // Debug log
                
                // Xử lý dữ liệu linh hoạt - có thể là data.data hoặc data trực tiếp
                const articles = Array.isArray(data) ? data : (data.data || []);
                
                // Lọc ra các bài viết khác (không phải bài hiện tại) và lấy 3 bài
                const filtered = articles
                    .filter((item: Article) => item.BlogID.toString() !== articleId)
                    .slice(0, 3);
                
                console.log('Filtered articles:', filtered); // Debug log
                setRelatedArticles(filtered);
            } catch (error) {
                console.error('Error fetching related articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticleDetails();
        fetchRelatedArticles();
    }, [articleId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải bài viết...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-20">
            {/* Back Button */}
            <div className="max-w-4xl mx-auto mb-6">
                <Link
                    to="/article"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại danh sách bài viết
                </Link>
            </div>

            {/* Main Article */}
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mb-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {article?.ArticleTitle}
                </h1>

                {/* Article Meta */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                                {article?.Author?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{article?.Author}</p>
                            <p className="text-sm text-gray-500">Tác giả</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-300"></div>
                    <div>
                        <p className="text-sm text-gray-500">Ngày đăng</p>
                        <p className="font-medium text-gray-900">
                            {article?.PublishedDate ? new Date(article.PublishedDate).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }) : ''}
                        </p>
                    </div>
                </div>

                {article?.ImageUrl && (
                    <figure className="mb-8">
                        <img
                            src={article.ImageUrl}
                            alt={article.ArticleTitle}
                            className="w-full h-auto rounded-lg object-cover shadow-sm"
                        />
                        <figcaption className="text-center text-gray-500 text-sm italic mt-2">
                            Hình ảnh minh họa cho bài viết
                        </figcaption>
                    </figure>
                )}

                <article className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                    {/* Article Content (Detailed information) */}
                    {article?.Content && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Nội dung chi tiết</h3>
                            <div className="text-gray-700 text-base leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: article.Content }} />
                            </div>
                        </div>
                    )}
                    
                    {/* Fallback if neither Description nor Content is available */}
                    {!article?.Description && !article?.Content && (
                        <p className="text-gray-500 text-base italic">
                            Nội dung bài viết chưa được cập nhật.
                        </p>
                    )}
                </article>
            </div>

            {/* Related Articles Section - Luôn hiển thị */}
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Các bài viết khác</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Khám phá thêm những bài viết hữu ích khác về phòng chống tệ nạn xã hội
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-blue-500 mx-auto mt-6"></div>
                </div>

                {relatedArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {relatedArticles.map((relatedArticle) => (
                            <BlogPostCard key={relatedArticle.BlogID} {...relatedArticle} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                            <div className="text-gray-500 mb-4">
                                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải bài viết khác...</h3>
                            <p className="text-gray-600">Hoặc không có bài viết liên quan</p>
                        </div>
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link
                        to="/article"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <span>Xem tất cả bài viết</span>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailsPage;