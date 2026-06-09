import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  FaGraduationCap, 
  FaUser, 
  FaSignOutAlt, 
  FaUserShield, 
  FaSun, 
  FaMoon, 
  FaGlobe 
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4 text-gradient" to="/">
          <FaGraduationCap className="me-2 text-primary fs-3" />
          E-Learn
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/">
                {t('home')}
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/courses">
                {t('courses')}
              </NavLink>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/my-courses">
                    {t('myCourses')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link px-3" to="/dashboard">
                    {t('dashboard')}
                  </NavLink>
                </li>
              </>
            )}
            {user && user.role === 'admin' && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle px-3 d-flex align-items-center text-warning"
                  href="#"
                  id="adminDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUserShield className="me-1" /> {t('adminPanel')}
                </a>
                <ul className="dropdown-menu dropdown-menu-dark border-secondary" aria-labelledby="adminDropdown">
                  <li>
                    <Link className="dropdown-item" to="/admin/dashboard">
                      {t('adminDashboard')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/courses">
                      {t('manageCourses')}
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/users">
                      {t('manageUsers')}
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="btn btn-outline-light d-flex align-items-center gap-1 px-3 py-1.5 rounded-pill me-1"
              title="Chuyển đổi ngôn ngữ / Switch Language"
              style={{ fontSize: '13px', minWidth: '70px', justifyContent: 'center' }}
            >
              <FaGlobe size={12} /> {language.toUpperCase()}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline-light d-flex align-items-center justify-content-center p-2 rounded-circle me-2"
              title={theme === 'light' ? "Chế độ tối / Dark Mode" : "Chế độ sáng / Light Mode"}
              style={{ width: '36px', height: '36px', border: '1px solid var(--border-color)' }}
            >
              {theme === 'light' ? <FaMoon size={14} className="text-primary" /> : <FaSun size={14} className="text-warning" />}
            </button>

            {user ? (
              <div className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-2 text-white bg-secondary bg-opacity-25 px-3 py-2 rounded-pill cursor-pointer"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullname}
                      className="rounded-circle object-fit-cover"
                      style={{ width: '30px', height: '30px' }}
                    />
                  ) : (
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '30px', height: '30px', fontSize: '13px' }}>
                      {user.fullname.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="d-none d-sm-inline">{user.fullname}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-secondary" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                      <FaUser size={12} /> {t('profile')}
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button onClick={handleLogout} className="dropdown-item d-flex align-items-center gap-2 text-danger">
                      <FaSignOutAlt size={12} /> {t('logout')}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light px-4 rounded-pill">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn btn-primary px-4 rounded-pill text-white shadow-sm">
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
