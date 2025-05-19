import React from "react";
import { useParams } from "react-router-dom";
import { eventData } from "../data/eventData";
import { users } from "../data/userData";

const ProfilePage: React.FC = () => {
    const { userId } = useParams();
    const user = users.find((user) => user.id.toString() === userId);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white shadow-md rounded-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">User Profile</h1>
                <p className="text-gray-600 mb-6">
                    Welcome to the profile page of <span className="font-semibold text-blue-500">
                        {user?.id}
                    </span>.
                </p>

                {/* Profile Details */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-xl">
                            {user?.name}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{user?.id +
                                ' (' + user?.role + ')'
                            }</h2>
                            <p className="text-gray-500">{user?.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                        <p className="text-gray-600">
                            This is a placeholder for user details. You can add more information about the user here, such as their bio, interests, or other relevant details.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Participated event</h3>
                        <ul className="list-disc list-inside text-gray-600">
                            {eventData.map((event) => {
                                return (
                                    <li key={event.id} className="mb-2">
                                        <span className="font-semibold">{event.name}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;