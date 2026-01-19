import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { registerSuccess, resetUser } from '../redux/userSlice.js';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../redux/store.js';
import '../design/style.css';
import companyLogo from '../assets/workaholic-high-resolution-logo.png';
import Footer from '../components/Footer.js';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user_email, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorFields, setErrorFields] = useState({ email: false, password: false, confirm: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clearPersist = async () => {
      localStorage.clear();
      sessionStorage.clear();
      await persistor.purge();
      dispatch(resetUser());
      setReady(true);
    };
    clearPersist();
  }, [dispatch]);

  const validateEmail = (email) => /^[^\s@]+@gmail\.com$/.test(email);
  const validatePassword = (password) => /^(?=.*[A-Z]).{8,}$/.test(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!ready) return;

    setError('');
    setSuccessMsg('');
    setErrorFields({ email: false, password: false, confirm: false });

    if (!user_email || !password || !confirmPassword) {
      setError('Please fill all fields');
      setErrorFields({ email: !user_email, password: !password, confirm: !confirmPassword });
      return;
    }
    if (!validateEmail(user_email)) {
      setError('Wrong email format');
      setErrorFields({ email: true });
      return;
    }
    if (!validatePassword(password)) {
      setError('Password format incorrect');
      setErrorFields({ password: true });
      return;
    }
    if (password !== confirmPassword) {
      setError('Password incorrect entered in both fields');
      setErrorFields({ confirm: true });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return;
      }

      localStorage.clear();
      sessionStorage.clear();
      await persistor.purge();
      dispatch(resetUser());

      const userData = {
        user_email: data.user_email,
        token: data.token,
        loggedIn: true,
        detailsCompleted: false,
        role: null,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(registerSuccess(userData));

      setSuccessMsg('Successfully registered. Redirecting...');
      setTimeout(() => navigate('/details', { replace: true }), 600);
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <>
      <div className="signin-page-wrapper">
        <div className="signin-page-container">
          <div className="signin-card-container">
            <div className="signin-left-section">
              <div className="signin-header">
                <h1 className="signin-title">Create Account</h1>
                <p className="signin-subtitle">Sign up to get started with Workaholic</p>
              </div>
              <form className="signin-form" onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <input
                      type="text"
                      placeholder="email@gmail.com"
                      value={user_email}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className={`form-input ${errorFields.email ? 'input-error' : ''}`}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-with-icon">
                    <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`form-input password-input ${errorFields.password ? 'input-error' : ''}`}
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="form-group">
  <label className="form-label">Confirm Password</label>
  <div className="input-with-icon">
    {/* Lock icon (same as Password field) */}
    <svg
      className="input-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>

    {/* Confirm Password input */}
    <input
      type={showConfirmPassword ? 'text' : 'password'}
      placeholder="Confirm password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className={`form-input password-input ${errorFields.confirm ? 'input-error' : ''}`}
    />

    {/* Show/Hide password toggle */}
    <button
      type="button"
      className="password-toggle"
      onClick={() => setShowConfirmPassword((prev) => !prev)}
    >
      {showConfirmPassword ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )}
    </button>
  </div>
</div>

                {error && <div className="alert alert-error">{error}</div>}
                {successMsg && <div className="alert alert-success">{successMsg}</div>}
                <button type="submit" className="btn-primary signin-btn">Register</button>
                <div className="signin-footer">
                  Already have an account? <a href="/signin" className="signin-link">Sign in</a>
                </div>
              </form>
            </div>
            <div className="signin-right-section">
              <div className="brand-content">
                <div className="brand-logo-container">
                  <img src={companyLogo} alt="Workaholic Logo" className="brand-logo-image" />
                </div>
                <h2 className="brand-name">Workaholic</h2>
                <p className="brand-tagline">Connect with talented freelancers and grow your business with the best professionals</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
