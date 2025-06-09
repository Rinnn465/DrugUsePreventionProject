import React, { useEffect } from "react"
import { Link, useParams } from "react-router-dom";
import { CommunityProgram } from "../types/CommunityProgram";
import { parseDate } from "../utils/parseDateUtils";

const CommunityProgramDetails: React.FC = () => {

    const { programId } = useParams();
    const [programData, setProgramData] = React.useState<CommunityProgram | null>();
    const [upcomingPrograms, setUpcomingPrograms] = React.useState<CommunityProgram[]>([]);

    useEffect(() => {
        const fetchProgramData = async () => {
            fetch(`http://localhost:5000/api/programs/${programId}`)
                .then(response => response.json())
                .then(data => setProgramData(data))
                .catch(error => console.error('Error fetching program data:', error));
        }

        const fetchUpcomingPrograms = async () => {
            fetch('http://localhost:5000/api/programs/upcoming/programs')
                .then(response => response.json())
                .then(data => setUpcomingPrograms(data))
                .catch(error => console.error('Error fetching upcoming programs:', error));
        }

        fetchProgramData();
        fetchUpcomingPrograms();
    }, [programId])



    const handleRenderSurveyForm = () => {
        if (programData && new Date(parseDate(programData.Date)) > new Date()) {
            return (
                <div className="mt-6">
                    <button
                        className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                    >
                        <Link to={`/survey/${programData.ProgramID}/before`}>
                            Khảo sát trước sự kiện
                        </Link>
                    </button>
                </div>
            )
        } else if (programData && new Date(parseDate(programData.Date)) <= new Date()) {
            return (
                <div className="mt-6">
                    <button
                        className="self-start px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md font-semibold transition duration-200"
                    >
                        <Link to={`/survey/${programData.ProgramID}/after`}>
                            Khảo sát sau sự kiện
                        </Link>
                    </button>
                </div>
            )
        }
    }
    if (programData) {
        return (
            <div className="min-h-screen bg-gray-100 py-10">
                <div className="container mx-auto px-6 md:px-16 space-y-12">

                    <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800">{programData.ProgramName}</h1>

                        <div className="grid gap-4 text-gray-700">
                            <div className="text-lg">
                                <strong className="block font-semibold">🗓 Thời gian:</strong>
                                {parseDate(programData.Date)}
                            </div>
                            <div className="text-lg">
                                <strong className="block font-semibold">📍 Địa điểm:</strong>
                                {programData.Location}
                            </div>
                            <div className="text-base">
                                <strong className="block font-semibold">📄 Mô tả:</strong>
                                {programData.Description}
                            </div>
                            <div className="text-base">
                                <strong className="block font-semibold">👥 Đơn vị tổ chức:</strong>
                                {programData.Organizer}
                            </div>
                        </div>

                        {handleRenderSurveyForm()}

                        {programData.ImageUrl && (
                            <figure className="mt-10">
                                <img
                                    src={programData.ImageUrl}
                                    alt={programData.ProgramName}
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
                        {upcomingPrograms.map(program => (
                            <div
                                key={program.ProgramID}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-2"
                            >
                                <h3 className="text-xl font-semibold text-blue-800">{program.ProgramName}</h3>
                                <p><strong>🕒 Thời gian:</strong> {parseDate(program.Date)}</p>
                                <p><strong>📍 Địa điểm:</strong> {program.Location}</p>
                                <p><strong>📄 Mô tả:</strong> {program.Description}</p>
                                <p><strong>👥 Đơn vị tổ chức:</strong> {program.Organizer}</p>
                                {/* {program.attendees && (
                                    <p><strong>👤 Số người dự kiến:</strong> {program.attendees}</p>
                                )} */}
                                {program.Url ? (
                                    <a
                                        href={'#'}
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

export default CommunityProgramDetails