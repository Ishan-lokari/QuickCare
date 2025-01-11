import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/home';
import OPDQueue from '@/pages/opd-queue';
import BedBooking from '@/pages/bed-booking';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminLogin from '@/pages/admin/login';
import { ProtectedRoute } from '@/components/protected-route';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/opd-queue" element={<OPDQueue />} />
      <Route path="/bed-booking" element={<BedBooking />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}