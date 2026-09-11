import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';
import '../components/components.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // FastAPI OAuth2PasswordRequestForm expects form data
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await axios.post('http://localhost:8000/auth/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        login(response.data.access_token, username);
        navigate('/');
      } else {
        // Registration
        await axios.post('http://localhost:8000/auth/register', {
          username,
          password
        });
        
        // After successful registration, log them in automatically
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await axios.post('http://localhost:8000/auth/login', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        login(response.data.access_token, username);
        navigate('/');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 80px)' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Enter your credentials to access your account' : 'Sign up to start using MineLawGPT'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
              <User size={18} />
            </div>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-secondary)' }}>
              <Lock size={18} />
            </div>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', paddingLeft: '3rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="glass-button primary-button" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
