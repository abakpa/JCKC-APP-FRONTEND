import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceAPI, classesAPI, groupsAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor, getStatusText } from '../../utils/helpers';
import toast from 'react-hot-toast';

const AttendanceReports = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);

  const [filters, setFilters] = useState({
    type: 'class',
    classId: '',
    groupId: '',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [classesRes, groupsRes] = await Promise.all([
        classesAPI.getAll(),
        groupsAPI.getAll(),
      ]);
      setClasses(classesRes.data);
      setGroups(groupsRes.data);

      // Set default selection
      if (classesRes.data.length > 0) {
        setFilters(prev => ({ ...prev, classId: classesRes.data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {
        type: filters.type,
        startDate: filters.startDate,
        endDate: filters.endDate,
      };

      if (filters.type === 'class' && filters.classId) {
        params.classId = filters.classId;
      } else if (filters.type === 'group' && filters.groupId) {
        params.groupId = filters.groupId;
      }

      const response = await attendanceAPI.getReport(params);
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Attendance Reports</h1>
        <Link to="/attendance">
          <Button>Take Attendance</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="label">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({
                ...filters,
                type: e.target.value,
                classId: '',
                groupId: '',
              })}
              className="input"
            >
              <option value="class">Class</option>
              <option value="group">Group</option>
            </select>
          </div>

          {filters.type === 'class' ? (
            <div>
              <label className="label">Class</label>
              <select
                value={filters.classId}
                onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                className="input"
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Group</label>
              <select
                value={filters.groupId}
                onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}
                className="input"
              >
                <option value="">All Groups</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full">Generate Report</Button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loading />
      ) : !report ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">Select filters and generate a report</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card bg-blue-50">
              <p className="text-sm text-blue-600">Total Sessions</p>
              <p className="text-2xl font-bold text-blue-700">{report.summary.totalSessions}</p>
            </div>
            <div className="card bg-green-50">
              <p className="text-sm text-green-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{report.summary.byStatus.present}</p>
            </div>
            <div className="card bg-red-50">
              <p className="text-sm text-red-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{report.summary.byStatus.absent}</p>
            </div>
            <div className="card bg-yellow-50">
              <p className="text-sm text-yellow-600">Late</p>
              <p className="text-2xl font-bold text-yellow-700">{report.summary.byStatus.late}</p>
            </div>
          </div>

          {/* Children Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Attendance by Child</h2>
            {report.childrenStats.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-4">Child</th>
                      <th className="text-center py-2 px-4">Present</th>
                      <th className="text-center py-2 px-4">Absent</th>
                      <th className="text-center py-2 px-4">Late</th>
                      <th className="text-center py-2 px-4">Excused</th>
                      <th className="text-center py-2 px-4">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.childrenStats.map((stat) => (
                      <tr key={stat.child._id} className="border-b">
                        <td className="py-2 px-4">
                          <Link
                            to={`/children/${stat.child._id}`}
                            className="text-primary-600 hover:underline"
                          >
                            {stat.child.firstName} {stat.child.lastName}
                          </Link>
                          <br />
                          <span className="text-xs text-gray-500">{stat.child.uniqueId}</span>
                        </td>
                        <td className="text-center py-2 px-4 text-green-600">{stat.present}</td>
                        <td className="text-center py-2 px-4 text-red-600">{stat.absent}</td>
                        <td className="text-center py-2 px-4 text-yellow-600">{stat.late}</td>
                        <td className="text-center py-2 px-4 text-blue-600">{stat.excused}</td>
                        <td className="text-center py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            stat.attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                            stat.attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {stat.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Attendance Sessions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Recent Sessions</h2>
            {report.attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No attendance records</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-4">Date</th>
                      <th className="text-left py-2 px-4">Class/Group</th>
                      <th className="text-center py-2 px-4">Present</th>
                      <th className="text-center py-2 px-4">Absent</th>
                      <th className="text-center py-2 px-4">Late</th>
                      <th className="text-left py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.attendance.slice(0, 10).map((session) => {
                      const counts = {
                        present: session.records.filter(r => r.status === 'present').length,
                        absent: session.records.filter(r => r.status === 'absent').length,
                        late: session.records.filter(r => r.status === 'late').length,
                      };

                      return (
                        <tr key={session._id} className="border-b">
                          <td className="py-2 px-4">{formatDate(session.date)}</td>
                          <td className="py-2 px-4">
                            {session.class?.name || session.group?.name}
                          </td>
                          <td className="text-center py-2 px-4 text-green-600">{counts.present}</td>
                          <td className="text-center py-2 px-4 text-red-600">{counts.absent}</td>
                          <td className="text-center py-2 px-4 text-yellow-600">{counts.late}</td>
                          <td className="py-2 px-4">
                            <Link
                              to={`/attendance/${session._id}`}
                              className="text-primary-600 hover:underline text-sm"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceReports;
