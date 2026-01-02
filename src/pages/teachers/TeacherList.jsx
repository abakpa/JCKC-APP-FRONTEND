import { useState, useEffect } from 'react';
import { teachersAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll();
      setTeachers(response.data);
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await teachersAPI.create(formData);
      toast.success('Teacher created successfully');
      setModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
      });
      fetchTeachers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Are you sure you want to deactivate this teacher?')) return;

    try {
      await teachersAPI.delete(id);
      toast.success('Teacher deactivated');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to deactivate teacher');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Teachers</h1>
        <Button onClick={() => setModalOpen(true)}>Add Teacher</Button>
      </div>

      {teachers.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">No teachers found</p>
          <Button onClick={() => setModalOpen(true)}>Add First Teacher</Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned Classes</th>
                  <th className="text-left py-3 px-4 font-medium">Assigned Groups</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-sm">
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </span>
                        </div>
                        <span>{teacher.firstName} {teacher.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{teacher.email}</td>
                    <td className="py-3 px-4">{teacher.phoneNumber}</td>
                    <td className="py-3 px-4">
                      {teacher.assignedClasses?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.assignedClasses.map((cls) => (
                            <span
                              key={cls._id}
                              className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-xs"
                            >
                              {cls.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {teacher.assignedGroups?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.assignedGroups.map((group) => (
                            <span
                              key={group._id}
                              className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                            >
                              {group.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeactivate(teacher._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Teacher"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              minLength={6}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Teacher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherList;
