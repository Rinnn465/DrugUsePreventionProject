import React from "react";
import { useParams } from "react-router-dom";
import { eventData } from "../data/eventData";

const FeedbackPage: React.FC = () => {
    const { eventId } = useParams();

    const event = eventData.find(event => event.id === Number(eventId));
    console.log(event);


    return (
        <div className="container px-4 py-8 mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-4">We Value Your Feedback</h1>
            <h2 className="text-2xl font-semi-bold text-center mb-6">
                What are your thoughts about
                <br />
                <p className="text-primary-600">{' ' + event?.name}</p>
            </h2>

            <form className="space-y-6">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Feedback Field */}
                <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Feedback
                    </label>
                    <textarea
                        id="feedback"
                        name="feedback"
                        rows={5}
                        placeholder="Write your feedback here..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackPage;