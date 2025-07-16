import axios from 'axios';
import dotenv from 'dotenv';
import { CommunityProgram } from '../types/type';

dotenv.config();

export async function getZoomAccessToken(): Promise<string> {
    try {
        const params = new URLSearchParams();
        params.append('grant_type', 'account_credentials');
        params.append('account_id', process.env.ZOOM_ACCOUNT_ID || '');

        const credentials = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`;
        const encodedCredentials = Buffer.from(credentials).toString('base64');

        const response = await axios.post('https://zoom.us/oauth/token', params, {
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
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
        
        // Format date properly for Zoom API (ISO 8601 format)
        let programDate: Date;
        
        // Check if date is in dd/mm/yyyy format and convert to ISO
        if (program.Date.includes('/')) {
            const [day, month, year] = program.Date.split('/');
            programDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        } else {
            programDate = new Date(program.Date);
        }
        
        // Validate the date
        if (isNaN(programDate.getTime())) {
            throw new Error(`Invalid date format: ${program.Date}`);
        }
        
        programDate.setHours(10, 0, 0, 0); // Set to 10:00 AM
        const startTime = programDate.toISOString();
        
        console.log('Program Date Input:', program.Date);
        console.log('Parsed Date:', programDate);
        console.log('Start Time for Zoom:', startTime);
        
        const response = await axios.post(
            'https://api.zoom.us/v2/users/me/meetings',
            {
                topic: program.ProgramName,
                type: 2, // Scheduled meeting
                start_time: startTime,
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

