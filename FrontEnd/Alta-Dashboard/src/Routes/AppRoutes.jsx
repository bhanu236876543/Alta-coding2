import { Routes, Route } from "react-router-dom";

import Home from "../Components/Home";
import Login from "../Components/Login";
import Register from "../Components/Register";
import AuthSuccess from "../Components/AuthSuccess";
import Account from "../Components/Account";
import ManageTestCases from "../Components/ManageTestCases";
import StudentDashboard from "../Components/StudentDashboard";
import CodingPlatform from "../Components/CodingPlatform";
import QuestionBank from "../Components/QuestionBank";
import FacultyDashboard from "../Components/FacultyDashboard";
import FacultyQuestions from "../Components/FacultyQuestions";
import EditQuestion from "../Components/EditQuestion";
import AdminDashboard from "../Components/AdminDashboard";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import DashboardLayout from "../Components/DashboardLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/auth/success" element={<AuthSuccess />} />

      {/* Dashboard routes */}
      <Route element={<DashboardLayout />}>
        {/* Student dashboard */}
        <Route
          path="/student"
          element={
            <RoleRoute allowedRole="student">
              <StudentDashboard />
            </RoleRoute>
          }
        />


        {/* Student question bank */}
        <Route
          path="/student/questions"
          element={
            <RoleRoute allowedRole="student">
              <QuestionBank />
            </RoleRoute>
          }
        />

        {/* Temporary question bank route */}
        <Route
          path="/questions"
          element={
            <RoleRoute allowedRole="student">
              <QuestionBank />
            </RoleRoute>
          }
        />

        {/* Student coding platform */}
        <Route
          path="/student/coding"
          element={
            <RoleRoute allowedRole="student">
              <CodingPlatform />
            </RoleRoute>
          }
        />

        {/* Faculty dashboard */}
        <Route
          path="/faculty"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultyDashboard />
            </RoleRoute>
          }
        />

        {/* Faculty questions list */}
        <Route
          path="/faculty/questions"
          element={
            <RoleRoute allowedRole="faculty">
              <FacultyQuestions />
            </RoleRoute>
          }
        />
        
        {/* Faculty edit question */}
        <Route
          path="/faculty/questions/:questionId/edit"
          element={
            <RoleRoute allowedRole="faculty">
              <EditQuestion />
            </RoleRoute>
          }
        />

        {/* Faculty test case management */}
<Route
  path="/faculty/questions/:questionId/test-cases"
  element={
    <RoleRoute allowedRole="faculty">
      <ManageTestCases />
    </RoleRoute>
  }
/>
        {/* Admin dashboard */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRole="admin">
              <AdminDashboard />
            </RoleRoute>
          }
        />
      </Route>

      {/* Account route */}
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
