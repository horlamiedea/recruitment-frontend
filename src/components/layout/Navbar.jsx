import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom'; // <-- Import NavLink

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = {
    color: '#3b82f6', // A blue color for the active link
    textDecoration: 'underline',
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">JRATS</Link>
        {user && (
            <NavLink 
                to="/jobs" 
                className="text-lg font-semibold hover:text-blue-500 transition-colors"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
                All Jobs
            </NavLink>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        {user && <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors font-semibold">Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;