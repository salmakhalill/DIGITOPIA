import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/protectedRoute";
import MainLayout from "../layout/MainLayout";
import Home from "../pages/Home";
import Users from "../pages/Users";
import ReceivedReport from "../pages/ReceivedReport";
import Statistics from "../pages/Statistics";
import Setting from "../pages/Setting";
import Archive from "../pages/Archive";
import Privacy from "../pages/Privacy";
import Login from "../pages/login";
import ForgetPassword from "../pages/forgetPassword";
import NewPassword from "../pages/newPassword";
import UnauthorizedPage from "../pages/Unauthorized";

const AppRoutes = () => (
  <Routes>
    <Route index element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgetPassword" element={<ForgetPassword />} />
    <Route path="/newPassword" element={<NewPassword />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Home />} />
      <Route path="users" element={<Users />} />
      <Route path="received-report" element={<ReceivedReport />} />
      <Route path="statistics" element={<Statistics />} />
      <Route path="setting" element={<Setting />} />
      <Route path="archive" element={<Archive />} />
      <Route path="privacy" element={<Privacy />} />
    </Route>
    <Route path="/unauthorized" element={<UnauthorizedPage />} />{" "}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;