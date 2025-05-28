import { useParams } from 'react-router-dom';
import { blogPostsData } from '../data/blogData';

const BlogDetailsPage = () => {
    const { blogId } = useParams();

    const blog = blogPostsData.find(post => post.id.toString() === blogId);

    return (
        <div className="container mx-auto mt-20 py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{blog?.title}</h1>
            <div>
                <figure className="flex flex-col items-center bg-gray-100 rounded-lg shadow-md p-4">
                    <img
                        src={blog?.imageUrl}
                        alt={blog?.slug}
                        className="w-full max-w-md rounded-lg mb-4"
                    />
                    <figcaption className="text-gray-600 text-sm italic">
                        Hình ảnh các bạn trẻ ở trại cai nghiện
                    </figcaption>
                </figure>
            </div>
            <h2>
                <p className="mt-6 text-gray-700">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae architecto blanditiis, eum itaque repudiandae vel tenetur facilis quisquam odio dignissimos neque, aliquid corrupti nemo vero nesciunt. Et, nisi libero. Saepe?
                </p>
            </h2>
        </div>
    );
}

export default BlogDetailsPage;