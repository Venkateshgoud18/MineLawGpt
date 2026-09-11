import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function MineLawIcon({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'stroke 0.2s ease' }}
    >
      {/* Shield (Law Protection) */}
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      {/* Pickaxe (Mining) */}
      <path d="M12 8v8" />
      <path d="M9 9c1.5-1 4.5-1 6 0" />
      {/* Scales (Justice) */}
      <path d="M8 12h8" />
      <path d="M10 12l-1 3.5h2L10 12" />
      <path d="M14 12l-1 3.5h2L14 12" />
    </svg>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, username, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <div className="brand-icon">
          <MineLawIcon size={22} color="var(--accent-primary)" />
        </div>
        <div>
          <span className="brand-name gradient-text">MineLawGPT</span>
          <span className="brand-sub">Regulatory AI Assistant</span>
        </div>
      </div>

      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Home size={16} />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/mining-laws"
              className={`nav-link ${location.pathname === '/mining-laws' ? 'active' : ''}`}
            >
              <BookOpen size={16} />
              <span>Mining Laws</span>
            </Link>
            
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 8px' }}></div>
            
            <div className="nav-link" style={{ cursor: 'default', color: 'var(--text-primary)' }}>
              <User size={16} />
              <span style={{ fontWeight: '500' }}>{username}</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="nav-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
              title="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          location.pathname !== '/login' && (
            <Link to="/login" className="nav-link active" style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}>
              <span>Sign In</span>
            </Link>
          )
        )}
      </div>
    </nav>
  );
}
