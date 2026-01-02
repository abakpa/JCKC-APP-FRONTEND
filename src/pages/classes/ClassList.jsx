import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await classesAPI.initialize();
      toast.success('Classes initialized successfully');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to initialize classes');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Classes</h1>
        {isAdmin && classes.length === 0 && (
          <Button onClick={handleInitialize}>Initialize Classes</Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Link
            key={classItem._id}
            to={`/classes/${classItem._id}`}
            className="card hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{classItem.name}</h2>
              <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                {classItem.childrenCount || 0} children
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {classItem.description || 'No description'}
            </p>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">Teachers:</p>
              {classItem.teachers?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {classItem.teachers.map((teacher) => (
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

      {classes.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">No classes found</p>
          {isAdmin && (
            <Button onClick={handleInitialize}>Initialize Default Classes</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassList;
