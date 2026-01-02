import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { childrenAPI, classesAPI, groupsAPI, teachersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const RegisterChild = () => {
  const navigate = useNavigate();
  const { isParent, isAdmin, isTeacher } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [parents, setParents] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    groups: [],
    parent: '',
    allergies: '',
    medicalNotes: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [isAdmin, isTeacher]);

  const fetchData = async () => {
    try {
      const [classesRes, groupsRes] = await Promise.all([
        classesAPI.getAll(),
        groupsAPI.getAll(),
      ]);
      setClasses(classesRes.data);
      setGroups(groupsRes.data);

      // Fetch parents list if admin or teacher
      if (isAdmin || isTeacher) {
        try {
          const parentsRes = await teachersAPI.getParents();
          setParents(parentsRes.data);
        } catch (err) {
          console.error('Error fetching parents:', err);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: { ...prev.emergencyContact, [field]: value },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGroupChange = (groupId) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register child
      const response = await childrenAPI.register(formData);
      const childId = response.data._id;

      // Upload photo if provided
      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photo);
        await childrenAPI.uploadPhoto(childId, photoFormData);
      }

      toast.success('Child registered successfully!');
      navigate(isParent ? '/' : `/children/${childId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="page-title">Register Child</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <label className="btn btn-secondary cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            Upload Photo
          </label>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
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
            <label className="label">Last Name *</label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Parent (for admin/teacher) */}
        {(isAdmin || isTeacher) && (
          <div>
            <label className="label">Parent *</label>
            <select
              name="parent"
              value={formData.parent}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Parent</option>
              {parents.map((parent) => (
                <option key={parent._id} value={parent._id}>
                  {parent.firstName} {parent.lastName} - {parent.phoneNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Class */}
        <div>
          <label className="label">Class *</label>
          <select
            name="class"
            value={formData.class}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="">Select Class</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Groups */}
        <div>
          <label className="label">Groups (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {groups.map((group) => (
              <label
                key={group._id}
                className={`px-4 py-2 rounded-lg border cursor-pointer transition ${
                  formData.groups.includes(group._id)
                    ? 'bg-primary-100 border-primary-500 text-primary-700'
                    : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.groups.includes(group._id)}
                  onChange={() => handleGroupChange(group._id)}
                  className="hidden"
                />
                {group.name}
              </label>
            ))}
          </div>
        </div>

        {/* Medical Info */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Medical Information</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Allergies</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="input"
                rows={2}
                placeholder="List any allergies..."
              />
            </div>
            <div>
              <label className="label">Medical Notes</label>
              <textarea
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleChange}
                className="input"
                rows={2}
                placeholder="Any medical conditions or notes..."
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                name="emergency.name"
                value={formData.emergencyContact.name}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="emergency.phone"
                value={formData.emergencyContact.phone}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Relationship</label>
              <input
                type="text"
                name="emergency.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Uncle, Aunt"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" loading={loading} className="flex-1">
            Register Child
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterChild;
