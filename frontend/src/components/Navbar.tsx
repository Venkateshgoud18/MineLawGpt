import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home } from 'lucide-react';
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
      </div>
    </nav>
  );
}
