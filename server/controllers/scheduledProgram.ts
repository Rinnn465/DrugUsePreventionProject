import cron from 'node-cron';
import axios from 'axios';
import { poolPromise, sql } from "../config/database";
import { getZoomAccessToken } from "./zoomController";

export const updateProgramStatus = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const pool = await poolPromise;
            const programs = await pool.request().query(`
                SELECT ProgramID, MeetingRoomName
                FROM CommunityProgram
                WHERE IsDisabled = 0
            `);

            for (const program of programs.recordset) {
                const status = await checkMeetingStatus(program.MeetingRoomName);
                await pool.request()
                    .input('ProgramID', sql.Int, program.ProgramID)
                    .input('Status', sql.NVarChar, status)
                    .query(`
                        UPDATE CommunityProgram
                        SET Status = @Status
                        WHERE ProgramID = @ProgramID
                    `);
            }
        } catch (err) {
            console.error('Error updating program statuses:', err);
        }
    });
};

export async function checkMeetingStatus(meetingId: string): Promise<string> {
    try {
        const accessToken = await getZoomAccessToken();
        const response = await axios.get(
            `https://api.zoom.us/v2/meetings/${meetingId}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );
        const meeting = response.data;
        const startTime = new Date(meeting.start_time);
        const duration = meeting.duration * 60 * 1000; // Phút sang mili giây
        const now = new Date();

        if (now < startTime) return 'upcoming';
        if (now >= startTime && now <= new Date(startTime.getTime() + duration)) return 'ongoing';
        return 'completed';
    } catch (error: any) {
        console.error('Error checking Zoom meeting status:', error.response?.data || error.message);
        return 'upcoming'; // Mặc định nếu lỗi
    }
}

