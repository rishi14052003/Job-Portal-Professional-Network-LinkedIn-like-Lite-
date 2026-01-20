import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Register from './pages/Register.js';
import Signin from './pages/Signin.js';
import Details from './pages/Details.js';
import CompanyPage from './pages/CompanyPage.js';
import FreelancerPage from './pages/FreelancerPage.js';
import Company from './pages/Company.js';
import Freelancer from './pages/Freelancer.js';
import ProtectedRoute from './utils/ProtectedRoute.js';
import Navbar from './components/Navbar.js';
import { loadUserFromStorage } from './redux/userSlice.js';

function RouterApp() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      dispatch(loadUserFromStorage());
    } catch (e) {
      console.error('Error loading user:', e);
    }
    const timer = setTimeout(() => setHydrated(true), 200);
    return () => clearTimeout(timer);
  }, [dispatch]);

  if (!hydrated) return null;

  return (
    <div className="app">
      {user.loggedIn && <Navbar />}
      <main className={`main-content ${user.loggedIn ? 'with-navbar' : ''}`}>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/details" element={<ProtectedRoute><Details /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute><Company /></ProtectedRoute>} />
          <Route path="/freelancer" element={<ProtectedRoute><Freelancer /></ProtectedRoute>} />
          <Route path="/companypage" element={<ProtectedRoute><CompanyPage /></ProtectedRoute>} />
          <Route path="/freelancerpage" element={<ProtectedRoute><FreelancerPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouterApp />
    </BrowserRouter>
  );
}
