import React, { useEffect } from 'react';
import BlogPostCard from '../components/blog/BlogPostCard';

import { Article } from '../types/Article';

const ArticlePage: React.FC = () => {
  const [blogPosts, setBlogPosts] = React.useState<Article[]>();

  useEffect(() => {
    fetch('http://localhost:5000/api/articles')
      .then(response => response.json())
      .then(data => {
        // Assuming data is an array of blog posts
        // You can update the state or do something with the data here
        console.log(data);
        setBlogPosts(data);
      })
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {blogPosts?.map((blog) => {
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

export default ArticlePage;