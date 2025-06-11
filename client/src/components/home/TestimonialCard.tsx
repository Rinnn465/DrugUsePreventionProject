import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  imageSrc: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, imageSrc }) => {
  return (
    <div className="bg-gradient-to-br from-white via-blue-50 to-primary-50 rounded-3xl border-2 border-primary-100/40 p-8">
      <div className="flex items-center mb-6">
        <img 
          src={imageSrc} 
          alt={author}
          className="w-20 h-20 rounded-full object-cover mr-6 border-4 border-primary-200"
        />
        <div>
          <h4 className="font-bold text-lg text-primary-700 mb-1">{author}</h4>
          <p className="text-blue-500 text-sm font-medium">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic text-lg leading-relaxed">“{quote}”</p>
    </div>
  );
};

export default TestimonialCard;