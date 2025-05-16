import React from 'react';
import BlogPostCard from '../components/blog/BlogPostCard';
import { blogPostsData } from '../data/blogData'

const BlogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Blog posts will be mapped here once we have data */}
        {blogPostsData.map((blog) => {
          return (
            <BlogPostCard
              {...blog}
            />
          )
        })}
      </div>
    </div>
  );
};

export default BlogPage;