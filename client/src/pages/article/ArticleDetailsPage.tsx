import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Article } from '../../types/Article';

const ArticleDetailsPage = () => {
    const { articleId } = useParams();
    const [article, setArticle] = useState<Article | null>(null);

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
        fetchArticleDetails();
    }, [articleId]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 lg:px-20">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {article?.ArticleTitle}
                </h1>

                {article?.ImageUrl && (
                    <figure className="mb-8">
                        <img
                            src={article.ImageUrl}
                            alt={article.ArticleTitle}
                            className="w-full h-auto rounded-lg object-cover shadow-sm"
                        />
                        <figcaption className="text-center text-gray-500 text-sm italic mt-2">
                            Hình ảnh các bạn trẻ ở trại cai nghiện
                        </figcaption>
                    </figure>
                )}

                <article className="prose prose-lg max-w-none text-gray-700">
                    <p>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae
                        architecto blanditiis, eum itaque repudiandae vel tenetur facilis
                        quisquam odio dignissimos neque, aliquid corrupti nemo vero nesciunt.
                        Et, nisi libero. Saepe?
                    </p>
                </article>
            </div>
        </div>
    );

}

export default ArticleDetailsPage;