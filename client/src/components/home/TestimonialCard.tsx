import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  imageSrc: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, imageSrc }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transform transition duration-300 hover:-translate-y-2">
      <div className="flex items-center mb-6">
        <img 
          src={imageSrc} 
          alt={author}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold">{author}</h4>
          <p className="text-gray-600 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{quote}"</p>
    </div>
  );
};

export default TestimonialCard;