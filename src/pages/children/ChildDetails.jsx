import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { childrenAPI, attendanceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import { formatDate, getStatusColor, getStatusText, calculateAge } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ChildDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [child, setChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchChild();
    fetchAttendance();
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
      fetchChild();
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading />;
  if (!child) return null;

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
              <p className="font-medium">{child.class?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Groups</p>
              <p className="font-medium">
                {child.groups?.length > 0
                  ? child.groups.map(g => g.name).join(', ')
                  : 'None'}
              </p>
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
    </div>
  );
};

export default ChildDetails;
