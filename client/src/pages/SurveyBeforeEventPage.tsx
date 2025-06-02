import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { eventData } from "../data/eventData";

const SurveyBeforeEventPage: React.FC = () => {
    const { eventId } = useParams();

    const event = eventData.find(event => event.id === Number(eventId));
    console.log(event);


    return (
        <div className="container px-4 py-8 mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-4">Form khảo sát trước sự kiện</h1>
            <h2 className="text-2xl font-semi-bold text-center mb-6">
                Tên sự kiện
                <br />
                <p className="text-primary-600">{' ' + event?.name}</p>
            </h2>

            <form className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên của bạn
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                        Tuổi của bạn
                    </label>
                    <input
                        id="age"
                        name="age"
                        type="text"
                        placeholder="Enter your age"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                        Bạn mong đợi điều gì ở sự kiện lần này?
                    </label>
                    <textarea
                        id="feedback"
                        name="feedback"
                        rows={5}
                        placeholder="Write your feedback here..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                </div>

                <Link to={`/survey/${eventId}/completed`}>
                    <button
                        type="submit"
                        onClick={() => { alert('hoàn thành khỏa sát') }}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Hoàn thành khảo sát
                    </button>
                </Link>
            </form>
        </div>
    );
};

export default SurveyBeforeEventPage;