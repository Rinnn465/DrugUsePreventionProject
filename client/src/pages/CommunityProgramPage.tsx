import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { CommunityProgram } from '../types/CommunityProgram';
import { parseDate } from '../utils/parseDateUtils';

const CommunityProgramPage: React.FC = () => {
    const [eventSelected, setEventSelected] = useState<string>('online');
    const [events, setEvents] = useState<CommunityProgram[]>([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/programs')
            .then(response => response.json())
            .then(data => setEvents(data))
            .catch(error => console.log('Error fetching events:', error));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Tin tức sự kiện</h1>
                    <p className="text-lg text-gray-600">Khám phá các sự kiện phòng chống ma túy sắp diễn ra</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex justify-center space-x-4 mb-12">
                    <button
                        onClick={() => setEventSelected('online')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${eventSelected === 'online'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Sự kiện Online
                    </button>
                    <button
                        onClick={() => setEventSelected('offline')}
                        className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${eventSelected === 'offline'
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Sự kiện Offline
                    </button>
                </div>

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events
                        .filter(event => event.Type === eventSelected)
                        .map((event, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                {event.ImageUrl && (
                                    <div className="relative h-48">
                                        <img
                                            src={event.ImageUrl}
                                            alt={event.ProgramName}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.Type === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {event.Type === 'online' ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold min-h-[56px] text-gray-900 mb-2 line-clamp-2">{event.ProgramName}</h3>
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{parseDate(event.Date)}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>{event.Location}</span>
                                        </div>
                                        {/* {event.attendees && (
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span>{event.attendees} người tham dự</span>
                                            </div>
                                        )} */}
                                    </div>
                                    <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">{event.Description}</p>
                                    {event.IsDisabled ? (
                                        <p className="text-center text-red-600 font-medium">Chưa có thông tin chính thức</p>
                                    ) : (
                                        <Link
                                            to={`${event.ProgramID}`}
                                            className="inline-block w-full text-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default CommunityProgramPage;