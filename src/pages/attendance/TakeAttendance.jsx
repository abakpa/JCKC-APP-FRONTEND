import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { classesAPI, groupsAPI, childrenAPI, attendanceAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TakeAttendance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [children, setChildren] = useState([]);

  const [formData, setFormData] = useState({
    type: searchParams.get('type') || 'class',
    classId: searchParams.get('classId') || '',
    groupId: searchParams.get('groupId') || '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (formData.type === 'class' && formData.classId) {
      fetchChildrenByClass(formData.classId);
    } else if (formData.type === 'group' && formData.groupId) {
      fetchChildrenByGroup(formData.groupId);
    } else {
      setChildren([]);
    }
  }, [formData.type, formData.classId, formData.groupId]);

  const fetchOptions = async () => {
    try {
      const [classesRes, groupsRes] = await Promise.all([
        classesAPI.getAll(),
        groupsAPI.getAll(),
      ]);
      setClasses(classesRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenByClass = async (classId) => {
    setLoading(true);
    try {
      const response = await childrenAPI.getByClass(classId);
      setChildren(response.data);
      // Initialize attendance with absent status
      const initialAttendance = {};
      response.data.forEach(child => {
        initialAttendance[child._id] = { status: 'absent', notes: '' };
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenByGroup = async (groupId) => {
    setLoading(true);
    try {
      const response = await childrenAPI.getByGroup(groupId);
      setChildren(response.data);
      // Initialize attendance with absent status
      const initialAttendance = {};
      response.data.forEach(child => {
        initialAttendance[child._id] = { status: 'absent', notes: '' };
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (childId, status) => {
    setAttendance(prev => ({
      ...prev,
      [childId]: { ...prev[childId], status },
    }));
  };

  const handleMarkAllPresent = () => {
    const newAttendance = {};
    children.forEach(child => {
      newAttendance[child._id] = { ...attendance[child._id], status: 'present' };
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (children.length === 0) {
      toast.error('No children to mark attendance for');
      return;
    }

    setSubmitting(true);
    try {
      const records = Object.entries(attendance).map(([childId, data]) => ({
        child: childId,
        status: data.status,
        notes: data.notes,
      }));

      const payload = {
        date: formData.date,
        records,
        notes: formData.notes,
      };

      if (formData.type === 'class') {
        payload.classId = formData.classId;
        await attendanceAPI.takeClass(payload);
      } else {
        payload.groupId = formData.groupId;
        await attendanceAPI.takeGroup(payload);
      }

      toast.success('Attendance recorded successfully!');
      navigate('/attendance/reports');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const statusButtons = [
    { status: 'present', label: 'Present', color: 'bg-green-500 hover:bg-green-600' },
    { status: 'absent', label: 'Absent', color: 'bg-red-500 hover:bg-red-600' },
    { status: 'late', label: 'Late', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { status: 'excused', label: 'Excused', color: 'bg-blue-500 hover:bg-blue-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Take Attendance</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* Selection Form */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({
                ...formData,
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

          {formData.type === 'class' ? (
            <div>
              <label className="label">Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="input"
              >
                <option value="">Select Class</option>
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
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="input"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex items-end">
            <Button onClick={handleMarkAllPresent} variant="success" className="w-full">
              Mark All Present
            </Button>
          </div>
        </div>
      </div>

      {/* Children List */}
      {loading ? (
        <Loading />
      ) : children.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">
            {formData.classId || formData.groupId
              ? 'No children found in this selection'
              : 'Select a class or group to take attendance'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {children.map((child) => (
              <div
                key={child._id}
                className="card flex flex-col md:flex-row items-center gap-4 p-4"
              >
                {/* Photo */}
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {child.photo ? (
                    <img
                      src={child.photo}
                      alt={child.firstName}
                      className="w-20 h-20 object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">
                      {child.firstName?.[0]}{child.lastName?.[0]}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-semibold text-lg">
                    {child.firstName} {child.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 font-mono">{child.uniqueId}</p>
                </div>

                {/* Status Buttons */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {statusButtons.map((btn) => (
                    <button
                      key={btn.status}
                      type="button"
                      onClick={() => handleStatusChange(child._id, btn.status)}
                      className={`px-4 py-2 rounded-lg text-white transition ${
                        attendance[child._id]?.status === btn.status
                          ? btn.color
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Notes & Submit */}
          <div className="card mt-6">
            <div className="mb-4">
              <label className="label">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input"
                rows={3}
                placeholder="Any general notes for this attendance session..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={submitting} className="flex-1">
                Submit Attendance
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default TakeAttendance;
