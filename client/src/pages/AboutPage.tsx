import React from 'react';
import { Heart, Award, Users, BookOpen, Target, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">About Our Organization</h1>
            <p className="text-xl text-primary-100">
              Dedicated to preventing drug abuse through education, support, and community engagement
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="mb-4 bg-primary-100 p-3 rounded-full w-fit">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to prevent substance abuse and addiction through evidence-based education, 
                early intervention, and community support. We strive to empower individuals with the 
                knowledge and skills to make informed decisions about drugs and substances.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="mb-4 bg-primary-100 p-3 rounded-full w-fit">
                <Globe className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-gray-700 leading-relaxed">
                We envision communities where individuals are equipped with the knowledge, skills, and 
                support to live healthy, drug-free lives. Our goal is to create environments where 
                prevention is prioritized, early intervention is accessible, and support is available 
                to those in need.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                Our organization was founded in 2015 by a group of healthcare professionals, educators, and 
                community advocates who recognized the need for more effective drug prevention resources. 
                What began as a small grassroots initiative has grown into a comprehensive program serving 
                thousands of individuals annually.
              </p>
              <p>
                In our early years, we focused primarily on school-based education programs. As we grew and 
                gained insights from our work, we expanded our approach to include online resources, 
                professional development for educators and healthcare providers, family support services, 
                and community outreach initiatives.
              </p>
              <p>
                Today, we operate with a holistic prevention model that addresses the complex factors 
                contributing to substance use across different age groups and communities. Our evidence-based 
                programs are continuously evaluated and improved to ensure they remain effective in an 
                ever-changing landscape.
              </p>
              <p>
                We're proud of our growth and impact, but our work continues. With substance use patterns 
                and challenges evolving, we remain committed to innovation, collaboration, and community 
                engagement in pursuit of our mission.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mx-auto mb-4 bg-primary-100 p-4 rounded-full w-fit">
                <Heart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Compassion</h3>
              <p className="text-gray-700">
                We approach our work with empathy and understanding, recognizing that substance use 
                is a complex issue that affects individuals and communities in different ways.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mx-auto mb-4 bg-secondary-100 p-4 rounded-full w-fit">
                <Award className="h-8 w-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Excellence</h3>
              <p className="text-gray-700">
                We are committed to providing the highest quality programs and services, using 
                evidence-based approaches and continuous improvement to achieve the best outcomes.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mx-auto mb-4 bg-accent-100 p-4 rounded-full w-fit">
                <Users className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Collaboration</h3>
              <p className="text-gray-700">
                We believe in the power of partnerships and work closely with schools, healthcare 
                providers, community organizations, and families to create comprehensive prevention strategies.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mx-auto mb-4 bg-success-100 p-4 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Education</h3>
              <p className="text-gray-700">
                We believe that knowledge is power, and we are dedicated to providing accurate, 
                accessible information that empowers individuals to make informed decisions.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mx-auto mb-4 bg-warning-100 p-4 rounded-full w-fit">
                <Target className="h-8 w-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Prevention</h3>
              <p className="text-gray-700">
                We prioritize proactive approaches that build protective factors and reduce risk 
                factors before substance use issues develop.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="mx-auto mb-4 bg-error-100 p-4 rounded-full w-fit">
                <Globe className="h-8 w-8 text-error-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Inclusivity</h3>
              <p className="text-gray-700">
                We design our programs to be culturally responsive and accessible to diverse 
                populations, recognizing that prevention must be tailored to different communities.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Our Leadership Team</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our diverse team brings together expertise in education, psychology, public health, 
            and community development to guide our organization's work.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <img 
                src="https://images.pexels.com/photos/5393594/pexels-photo-5393594.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Dr. Maria Anderson"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-center">Dr. Maria Anderson</h3>
              <p className="text-primary-600 text-center mb-4">Executive Director</p>
              <p className="text-gray-600 text-center">
                Dr. Anderson brings over 20 years of experience in public health and prevention science. 
                She previously served as a prevention specialist at the National Institute on Drug Abuse.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <img 
                src="https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="David Kim"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-center">David Kim</h3>
              <p className="text-primary-600 text-center mb-4">Director of Programs</p>
              <p className="text-gray-600 text-center">
                David oversees the development and implementation of our prevention programs. He has a 
                background in education and community organizing, with a focus on youth development.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <img 
                src="https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Dr. Samantha Lee"
                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
              />
              <h3 className="text-xl font-semibold text-center">Dr. Samantha Lee</h3>
              <p className="text-primary-600 text-center mb-4">Director of Research</p>
              <p className="text-gray-600 text-center">
                Dr. Lee leads our research initiatives, ensuring our programs are evidence-based and 
                effective. She specializes in prevention evaluation and outcome measurement.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <a 
              href="#" 
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-primary-700 transition-colors"
            >
              Join Our Team
            </a>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-accent-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Get Involved</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            There are many ways to support our mission and make a difference in your community. Whether 
            you're interested in volunteering, partnering with us, or making a donation, we welcome your 
            involvement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#" 
              className="inline-block bg-white text-accent-600 px-6 py-3 rounded-md shadow-md hover:bg-gray-100 transition-colors font-medium"
            >
              Volunteer
            </a>
            <a 
              href="#" 
              className="inline-block bg-accent-700 text-white px-6 py-3 rounded-md shadow-md border border-accent-500 hover:bg-accent-800 transition-colors font-medium"
            >
              Make a Donation
            </a>
            <a 
              href="#" 
              className="inline-block bg-accent-700 text-white px-6 py-3 rounded-md shadow-md border border-accent-500 hover:bg-accent-800 transition-colors font-medium"
            >
              Become a Partner
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;