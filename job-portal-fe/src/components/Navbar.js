import React from 'react';
import { Search, Briefcase, Users, MessageSquare, Bell, Home, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../design/style.css';

export default function Navbar() {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/signin';
  };

  if (!user.loggedIn) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-brand" onClick={() => handleNavigation('/')}>
            <span className="brand-text">Workaholic</span>
          </div>
          <div className="navbar-search">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for jobs, companies, or people"
              className="search-input"
            />
          </div>
        </div>

        <div className="navbar-center">
          <div 
            className={`nav-item ${user.role === 'company' ? 'active' : ''}`}
            onClick={() => user.role === 'company' ? handleNavigation('/companypage') : handleNavigation('/freelancerpage')}
          >
            <Home size={24} />
            <span>Home</span>
          </div>
          <div className="nav-item">
            <Briefcase size={24} />
            <span>Jobs</span>
          </div>
          <div className="nav-item">
            <Users size={24} />
            <span>Network</span>
          </div>
          <div className="nav-item">
            <MessageSquare size={24} />
            <span>Messages</span>
          </div>
          <div className="nav-item">
            <Bell size={24} />
            <span>Notifications</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="nav-item profile-item" onClick={() => handleNavigation('/details')}>
            <User size={24} />
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-name">{user.name || 'User'}</div>
                <div className="profile-role">{user.role || 'Professional'}</div>
              </div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
