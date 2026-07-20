import { Link, useLocation } from 'react-router-dom';
import { Bot, BookOpen, Home } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <div className="brand-icon">
          <Bot size={22} color="var(--accent-primary)" />
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
