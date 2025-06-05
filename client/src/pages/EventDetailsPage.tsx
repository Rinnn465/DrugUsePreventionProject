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
            <div className="container flex flex-col mx-auto py-8 px-6 gap-12 rounded-lg shadow-md">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        {event.name}
                    </h1>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            Chi tiết
                        </h2>
                        <p className="text-gray-600 text-lg">
                            {event.date.toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 text-lg">
                            {event.location}
                        </p>
                        <p className="text-gray-600 text-base">
                            {event.description}
                        </p>
                        <p className="text-gray-600 text-base">
                            {event.organizer}
                        </p>
                    </div>
                    {handleRenderSurveyForm()}
                    {event.imageUrl ? (
                        <div>
                            <figure>
                                <img
                                    src={event.imageUrl}
                                    alt={event.name}
                                    className="w-full mt-12 object-cover rounded-md mb-4"
                                />
                                <figcaption>
                                    <p className="text-gray-600 text-sm text-center">
                                        Hình ảnh minh họa cho sự kiện
                                    </p>
                                </figcaption>
                            </figure>
                        </div>
                    ) : null}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Các sự kiện trong tương lai</h2>
                    {upcomingEvents.map((event) => {
                        return (
                            <div key={event.id} className="border p-4 mb-4">
                                <h3 className="text-xl font-bold">{event.name}</h3>
                                <p>Thời gian: {event.date.toLocaleDateString()}</p>
                                <p>Địa điểm: {event.location}</p>
                                <p>Mô tả: {event.description}</p>
                                <p>Đơn vị tổ chức: {event.organizer}</p>
                                {event.attendees ? <p>Số người tham gia dự kiến: {event.attendees}</p> : null}
                                {event.url ?
                                    <a
                                        className="text-blue-600 hover:text-blue-800"
                                        href={event.url} target="_blank" rel="noopener noreferrer">
                                        Thông tin chi tiết
                                    </a>
                                    :
                                    <p className="text-red-600">
                                        Chưa có thông tin cụ thể
                                    </p>
                                }
                            </div>
                        )
                    })}
                </div>
                <Link to={'/events'}>
                    <button
                        className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                    >
                        Quay lại
                    </button>
                </Link>
            </div>
        );
    }
}

export default EventsDetails