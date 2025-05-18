import React from "react"
import { Link, useParams } from "react-router-dom";
import { eventData } from "../data/eventData";

const EventsDetails: React.FC = () => {

    const { id } = useParams();
    const event = eventData.find(event => event.id === Number(id));
    const upcomingEvents = eventData.filter(event => event.date > new Date());

    if (event) {
        return (
            <div className="container flex flex-col mx-auto py-8 px-6 gap-12 rounded-lg shadow-md">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        {event.name}
                    </h1>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            Details
                        </h2>
                        <p className="text-gray-600 text-lg">
                            {event.date.toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 text-lg">
                            {event.location}
                        </p>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            Additional Information
                        </h3>
                        <p className="text-gray-600 text-base">
                            {event.description}
                        </p>
                        <p className="text-gray-600 text-base">
                            {event.organizer}
                        </p>
                    </div>
                    <div className="mt-6">
                        <button
                            className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                        >
                            <Link to={`/feedback/${event.id}`}>
                                Feedback about this event
                            </Link>
                        </button>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
                    {upcomingEvents.map((event) => {
                        return (
                            <div key={event.id} className="border p-4 mb-4">
                                <h3 className="text-xl font-bold">{event.name}</h3>
                                <p>Date: {event.date.toLocaleDateString()}</p>
                                <p>Location: {event.location}</p>
                                <p>Description: {event.description}</p>
                                <p>Organizer: {event.organizer}</p>
                                {event.attendees ? <p>Attendees: {event.attendees}</p> : null}
                                {event.url ?
                                    <a
                                        className="text-blue-600 hover:text-blue-800"
                                        href={event.url} target="_blank" rel="noopener noreferrer">
                                        More info
                                    </a>
                                    :
                                    <p className="text-red-600">
                                        No info yet
                                    </p>
                                }
                            </div>
                        )
                    })}
                </div>
                <button
                    onClick={() => window.history.back()}
                    className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                >
                    Back
                </button>
            </div>
        );
    }
}

export default EventsDetails