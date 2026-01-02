import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            JCKC
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:bg-primary-600 px-3 py-2 rounded">
              Dashboard
            </Link>

            {(isTeacher || isAdmin) && (
              <>
                <Link to="/children" className="hover:bg-primary-600 px-3 py-2 rounded">
                  Children
                </Link>
                <Link to="/classes" className="hover:bg-primary-600 px-3 py-2 rounded">
                  Classes
                </Link>
                <Link to="/groups" className="hover:bg-primary-600 px-3 py-2 rounded">
                  Groups
                </Link>
                <Link to="/attendance" className="hover:bg-primary-600 px-3 py-2 rounded">
                  Attendance
                </Link>
              </>
            )}

            {isAdmin && (
              <Link to="/teachers" className="hover:bg-primary-600 px-3 py-2 rounded">
                Teachers
              </Link>
            )}

            <Link to="/notifications" className="hover:bg-primary-600 px-3 py-2 rounded">
              Notifications
            </Link>

            <div className="flex items-center space-x-2 ml-4 border-l border-primary-500 pl-4">
              <span className="text-sm">{user?.firstName}</span>
              <button
                onClick={handleLogout}
                className="bg-primary-800 hover:bg-primary-900 px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/" className="block hover:bg-primary-600 px-3 py-2 rounded">
              Dashboard
            </Link>
            {(isTeacher || isAdmin) && (
              <>
                <Link to="/children" className="block hover:bg-primary-600 px-3 py-2 rounded">
                  Children
                </Link>
                <Link to="/classes" className="block hover:bg-primary-600 px-3 py-2 rounded">
                  Classes
                </Link>
                <Link to="/groups" className="block hover:bg-primary-600 px-3 py-2 rounded">
                  Groups
                </Link>
                <Link to="/attendance" className="block hover:bg-primary-600 px-3 py-2 rounded">
                  Attendance
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/teachers" className="block hover:bg-primary-600 px-3 py-2 rounded">
                Teachers
              </Link>
            )}
            <Link to="/notifications" className="block hover:bg-primary-600 px-3 py-2 rounded">
              Notifications
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left hover:bg-primary-600 px-3 py-2 rounded mt-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
