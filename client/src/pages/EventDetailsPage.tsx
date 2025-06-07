import React from "react"
import { Link, useParams } from "react-router-dom";
import { eventData } from "../data/eventData";

const EventsDetails: React.FC = () => {

    const { id } = useParams();
    const event = eventData.find(event => event.id === Number(id));
    const upcomingEvents = eventData.filter(event => event.date > new Date());

    const handleRenderSurveyForm = () => {
        if (event && event.date > new Date()) {
            return (
                <div className="mt-6">
                    <button
                        className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                    >
                        <Link to={`/survey/${event.id}/before`}>
                            Khảo sát trước sự kiện
                        </Link>
                    </button>
                </div>
            )
        } else if (event && event.date <= new Date()) {
            return (
                <div className="mt-6">
                    <button
                        className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                    >
                        <Link to={`/survey/${event.id}/after`}>
                            Khảo sát sau sự kiện
                        </Link>
                    </button>
                </div>
            )
        }
    }
    if (event) {
        return (
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-6 md:px-16 space-y-12">

                    <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">{event.name}</h1>

                        <div className="grid gap-4 text-gray-700">
                            <div className="text-lg">
                                <strong className="block font-semibold">🗓 Thời gian:</strong>
                                {event.date.toLocaleDateString()}
                            </div>
                            <div className="text-lg">
                                <strong className="block font-semibold">📍 Địa điểm:</strong>
                                {event.location}
                            </div>
                            <div className="text-base">
                                <strong className="block font-semibold">📄 Mô tả:</strong>
                                {event.description}
                            </div>
                            <div className="text-base">
                                <strong className="block font-semibold">👥 Đơn vị tổ chức:</strong>
                                {event.organizer}
                            </div>
                        </div>

                        {handleRenderSurveyForm()}

                        {event.imageUrl && (
                            <figure className="mt-10">
                                <img
                                    src={event.imageUrl}
                                    alt={event.name}
                                    className="w-full h-auto rounded-lg object-cover shadow-sm"
                                />
                                <figcaption className="text-center text-sm text-gray-500 mt-2">
                                    Hình ảnh minh họa cho sự kiện
                                </figcaption>
                            </figure>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">📅 Các sự kiện sắp tới</h2>
                        {upcomingEvents.map(event => (
                            <div
                                key={event.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-2"
                            >
                                <h3 className="text-xl font-semibold text-blue-800">{event.name}</h3>
                                <p><strong>🕒 Thời gian:</strong> {event.date.toLocaleDateString()}</p>
                                <p><strong>📍 Địa điểm:</strong> {event.location}</p>
                                <p><strong>📄 Mô tả:</strong> {event.description}</p>
                                <p><strong>👥 Đơn vị tổ chức:</strong> {event.organizer}</p>
                                {event.attendees && (
                                    <p><strong>👤 Số người dự kiến:</strong> {event.attendees}</p>
                                )}
                                {event.url ? (
                                    <a
                                        href={event.url}
                                        className="inline-block text-blue-600 hover:underline font-medium"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        🔗 Xem chi tiết
                                    </a>
                                ) : (
                                    <p className="text-red-500">Chưa có thông tin cụ thể</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <Link to="/events">
                        <button className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition">
                            Quay lại danh sách sự kiện
                        </button>
                    </Link>

                </div>
            </div>
        );
    }
}

export default EventsDetails