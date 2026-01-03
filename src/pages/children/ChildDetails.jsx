import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childrenAPI, attendanceAPI, classesAPI, groupsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor, getStatusText, calculateAge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ChildDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTeacher } = useAuth();
  const [child, setChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Photo upload state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Transfer class state
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Group management state
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [joiningGroup, setJoiningGroup] = useState(false);

  useEffect(() => {
    fetchChild();
    fetchAttendance();
    fetchClassesAndGroups();
  }, [id]);

  const fetchChild = async () => {
    try {
      const response = await childrenAPI.getById(id);
      setChild(response.data);
    } catch (error) {
      toast.error('Failed to load child details');
      navigate('/children');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getChildHistory(id);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchClassesAndGroups = async () => {
    try {
      const [classesRes, groupsRes] = await Promise.all([
        classesAPI.getAll(),
        groupsAPI.getAll()
      ]);
      setClasses(classesRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching classes/groups:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      await childrenAPI.uploadPhoto(id, formData);
      toast.success('Photo uploaded successfully!');
      setUploadModalOpen(false);
      setSelectedFile(null);
      setPreview(null);
      fetchChild();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleTransferClass = async () => {
    if (!selectedClass) return;

    setTransferring(true);
    try {
      await childrenAPI.transferClass(id, selectedClass);
      toast.success('Child transferred to new class successfully!');
      setTransferModalOpen(false);
      setSelectedClass('');
      fetchChild();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to transfer class');
    } finally {
      setTransferring(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!selectedGroup) return;

    setJoiningGroup(true);
    try {
      await childrenAPI.joinGroup(id, selectedGroup);
      toast.success('Child added to group successfully!');
      setGroupModalOpen(false);
      setSelectedGroup('');
      fetchChild();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to group');
    } finally {
      setJoiningGroup(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!confirm('Remove child from this group?')) return;

    try {
      await childrenAPI.leaveGroup(id, groupId);
      toast.success('Child removed from group');
      fetchChild();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from group');
    }
  };

  if (loading) return <Loading />;
  if (!child) return null;

  const canManage = isAdmin || isTeacher;
  const availableGroups = groups.filter(g => !child.groups?.find(cg => cg._id === g._id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Child Details</h1>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* Child Info Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4">
              {child.photo ? (
                <img
                  src={child.photo}
                  alt={child.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-400">
                  {child.firstName?.[0]}{child.lastName?.[0]}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
            >
              {child.photo ? 'Change Photo' : 'Upload Photo'}
            </Button>
          </div>

          {/* Details */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Unique ID</p>
              <p className="font-mono font-medium">{child.uniqueId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{child.firstName} {child.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {formatDate(child.dateOfBirth)} ({calculateAge(child.dateOfBirth)} years old)
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium capitalize">{child.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">{child.class?.name}</p>
                {canManage && (
                  <button
                    onClick={() => setTransferModalOpen(true)}
                    className="text-primary-600 hover:text-primary-800 text-sm underline"
                  >
                    Transfer
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Groups</p>
              <div className="flex items-center gap-2 flex-wrap">
                {child.groups?.length > 0 ? (
                  child.groups.map(g => (
                    <span key={g._id} className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                      {g.name}
                      {canManage && (
                        <button
                          onClick={() => handleLeaveGroup(g._id)}
                          className="text-green-800 hover:text-red-600 ml-1"
                          title="Remove from group"
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">None</span>
                )}
                {canManage && availableGroups.length > 0 && (
                  <button
                    onClick={() => setGroupModalOpen(true)}
                    className="text-primary-600 hover:text-primary-800 text-sm underline"
                  >
                    + Add Group
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Parent Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{child.parent?.firstName} {child.parent?.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="font-medium">{child.parent?.phoneNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{child.parent?.email}</p>
          </div>
        </div>
      </div>

      {/* Medical Info */}
      {(child.allergies || child.medicalNotes) && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {child.allergies && (
              <div>
                <p className="text-sm text-gray-500">Allergies</p>
                <p className="font-medium">{child.allergies}</p>
              </div>
            )}
            {child.medicalNotes && (
              <div>
                <p className="text-sm text-gray-500">Medical Notes</p>
                <p className="font-medium">{child.medicalNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Contact */}
      {child.emergencyContact?.name && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{child.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{child.emergencyContact.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Relationship</p>
              <p className="font-medium">{child.emergencyContact.relationship}</p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Attendance History</h2>
        {attendance.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No attendance records</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Class/Group</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{formatDate(record.date)}</td>
                    <td className="py-2 px-4 capitalize">{record.type}</td>
                    <td className="py-2 px-4">
                      {record.class?.name || record.group?.name}
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

      {/* Upload Photo Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Photo"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden mb-4">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <label className="btn btn-secondary cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Select Photo
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUploadPhoto}
              loading={uploading}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transfer Class Modal */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer to Another Class"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Current class: <strong>{child.class?.name}</strong>
          </p>
          <div>
            <label className="label">Select New Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input"
            >
              <option value="">Choose a class...</option>
              {classes
                .filter(c => c._id !== child.class?._id)
                .map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTransferClass}
              loading={transferring}
              disabled={!selectedClass}
            >
              Transfer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add to Group Modal */}
      <Modal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        title="Add to Group"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Select Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="input"
            >
              <option value="">Choose a group...</option>
              {availableGroups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleJoinGroup}
              loading={joiningGroup}
              disabled={!selectedGroup}
            >
              Add to Group
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChildDetails;
