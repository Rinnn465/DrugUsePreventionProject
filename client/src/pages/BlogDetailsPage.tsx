import React from 'react';
import { useParams } from 'react-router-dom';
import { blogPostsData } from '../data/blogData';

const BlogDetailsPage = () => {
    const { blogId } = useParams();

    const blog = blogPostsData.find(post => post.id.toString() === blogId);

    return (
        <div className='container mx-auto py-8 px-4'>
            <h1>{blog?.title}</h1>
            <p>This page will display the details of a specific blog post.</p>
        </div>
    );
}

export default BlogDetailsPage;