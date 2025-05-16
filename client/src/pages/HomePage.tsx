import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Activity, Calendar, Users, ArrowRight, ShieldCheck, Award, Book } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatCard from '../components/common/StatCard';
import TestimonialCard from '../components/home/TestimonialCard';
import BlogPostCard from '../components/blog/BlogPostCard';

const HomePage: React.FC = () => {
  return (
    <div>
      <HeroSection />
      
      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 transform transition duration-300 hover:scale-105">
              <div className="mb-4 bg-primary-100 p-3 rounded-full w-fit">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Online Courses</h3>
              <p className="text-gray-600 mb-4">
                Access age-appropriate training courses on drug awareness and prevention skills.
              </p>
              <Link to="/courses" className="text-primary-600 font-medium flex items-center gap-2 group">
                Browse Courses
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 transform transition duration-300 hover:scale-105">
              <div className="mb-4 bg-secondary-100 p-3 rounded-full w-fit">
                <Activity className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Risk Assessment</h3>
              <p className="text-gray-600 mb-4">
                Take our surveys like ASSIST and CRAFFT to evaluate your risk level and get personalized recommendations.
              </p>
              <Link to="/assessments" className="text-secondary-600 font-medium flex items-center gap-2 group">
                Take Assessment
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-8 transform transition duration-300 hover:scale-105">
              <div className="mb-4 bg-accent-100 p-3 rounded-full w-fit">
                <Calendar className="h-6 w-6 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Counseling Support</h3>
              <p className="text-gray-600 mb-4">
                Schedule online appointments with our qualified counselors for personalized guidance.
              </p>
              <Link to="/appointments" className="text-accent-600 font-medium flex items-center gap-2 group">
                Book Appointment
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard 
              icon={<Users className="h-8 w-8" />}
              value="10,000+"
              label="People Educated"
            />
            <StatCard 
              icon={<BookOpen className="h-8 w-8" />}
              value="50+"
              label="Training Courses"
            />
            <StatCard 
              icon={<Calendar className="h-8 w-8" />}
              value="5,000+"
              label="Counseling Sessions"
            />
            <StatCard 
              icon={<Award className="h-8 w-8" />}
              value="100+"
              label="Certified Counselors"
            />
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Volunteers working together" 
                className="rounded-lg shadow-lg object-cover w-full h-[400px]"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">About Our Organization</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                We are a volunteer-based organization dedicated to preventing drug abuse through education, 
                support, and community engagement. Our mission is to empower individuals with knowledge and 
                skills to make informed decisions about drugs and substances.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Through our comprehensive programs, online courses, and counseling services, we aim to reduce 
                drug use in communities and provide support to those at risk. We believe in a preventive approach 
                that focuses on education and early intervention.
              </p>
              <Link 
                to="/about" 
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Programs Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Our Community Programs</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            We organize a variety of outreach and educational programs to raise awareness and 
            provide valuable resources to communities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="School Awareness Program" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">School Awareness Workshops</h3>
                <p className="text-gray-600 mb-4">
                  Interactive workshops for students to learn about drug risks and develop refusal skills.
                </p>
                <Link to="/programs" className="text-primary-600 font-medium">Learn More</Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Parent Training Program" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Parent Education Series</h3>
                <p className="text-gray-600 mb-4">
                  Training sessions for parents on recognizing warning signs and having effective conversations.
                </p>
                <Link to="/programs" className="text-primary-600 font-medium">Learn More</Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Community Outreach" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">Community Outreach Events</h3>
                <p className="text-gray-600 mb-4">
                  Public events with resources, screenings, and educational materials for the wider community.
                </p>
                <Link to="/programs" className="text-primary-600 font-medium">Learn More</Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/programs" 
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Success Stories</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Hear from participants who have benefited from our programs and services.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="The online course helped me understand the risks and I now feel empowered to make better choices."
              author="Alex, 17"
              role="Student"
              imageSrc="https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />
            
            <TestimonialCard 
              quote="The counseling sessions provided the support my family needed during a difficult time. We're forever grateful."
              author="Sarah, 42"
              role="Parent"
              imageSrc="https://images.pexels.com/photos/774095/pexels-photo-774095.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />
            
            <TestimonialCard 
              quote="The resources helped me start important conversations with my students about drug prevention."
              author="Michael, 38"
              role="Teacher"
              imageSrc="https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            />
          </div>
        </div>
      </section>
      
      {/* Recent Blog Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Latest Articles</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Stay informed with our latest resources, tips, and insights on drug prevention.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BlogPostCard 
              title="Understanding Substance Use Risk Factors in Adolescents"
              excerpt="Learn about the key risk factors that can lead to substance use among teenagers and how to address them effectively."
              date="June 15, 2025"
              author="Dr. Emily Johnson"
              imageUrl="https://images.pexels.com/photos/7407946/pexels-photo-7407946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              slug="understanding-risk-factors"
            />
            
            <BlogPostCard 
              title="Effective Communication Strategies for Parents"
              excerpt="Discover proven techniques to talk to your children about drugs and build a foundation of trust and open dialogue."
              date="June 10, 2025"
              author="Thomas Richards, LMFT"
              imageUrl="https://images.pexels.com/photos/7282588/pexels-photo-7282588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              slug="communication-strategies"
            />
            
            <BlogPostCard 
              title="Building Resilience: A Key Prevention Strategy"
              excerpt="Explore how developing resilience can help individuals avoid substance use and overcome challenges."
              date="June 5, 2025"
              author="Dr. Marcus Lee"
              imageUrl="https://images.pexels.com/photos/2531353/pexels-photo-2531353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              slug="building-resilience"
            />
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/blog" 
              className="inline-block bg-white border border-primary-600 text-primary-600 px-6 py-3 rounded-md shadow-sm hover:bg-primary-50 transition-colors"
            >
              Read More Articles
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-accent-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of volunteers and contribute to our mission of drug prevention and education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="inline-block bg-white text-accent-600 px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition-colors font-medium"
            >
              Volunteer With Us
            </a>
            <Link 
              to="/assessments" 
              className="inline-block bg-accent-700 text-white px-6 py-3 rounded-md shadow-md border border-accent-500 hover:bg-accent-800 transition-colors font-medium"
            >
              Take an Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;