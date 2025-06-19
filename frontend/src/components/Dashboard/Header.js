"use client";
import { useAuth } from "../../contexts/AuthContext";
import "./Header.css";

function Header({ user }) {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="dashboard-header-nav">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-logo">MedTracker</h1>
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-role">{user.role}</span>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
