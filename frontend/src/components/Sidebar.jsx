import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Users, CreditCard, Stethoscope, LogOut } from 'lucide-react';
import { useUser } from '../context/UserContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useUser();

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2>OmniTool</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>
          <Home size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <CheckSquare size={20} />
          <span>Tasks & AI</span>
        </NavLink>
        <NavLink to="/social" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Friends</span>
        </NavLink>
        <NavLink to="/bills" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <CreditCard size={20} />
          <span>Split Bills</span>
        </NavLink>
        <NavLink to="/health" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <Stethoscope size={20} />
          <span>Plant/Pet Health</span>
        </NavLink>
      </nav>

      {user && (
        <div className="sidebar-footer">
          <div className="user-info">
            {user.pfpUrl ? (
              <img src={user.pfpUrl} alt="PFP" className="pfp-small" />
            ) : (
              <div className="pfp-placeholder">{user.name.charAt(0)}</div>
            )}
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-id">ID: {user.id}</span>
            </div>
          </div>
          <button onClick={logout} className="btn-ghost logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
