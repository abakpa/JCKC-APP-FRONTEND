import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      setGroups(response.data);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await groupsAPI.initialize();
      toast.success('Groups initialized successfully');
      fetchGroups();
    } catch (error) {
      toast.error('Failed to initialize groups');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Groups</h1>
        {isAdmin && groups.length === 0 && (
          <Button onClick={handleInitialize}>Initialize Groups</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <Link
            key={group._id}
            to={`/groups/${group._id}`}
            className="card hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{group.name}</h2>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                {group.membersCount || 0} members
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {group.description || 'No description'}
            </p>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Teachers:</p>
              {group.teachers?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.teachers.map((teacher) => (
                    <span
                      key={teacher._id}
                      className="bg-gray-100 px-2 py-1 rounded text-sm"
                    >
                      {teacher.firstName} {teacher.lastName}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No teachers assigned</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">No groups found</p>
          {isAdmin && (
            <Button onClick={handleInitialize}>Initialize Default Groups</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupList;
