import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { classesAPI, childrenAPI, teachersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const ClassDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [classData, setClassData] = useState(null);
  const [children, setChildren] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [classRes, childrenRes] = await Promise.all([
        classesAPI.getById(id),
        childrenAPI.getByClass(id),
      ]);
      setClassData(classRes.data);
      setChildren(childrenRes.data);

      if (isAdmin) {
        const teachersRes = await teachersAPI.getAll();
        setTeachers(teachersRes.data);
      }
    } catch (error) {
      toast.error('Failed to load class details');
      navigate('/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      await classesAPI.assignTeacher(id, selectedTeacher);
      toast.success('Teacher assigned successfully');
      setAssignModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!confirm('Remove this teacher from the class?')) return;

    try {
      await classesAPI.removeTeacher(id, teacherId);
      toast.success('Teacher removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove teacher');
    }
  };

  if (loading) return <Loading />;
  if (!classData) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">{classData.name}</h1>
        <div className="flex gap-2">
          <Link to={`/attendance?type=class&classId=${id}`}>
            <Button>Take Attendance</Button>
          </Link>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {/* Class Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Class Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{classData.description || 'No description'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Children</p>
            <p className="font-medium">{children.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teachers</p>
            <p className="font-medium">{classData.teachers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Teachers */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Teachers</h2>
          {isAdmin && (
            <Button size="sm" onClick={() => setAssignModalOpen(true)}>
              Assign Teacher
            </Button>
          )}
        </div>

        {classData.teachers?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No teachers assigned</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classData.teachers?.map((teacher) => (
              <div
                key={teacher._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{teacher.phoneNumber}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveTeacher(teacher._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Children */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Children ({children.length})</h2>
        </div>

        {children.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No children in this class</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Photo</th>
                  <th className="text-left py-2 px-4">ID</th>
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Parent</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child._id} className="border-b">
                    <td className="py-2 px-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {child.photo ? (
                          <img
                            src={child.photo}
                            alt={child.firstName}
                            className="w-10 h-10 object-cover"
                          />
                        ) : (
                          <span className="text-primary-600 font-bold text-sm">
                            {child.firstName?.[0]}{child.lastName?.[0]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-4 font-mono text-sm">{child.uniqueId}</td>
                    <td className="py-2 px-4">
                      {child.firstName} {child.lastName}
                    </td>
                    <td className="py-2 px-4">
                      {child.parent?.firstName} {child.parent?.lastName}
                      <br />
                      <span className="text-sm text-gray-500">{child.parent?.phoneNumber}</span>
                    </td>
                    <td className="py-2 px-4">
                      <Link
                        to={`/children/${child._id}`}
                        className="text-primary-600 hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Teacher Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Teacher"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Select Teacher</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="input"
            >
              <option value="">Choose a teacher...</option>
              {teachers
                .filter(t => !classData.teachers?.find(ct => ct._id === t._id))
                .map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTeacher} disabled={!selectedTeacher}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassDetails;
