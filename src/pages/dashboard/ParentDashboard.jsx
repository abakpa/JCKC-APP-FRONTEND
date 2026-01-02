import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI, notificationsAPI, attendanceAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    children: [],
    notifications: [],
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, notificationsRes] = await Promise.all([
        authAPI.getMe(),
        notificationsAPI.getAll({ limit: 5, unreadOnly: 'true' }),
      ]);

      const children = profileRes.data.children || [];

      // Get recent attendance for each child
      let recentAttendance = [];
      for (const child of children) {
        try {
          const attendanceRes = await attendanceAPI.getChildHistory(child._id);
          recentAttendance = [...recentAttendance, ...attendanceRes.data.slice(0, 3).map(att => ({
            ...att,
            childName: `${child.firstName} ${child.lastName}`,
          }))];
        } catch (err) {
          console.error('Error fetching attendance for child:', err);
        }
      }

      setData({
        children,
        notifications: notificationsRes.data.notifications,
        recentAttendance: recentAttendance.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Welcome, {user?.firstName}!</h1>
      </div>

      {/* Children Cards */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Children</h2>
          <Link to="/children/register" className="text-primary-600 hover:underline text-sm">
            Register Child
          </Link>
        </div>

        {data.children.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No children registered yet</p>
            <Link to="/children/register" className="btn btn-primary">
              Register a Child
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.children.map((child) => (
              <Link
                key={child._id}
                to={`/children/${child._id}`}
                className="flex items-center p-4 border rounded-lg hover:border-primary-300 transition"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  {child.photo ? (
                    <img
                      src={child.photo}
                      alt={child.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-600 font-bold">
                      {child.firstName?.[0]}{child.lastName?.[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">
                    {child.firstName} {child.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">ID: {child.uniqueId}</p>
                  <p className="text-sm text-gray-500">{child.class?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Notifications</h2>
          <Link to="/notifications" className="text-primary-600 hover:underline text-sm">
            View All
          </Link>
        </div>

        {data.notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No new notifications</p>
        ) : (
          <div className="space-y-3">
            {data.notifications.map((notification) => (
              <div
                key={notification._id}
                className="p-3 bg-blue-50 border border-blue-100 rounded-lg"
              >
                <h4 className="font-medium text-gray-800">{notification.title}</h4>
                <p className="text-sm text-gray-600">{notification.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent Attendance</h2>

        {data.recentAttendance.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No attendance records yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Child</th>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttendance.map((record, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{record.childName}</td>
                    <td className="py-2 px-4">{formatDate(record.date)}</td>
                    <td className="py-2 px-4 capitalize">
                      {record.type} - {record.class?.name || record.group?.name}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
