import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';

interface ProgramAttendeeStatsProps {
    programId: number;
}

const ProgramAttendeeStats: React.FC<ProgramAttendeeStatsProps> = ({ programId }) => {
    const [totalAttendees, setTotalAttendees] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendeeStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/api/program-attendee/total/${programId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setTotalAttendees(data.total ?? 0);
                }
            } catch (error) {
                console.error('Error fetching attendee stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendeeStats();
    }, [programId]);

    if (loading) {
        return (
            <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>Đang tải...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-1 text-blue-500" />
            <span>{totalAttendees} người tham gia</span>
        </div>
    );
};

export default ProgramAttendeeStats;
