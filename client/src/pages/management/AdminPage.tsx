import React from "react";
import { useUser } from "../../context/UserContext";
import AdminLayout from "../../components/AdminLayout";
import {
    Users,
    BookOpen,
    Calendar,
    BarChart3
} from "lucide-react";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

const chartOptions = [
  { label: 'Thành viên', value: 'member' },
  { label: 'Lượt đăng ký khóa học', value: 'enroll' },
  { label: 'Lượt tham gia chương trình', value: 'program' },
];

const AdminPage: React.FC = () => {
    const { user } = useUser();

    // Thống kê tổng quan
    const [stats, setStats] = useState({
        totalAccount: 0,
        totalEnrollment: 0,
        totalAttendee: 0,
        completionRate: 0,
        loading: true,
        error: null as string | null,
    });

    const [selectedChart, setSelectedChart] = useState('member');
    const [memberMonthly, setMemberMonthly] = useState<{ month: string, total: number }[]>([]);
    const [enrollMonthly, setEnrollMonthly] = useState<{ month: string, total: number }[]>([]);
    const [programMonthly, setProgramMonthly] = useState<{ month: string, total: number }[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };
                // Tổng số tài khoản
                const accRes = await fetch('http://localhost:5000/api/account/statistics/total', { headers });
                const accData = await accRes.json();
                // Tổng số lượt đăng ký khóa học
                const enrollRes = await fetch('http://localhost:5000/api/course/statistics/total-enrollment', { headers });
                const enrollData = await enrollRes.json();
                // Tổng số người tham gia chương trình
                const attendeeRes = await fetch('http://localhost:5000/api/program-attendee/statistics/total-attendee', { headers });
                const attendeeData = await attendeeRes.json();
                // Tỷ lệ hoàn thành khóa học
                const completeRes = await fetch('http://localhost:5000/api/course/statistics/total-completion-rate', { headers });
                const completeData = await completeRes.json();
                setStats({
                    totalAccount: accData.data?.total || 0,
                    totalEnrollment: enrollData.totalEnrollment || 0,
                    totalAttendee: attendeeData.data?.totalAttendee || 0,
                    completionRate: Math.round((completeData.data?.completePercentage || 0) * 10) / 10,
                    loading: false,
                    error: null,
                });

                // Fetch member by month
                const memberMonthRes = await fetch('http://localhost:5000/api/account/statistics/count', { headers });
                const memberMonthData = await memberMonthRes.json();
                // Convert to [{ month: 'MM/YYYY', total: number }]
                const memberMonthlyData = (memberMonthData.data || []).map((item: { Month: number; Year: number; total: number }) => ({
                    month: `${item.Month < 10 ? '0' + item.Month : item.Month}/${item.Year}`,
                    total: item.total
                }));
                setMemberMonthly(memberMonthlyData);
                // Fetch enroll by month
                const enrollMonthlyRes = await fetch('http://localhost:5000/api/course/statistics/enroll-monthly', { headers });
                const enrollMonthlyData = await enrollMonthlyRes.json();
                // Convert to [{ month: 'MM/YYYY', total: number }]
                const enrollMonthlyDataFormatted = (enrollMonthlyData.data || []).map((item: { Month: number; Year: number; total: number }) => ({
                    month: `${item.Month < 10 ? '0' + item.Month : item.Month}/${item.Year}`,
                    total: item.total
                }));
                setEnrollMonthly(enrollMonthlyDataFormatted);
                // Fetch program attendee by month
                const programRes = await fetch('http://localhost:5000/api/program-attendee/statistics/enroll', { headers });
                const programData = await programRes.json();
                // Group by month/year
                const programMonthlyMap: Record<string, number> = {};
                (programData.data || []).forEach((item: { EnrollCount?: number; Month?: number; Year?: number }) => {
                  if (item.EnrollCount && item.EnrollCount > 0 && item.Month && item.Year) {
                    const key = `${item.Month < 10 ? '0' + item.Month : item.Month}/${item.Year}`;
                    programMonthlyMap[key] = (programMonthlyMap[key] || 0) + item.EnrollCount;
                  }
                });
                const programMonthlyArr = Object.entries(programMonthlyMap).map(([month, total]) => ({ month, total }));
                programMonthlyArr.sort((a, b) => a.month.localeCompare(b.month));
                setProgramMonthly(programMonthlyArr);
            } catch (error: unknown) {
                console.error('Error fetching stats:', error);
                setStats(s => ({ ...s, loading: false, error: 'Không thể tải thống kê tổng quan!' }));
            }
        };
        fetchStats();
    }, []);

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto p-6">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại!</h1>
                    <p className="text-gray-600">Xin chào {user?.FullName || user?.Username || 'Quản trị viên'}, hôm nay bạn muốn làm gì?</p>
                </div>

                {/* Thống kê tổng quan */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
                        Thống kê tổng quan
                    </h2>
                    {stats.loading ? (
                        <div className="text-gray-500 py-8">Đang tải thống kê...</div>
                    ) : stats.error ? (
                        <div className="text-red-500 py-8">{stats.error}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow flex flex-col items-center">
                                <Users className="h-10 w-10 text-blue-600 mb-2" />
                                <div className="text-3xl font-bold text-blue-900">{stats.totalAccount}</div>
                                <div className="text-blue-700 mt-1 font-medium">Thành viên</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow flex flex-col items-center">
                                <BookOpen className="h-10 w-10 text-green-600 mb-2" />
                                <div className="text-3xl font-bold text-green-900">{stats.totalEnrollment}</div>
                                <div className="text-green-700 mt-1 font-medium">Lượt đăng ký khóa học</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow flex flex-col items-center">
                                <Calendar className="h-10 w-10 text-purple-600 mb-2" />
                                <div className="text-3xl font-bold text-purple-900">{stats.totalAttendee}</div>
                                <div className="text-purple-700 mt-1 font-medium">Lượt tham gia chương trình</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 shadow flex flex-col items-center">
                                <BarChart3 className="h-10 w-10 text-yellow-600 mb-2" />
                                <div className="text-3xl font-bold text-yellow-900">{stats.completionRate}%</div>
                                <div className="text-yellow-700 mt-1 font-medium">Tỷ lệ hoàn thành khóa học</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chart thống kê theo tháng */}
                <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mr-4">Biểu đồ thống kê theo tháng</h3>
                    <select
                      value={selectedChart}
                      onChange={e => setSelectedChart(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {chartOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedChart === 'member' ? (
                        <LineChart data={memberMonthly} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <XAxis dataKey="month" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="total" name="Thành viên mới" stroke="#2563eb" strokeWidth={3} dot />
                        </LineChart>
                      ) : selectedChart === 'enroll' ? (
                        <BarChart data={enrollMonthly} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <XAxis dataKey="month" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="Lượt đăng ký" fill="#22c55e" />
                        </BarChart>
                      ) : (
                        <BarChart data={programMonthly} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <XAxis dataKey="month" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="Lượt tham gia" fill="#a21caf" />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPage;