import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import PrivateRoute from './components/common/PrivateRoute';
import Loading from './components/common/Loading';

// PWA Components
import InstallPrompt from './components/pwa/InstallPrompt';
import UpdatePrompt from './components/pwa/UpdatePrompt';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard Pages
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';

// Children Pages
import ChildrenList from './pages/children/ChildrenList';
import RegisterChild from './pages/children/RegisterChild';
import ChildDetails from './pages/children/ChildDetails';

// Classes Pages
import ClassList from './pages/classes/ClassList';
import ClassDetails from './pages/classes/ClassDetails';

// Groups Pages
import GroupList from './pages/groups/GroupList';
import GroupDetails from './pages/groups/GroupDetails';

// Attendance Pages
import TakeAttendance from './pages/attendance/TakeAttendance';
import AttendanceReports from './pages/attendance/AttendanceReports';

// Notifications
import NotificationsList from './pages/notifications/NotificationsList';

// Teachers
import TeacherList from './pages/teachers/TeacherList';

// Dashboard wrapper that shows the right dashboard based on user role
const Dashboard = () => {
  const { user, isTeacher, isAdmin, isParent } = useAuth();

  if (isTeacher || isAdmin) {
    return <TeacherDashboard />;
  }

  return <ParentDashboard />;
};

// Layout wrapper for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <Dashboard />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Children Routes */}
      <Route
        path="/children"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <ChildrenList />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/children/register"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <RegisterChild />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/children/:id"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <ChildDetails />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Classes Routes */}
      <Route
        path="/classes"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <ClassList />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/classes/:id"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <ClassDetails />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Groups Routes */}
      <Route
        path="/groups"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <GroupList />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/groups/:id"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <GroupDetails />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Attendance Routes */}
      <Route
        path="/attendance"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <TakeAttendance />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance/reports"
        element={
          <PrivateRoute roles={['teacher', 'admin']}>
            <AuthenticatedLayout>
              <AttendanceReports />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <AuthenticatedLayout>
              <NotificationsList />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Teachers (Admin only) */}
      <Route
        path="/teachers"
        element={
          <PrivateRoute roles={['admin']}>
            <AuthenticatedLayout>
              <TeacherList />
            </AuthenticatedLayout>
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        {/* PWA Components */}
        <InstallPrompt />
        <UpdatePrompt />
      </AuthProvider>
    </Router>
  );
};

export default App;
