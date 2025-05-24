import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { eventData } from '../data/eventData';

const Events: React.FC = () => {
    const [eventSelected, setEventSelected] = useState<string>('online');

    return (
        <div className="container  mx-auto py-8 px-20 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div >
                <p className="text-2xl font-bold text-gray-800 mb-4">Tin tức sự kiện {'(' + eventSelected + ')'}</p>

                <ul className="md:flex-row gap-4">
                    <li>
                        <button
                            onClick={() => setEventSelected('online')}
                            className="px-4 py-2 mb-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 active:bg-blue-800 transition duration-200"
                        >
                            Sự kiện online
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setEventSelected('offline')}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 active:bg-green-800 transition duration-200"
                        >
                            Sự kiện Offline
                        </button>
                    </li>
                </ul>
            </div>
            <div className='col-span-2' >
                {eventData.filter(event => event.type === eventSelected).map((event, index) => (
                    <div key={index} className="border p-4 mb-4">
                        <h3 className="text-xl font-bold">{event.name}</h3>
                        <p>Thời gian: {event.date.toLocaleDateString()}</p>
                        <p>Địa điểm: {event.location}</p>
                        <p>Mô tả: {event.description}</p>
                        <p>Đơn vị tổ chức: {event.organizer}</p>
                        <p>Số người tham dự: {event.attendees}</p>
                        {event.url ?
                            <Link
                                className="text-blue-600 hover:text-blue-800"
                                to={`${event.id}`}>
                                Xem chi tiết
                            </Link>
                            : <p className='text-red-600'>Chưa có thông tin chính thức</p>
                        }
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Events