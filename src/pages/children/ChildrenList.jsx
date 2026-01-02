import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { childrenAPI, classesAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { formatDate } from '../../utils/helpers';

const ChildrenList = () => {
  const [children, setChildren] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    classId: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [filters, pagination.page]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.classId && { classId: filters.classId }),
      };

      const response = await childrenAPI.getAll(params);
      setChildren(response.data.children);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Children</h1>
        <Link to="/children/register">
          <Button>Register Child</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input"
            />
          </div>
          <div className="w-48">
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
          <Button type="submit">Search</Button>
        </form>
      </div>

      {/* Children Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loading />
        ) : children.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No children found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Photo</th>
                    <th className="text-left py-3 px-4 font-medium">ID</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Class</th>
                    <th className="text-left py-3 px-4 font-medium">Parent</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child) => (
                    <tr key={child._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 font-mono text-sm">{child.uniqueId}</td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/children/${child._id}`}
                          className="text-primary-600 hover:underline"
                        >
                          {child.firstName} {child.lastName}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{child.class?.name}</td>
                      <td className="py-3 px-4">
                        {child.parent?.firstName} {child.parent?.lastName}
                        <br />
                        <span className="text-sm text-gray-500">{child.parent?.phoneNumber}</span>
                      </td>
                      <td className="py-3 px-4">
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-4 p-4">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildrenList;
