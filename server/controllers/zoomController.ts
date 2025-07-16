import axios from 'axios';
import dotenv from 'dotenv';
import { CommunityProgram } from '../types/type';

dotenv.config();

export async function getZoomAccessToken(): Promise<string> {
    try {
        const response = await axios.post('https://zoom.us/oauth/token', {
            grant_type: 'account_credentials',
            account_id: process.env.ZOOM_ACCOUNT_ID
        }, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64')}`
            }
        });
        return response.data.access_token;
    } catch (error: any) {
        console.error('Error getting Zoom Access Token:', error.response?.data || error.message);
        throw new Error('Failed to get Zoom Access Token');
    }
}

export async function createZoomMeeting(program: CommunityProgram): Promise<{ join_url: string; meeting_id: string }> {
    try {
        const accessToken = await getZoomAccessToken();
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic: program.ProgramName,
                type: 2, // Scheduled meeting
                start_time: program.Date + 'T10:00:00', // Giả định bắt đầu lúc 10:00
                duration: 60, // 60 phút
                timezone: 'Asia/Ho_Chi_Minh',
                agenda: program.Description || 'Hội thảo cộng đồng',
                settings: {
                    host_video: true,
                    participant_video: true,
                    join_before_host: true,
                    mute_upon_entry: false,
                    audio: 'voip',
                    auto_recording: 'none'
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return {
            join_url: response.data.join_url,
            meeting_id: response.data.id.toString()
        };
    } catch (error: any) {
        console.error('Error creating Zoom meeting:', error.response?.data || error.message);
        throw new Error('Failed to create Zoom meeting');
    }
}

export async function deleteZoomMeeting(meetingId: string): Promise<void> {
    try {
        const accessToken = await getZoomAccessToken();
        await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    } catch (error: any) {
        console.error('Error deleting Zoom meeting:', error.response?.data || error.message);
        throw new Error('Failed to delete Zoom meeting');
    }
}

export async function getMeetingDetails(meetingId: string): Promise<any> {
    try {
        const accessToken = await getZoomAccessToken();
        const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching Zoom meeting details:', error.response?.data || error.message);
        throw new Error('Failed to fetch Zoom meeting details');
    }
}

