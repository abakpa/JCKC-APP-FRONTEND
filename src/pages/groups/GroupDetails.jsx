import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupsAPI, childrenAPI, teachersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTeacher } = useAuth();
  const [group, setGroup] = useState(null);
  const [children, setChildren] = useState([]);
  const [allChildren, setAllChildren] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignTeacherModal, setAssignTeacherModal] = useState(false);
  const [addChildModal, setAddChildModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [groupRes, childrenRes] = await Promise.all([
        groupsAPI.getById(id),
        childrenAPI.getByGroup(id),
      ]);
      setGroup(groupRes.data);
      setChildren(childrenRes.data);

      if (isAdmin || isTeacher) {
        const [teachersRes, allChildrenRes] = await Promise.all([
          teachersAPI.getAll(),
          childrenAPI.getAll({ limit: 100 }),
        ]);
        setTeachers(teachersRes.data);
        setAllChildren(allChildrenRes.data.children);
      }
    } catch (error) {
      toast.error('Failed to load group details');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      await groupsAPI.assignTeacher(id, selectedTeacher);
      toast.success('Teacher assigned successfully');
      setAssignTeacherModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!confirm('Remove this teacher from the group?')) return;

    try {
      await groupsAPI.removeTeacher(id, teacherId);
      toast.success('Teacher removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove teacher');
    }
  };

  const handleAddChild = async () => {
    if (!selectedChild) return;

    try {
      await groupsAPI.addChild(id, selectedChild);
      toast.success('Child added to group');
      setAddChildModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to add child');
    }
  };

  const handleRemoveChild = async (childId) => {
    if (!confirm('Remove this child from the group?')) return;

    try {
      await groupsAPI.removeChild(id, childId);
      toast.success('Child removed from group');
      fetchData();
    } catch (error) {
      toast.error('Failed to remove child');
    }
  };

  if (loading) return <Loading />;
  if (!group) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">{group.name}</h1>
        <div className="flex gap-2">
          <Link to={`/attendance?type=group&groupId=${id}`}>
            <Button>Take Attendance</Button>
          </Link>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>

      {/* Group Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Group Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{group.description || 'No description'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Members</p>
            <p className="font-medium">{children.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Teachers</p>
            <p className="font-medium">{group.teachers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Teachers */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Teachers</h2>
          {isAdmin && (
            <Button size="sm" onClick={() => setAssignTeacherModal(true)}>
              Assign Teacher
            </Button>
          )}
        </div>

        {group.teachers?.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No teachers assigned</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.teachers?.map((teacher) => (
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

      {/* Members */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Members ({children.length})</h2>
          {(isAdmin || isTeacher) && (
            <Button size="sm" onClick={() => setAddChildModal(true)}>
              Add Child
            </Button>
          )}
        </div>

        {children.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No children in this group</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Photo</th>
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Class</th>
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
                    <td className="py-2 px-4">
                      {child.firstName} {child.lastName}
                    </td>
                    <td className="py-2 px-4">{child.class?.name}</td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/children/${child._id}`}
                          className="text-primary-600 hover:underline text-sm"
                        >
                          View
                        </Link>
                        {(isAdmin || isTeacher) && (
                          <button
                            onClick={() => handleRemoveChild(child._id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
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
        isOpen={assignTeacherModal}
        onClose={() => setAssignTeacherModal(false)}
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
                .filter(t => !group.teachers?.find(gt => gt._id === t._id))
                .map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setAssignTeacherModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTeacher} disabled={!selectedTeacher}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Child Modal */}
      <Modal
        isOpen={addChildModal}
        onClose={() => setAddChildModal(false)}
        title="Add Child to Group"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Select Child</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="input"
            >
              <option value="">Choose a child...</option>
              {allChildren
                .filter(c => !children.find(gc => gc._id === c._id))
                .map((child) => (
                  <option key={child._id} value={child._id}>
                    {child.firstName} {child.lastName} ({child.uniqueId})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setAddChildModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddChild} disabled={!selectedChild}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupDetails;
