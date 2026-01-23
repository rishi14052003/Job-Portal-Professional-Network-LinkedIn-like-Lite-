import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, resetUser } from '../redux/userSlice.js';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { persistor } from '../redux/store.js';
import '../design/style.css';
import companyLogo from '../assets/workaholic-high-resolution-logo.png';
import Footer from '../components/Footer.js';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Signin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorFields, setErrorFields] = useState({ email: false, password: false });
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!ready) return;

    setError('');
    setSuccessMsg('');
    setErrorFields({ email: false, password: false });

    if (!email || !password) {
      setError('Enter email and password');
      setErrorFields({ email: !email, password: !password });
      return;
    }
    if (!validateEmail(email)) {
      setError('Wrong Email Entered');
      setErrorFields({ email: true });
      return;
    }
    if (!validatePassword(password)) {
      setError('Password Format Incorrect');
      setErrorFields({ password: true });
      return;
    }

    try {
      localStorage.clear();
      sessionStorage.clear();
      await persistor.purge();
      dispatch(resetUser());

      const res = await axios.post(`${BASE_URL}/api/users/login`, {
        user_email: email,
        password,
      });

      const data = res.data;
      const details = data.userDetails || {};

      const userData = {
        user_email: data.user_email,
        token: data.token,
        loggedIn: true,
        role: details.role || '',
        name: details.name || '',
        age: details.age || '',
        companyName: details.companyName || '',
        location: details.location || '',
        company_id: details.company_id || null,
        companies: details.companies || [],
        skillsList: details.skillsList || [],
        experience: details.experience || '',
        appliedJobs: details.appliedJobs || [],
        detailsCompleted: details.detailsCompleted || false,
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(loginSuccess({ ...data, userDetails: userData }));

      setSuccessMsg('Login successful. Redirecting...');

      setTimeout(() => {
        // Get the intended destination from location state or default based on user role
        const from = location.state?.from?.pathname;
        if (from && from !== '/signin' && from !== '/register') {
          navigate(from, { replace: true });
        } else if (!userData.detailsCompleted) {
          navigate('/details', { replace: true });
        } else if (userData.role === 'company') {
          navigate('/companypage', { replace: true });
        } else if (userData.role === 'freelancer') {
          navigate('/freelancerpage', { replace: true });
        } else {
          navigate('/details', { replace: true });
        }
      }, 800);
    } catch (err) {
      if (err.response?.status === 404) setError('User not registered');
      else if (err.response?.status === 401) setError('Password incorrect');
      else setError('Login failed');
      setErrorFields({ email: true, password: true });
    }
  };

  return (
    <>
      <div className="signin-page-wrapper">
        <div className="signin-page-container">
          <div className="signin-card-container">
            <div className="signin-left-section">
              <div className="signin-header">
                <h1 className="signin-title">Welcome Back</h1>
                <p className="signin-subtitle">Sign in to continue to your account</p>
              </div>
              <form className="signin-form" onSubmit={handleLogin}>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

                {error && <div className="alert alert-error">{error}</div>}
                {successMsg && <div className="alert alert-success">{successMsg}</div>}

                <button type="submit" className="btn-primary signin-btn">Sign In</button>

                <div className="signin-footer">
                  Don't have an account? <a href="/register" className="signin-link">Create one</a>
                </div>
              </form>
            </div>

            <div className="signin-right-section">
              <div className="brand-content">
                <div className="brand-logo-container">
                  <img src={companyLogo} alt="Workaholic Logo" className="brand-logo-image" />
                </div>
                <h2 className="brand-name">Workaholic</h2>
                <p className="brand-tagline">Connect with talented freelancers and grow your business</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
