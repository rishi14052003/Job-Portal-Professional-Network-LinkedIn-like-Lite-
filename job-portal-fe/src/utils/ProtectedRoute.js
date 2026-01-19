import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.user);
  const location = useLocation();

  const isAuth = user.loggedIn && user.token;

  if (!isAuth) {
    return <Navigate to="/signin" replace />;
  }

  const isOnDetailsPage = location.pathname === '/details';

  if (!user.detailsCompleted || !user.role) {
    if (isOnDetailsPage) {
      return children;
    }
    return <Navigate to="/details" replace />;
  }

  if (user.detailsCompleted && user.role) {
    if (isOnDetailsPage) {
      if (user.role === 'company') {
        return <Navigate to="/companypage" replace />;
      }
      if (user.role === 'freelancer') {
        return <Navigate to="/freelancerpage" replace />;
      }
    }

    const isFreelancerPath = location.pathname.includes('/freelancer');
    const isCompanyPath = location.pathname.includes('/company');

    if (user.role === 'company' && isFreelancerPath) {
      return <Navigate to="/companypage" replace />;
    }

    if (user.role === 'freelancer' && isCompanyPath) {
      return <Navigate to="/freelancerpage" replace />;
    }
  }

  return children;
}
