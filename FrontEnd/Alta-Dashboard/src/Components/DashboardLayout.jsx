import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <Link to="/" className="dashboard-logo">
          CodeForge <span>AI</span>
        </Link>

        <div className="dashboard-user">
          <div className="dashboard-user-info">
            <span className="dashboard-user-name">
              {user?.name || "User"}
            </span>

            <span className="dashboard-user-role">
              {user?.role || "student"}
            </span>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <p className="sidebar-title">Dashboard</p>

          {user?.role === "student" && (
            <>
              <Link to="/student" className="sidebar-link">
                Overview
              </Link>

              <Link to="/student/questions" className="sidebar-link">
                Question Bank
              </Link>
            </>
          )}

          {user?.role === "faculty" && (
            <>
              <Link to="/faculty" className="sidebar-link">
                Overview
              </Link>

              <Link to="/faculty/questions" className="sidebar-link">
                Manage Questions
              </Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link to="/admin" className="sidebar-link">
                Overview
              </Link>

              <Link to="/admin/questions" className="sidebar-link">
                Manage Questions
              </Link>
            </>
          )}

          <Link to="/account" className="sidebar-link">
            Account
          </Link>
        </aside>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;