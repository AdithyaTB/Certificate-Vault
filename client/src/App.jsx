import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Certificates from './pages/Certificates';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SharedView from './pages/SharedView';
import Settings from './pages/Settings';
import PrivateRoute from './routes/PrivateRoute';

// Admin
import AdminRoute from './routes/AdminRoute';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminPanel from './pages/Admin/AdminPanel';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300">
      <Toaster position="bottom-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shared/:token" element={<SharedView />} />

        {/* Admin (own auth) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Route>

        {/* User protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
