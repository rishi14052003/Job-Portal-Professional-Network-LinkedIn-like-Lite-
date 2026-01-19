import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { logout } from '../redux/userSlice.js';
import '../design/style.css';
import logoutImage from '../assets/logout.png'
import companyLogo from '../assets/workaholic-high-resolution-logo.png';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function CompanyPage() {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobsApplicants, setJobsApplicants] = useState({});
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmRespond, setConfirmRespond] = useState({ applicationId: null, action: null });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = (delay = 3000) => {
    setTimeout(() => {
      setErrorMessage('');
      setSuccessMessage('');
    }, delay);
  };

  const handleProfileClick = () => navigate('/company');
  const handleLogout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const fetchApplicantDetails = async (email) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/users/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.name || 'Unknown';
    } 
    catch {
      return 'Unknown';
    }
  };

  const fetchJobs = useCallback(async () => {
  if (!user.user_email) return;
  try {
    const res = await axios.get(`${BASE_URL}/api/jobs`);
    
    const allJobs = res.data.jobs || [];
    
    const companyJobs = allJobs.filter(j =>
      (user.company_id && j.company_id === user.company_id) ||
      (user.companyName && j.companyName === user.companyName)
    );
    
    setJobs(companyJobs);
  } 
  catch (error) {
    console.error('Fetch jobs error:', error);
    setJobs([]);
    setErrorMessage('Failed to fetch jobs.');
    clearMessages();
  }
}, [user.company_id, user.companyName, user.user_email]);

  const fetchApplicants = async (jobId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}/applications`);
      const applications = res.data || [];
      const applicationsWithNames = await Promise.all(
        applications.map(async (app) => {
          const user_name = await fetchApplicantDetails(app.user_email);
          return { ...app, user_name };
        })
      );
      setJobsApplicants(prev => ({ ...prev, [jobId]: applicationsWithNames }));
    } 
    catch {
      setJobsApplicants(prev => ({ ...prev, [jobId]: [] }));
    }
  };

  useEffect(() => {
    if (user.user_email) fetchJobs();
  }, [user.user_email, fetchJobs]);

  const handlePostOrUpdate = async () => {
    if (!title || !description || !location) {
      setErrorMessage('Title, location and description are required.');
      clearMessages();
      return;
    }

    if (editingJobId) {
      try {
        setUpdateLoading(true);
        await axios.put(`${BASE_URL}/api/jobs/${editingJobId}`, { title, description, location, user_email: user.user_email });
        setSuccessMessage('Job updated successfully!');
        setEditingJobId(null);
      } 
      catch {
        setErrorMessage('Update failed.');
      } 
      finally {
        setUpdateLoading(false);
        fetchJobs();
        clearMessages();
        setTitle(''); setDescription(''); setLocation('');
      }
    } else {
      try {
        await axios.post(`${BASE_URL}/api/jobs/create`, { user_email: user.user_email, title, description, location });
        setSuccessMessage('Job posted successfully!');
        fetchJobs();
      } catch {
        setErrorMessage('Failed to post job.');
      } finally {
        clearMessages();
        setTitle(''); setDescription(''); setLocation('');
      }
    }
  };

  const handleEditClick = (job) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDescription(job.description);
    setLocation(job.location);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setTitle(''); setDescription(''); setLocation('');
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setDeleteLoadingId(jobId);
      await axios.delete(`${BASE_URL}/api/jobs/${jobId}`, { params: { user_email: user.user_email } });
      setSuccessMessage('Job deleted successfully!');
      fetchJobs();
      setConfirmDeleteId(null);
    } catch {
      setErrorMessage('Delete failed.');
    } finally {
      setDeleteLoadingId(null);
      clearMessages();
    }
  };

  const handleRespond = (applicationId, action) => setConfirmRespond({ applicationId, action });

  const confirmRespondYes = async () => {
    const { applicationId, action } = confirmRespond;
    if (!applicationId || !action) return;
    try {
      await axios.put(`${BASE_URL}/api/jobs/applications/${applicationId}/respond`, { action });
      const jobId = Object.keys(jobsApplicants).find(k => (jobsApplicants[k] || []).some(a => a.applicationId === applicationId));
      if (jobId) fetchApplicants(jobId);
      setSuccessMessage(`Application ${action}ed successfully.`);
    } catch {
      setErrorMessage('Response failed.');
    } finally {
      setConfirmRespond({ applicationId: null, action: null });
      clearMessages();
    }
  };

  const confirmRespondNo = () => setConfirmRespond({ applicationId: null, action: null });

  const toggleApplicants = (jobId) => {
    if (expandedJobId === jobId) setExpandedJobId(null);
    else {
      setExpandedJobId(jobId);
      fetchApplicants(jobId);
    }
  };

  return (
    <div className="page-layout">
      <div className="company-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1 className="welcome-text">Welcome back, {user.name || 'Company'}!</h1>
            <p className="page-subtitle">Manage your job postings and find talented professionals</p>
          </div>
          <div className="header-controls">
            <button className="profile-button" onClick={handleProfileClick}>
              <User size={16} />
              Profile
            </button>
          </div>
        </div>
      </div>

      {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="content-grid">
        <div className="main-content">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">{editingJobId ? 'Edit Job' : 'Post a New Job'}</h2>
            </div>
            <div className="card-content">
              <div className="form-section">
                <div className="form-group">
                  <label className="form-label">Job Title*</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="input" 
                    placeholder="e.g. Senior Software Developer" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location*</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    className="input" 
                    placeholder="e.g. San Francisco, CA" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description*</label>
                  <textarea
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    className="input" 
                    placeholder="Describe the role, responsibilities, requirements, and what makes your company great"
                    rows={4}
                  />
                </div>

                <div className="button-row right-aligned">
                  <button 
                    className="button primary" 
                    onClick={handlePostOrUpdate} 
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Processing...' : (editingJobId ? 'Update Job' : 'Post Job')}
                  </button>
                  {editingJobId && (
                    <button className="button secondary" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Your Job Postings</h2>
              <span className="job-count">{jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}</span>
            </div>
            <div className="card-content">
              {jobs.length === 0 ? (
                <div className="empty-state">
                  <p className="muted">No jobs posted yet. Create your first job posting above!</p>
                </div>
              ) : (
                <div className="job-list">
                  {jobs.map(job => (
                    <div key={job.id} className="job-card-item">
                      <div className="job-content">
                        <h3 className="job-title">{job.title}</h3>
                        <p className="job-location">📍 {job.location}</p>
                        <p className="job-description">{job.description}</p>
                      </div>

                      <div className="job-actions">
                        <div className="action-buttons">
                          {confirmDeleteId === job.id ? (
                            <div className="delete-confirm-box">
                              <p>Are you sure you want to delete this job?</p>
                              <div className="button-row">
                                <button 
                                  className="button danger" 
                                  onClick={() => handleDeleteJob(job.id)} 
                                  disabled={deleteLoadingId === job.id}
                                >
                                  {deleteLoadingId === job.id ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button 
                                  className="button secondary" 
                                  onClick={() => setConfirmDeleteId(null)}
                                  disabled={deleteLoadingId === job.id}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button 
                                className="button secondary" 
                                onClick={() => handleEditClick(job)}
                              >
                                Edit
                              </button>
                              <button 
                                className="button danger" 
                                onClick={() => setConfirmDeleteId(job.id)}
                                disabled={deleteLoadingId === job.id}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                        <button 
                          className="button primary view-applicants-btn"
                          onClick={() => toggleApplicants(job.id)}
                        >
                          {expandedJobId === job.id ? 'Hide Applications' : 'View Applications'}
                        </button>
                      </div>

                      {expandedJobId === job.id && jobsApplicants[job.id] && (
                        <div className="applicants-container">
                          <h4>Applicants ({jobsApplicants[job.id].length})</h4>
                          {jobsApplicants[job.id].length === 0 ? (
                            <p className="muted">No applicants yet for this position.</p>
                          ) : (
                            <div className="applicants-list">
                              {jobsApplicants[job.id].map(app => (
                                <div key={app.applicationId} className="applicant-card">
                                  <div className="applicant-info">
                                    <div className="applicant-header">
                                      <strong>{app.user_name}</strong>
                                      <span className="applicant-email">{app.user_email}</span>
                                    </div>
                                    <div className="applicant-status">
                                      Status: <span className={`status-badge status-${app.status}`}>{app.status}</span>
                                    </div>
                                  </div>
                                  {app.status === 'pending' && (
                                    <div className="applicant-actions">
                                      {confirmRespond.applicationId === app.applicationId ? (
                                        <div className="confirm-boxfree">
                                          <span>Confirm your decision?</span>
                                          <div className="action-buttons">
                                            <button className="button primary" onClick={confirmRespondYes}>
                                              Yes
                                            </button>
                                            <button className="button secondary" onClick={confirmRespondNo}>
                                              No
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="action-buttons">
                                          <button 
                                            className="button primary accept-btn" 
                                            onClick={() => handleRespond(app.applicationId, 'accept')}
                                          >
                                            Accept
                                          </button>
                                          <button 
                                            className="button danger reject-btn" 
                                            onClick={() => handleRespond(app.applicationId, 'reject')}
                                          >
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Stats</h3>
            </div>
            <div className="card-content">
              <div className="stat-item">
                <span className="stat-number">{jobs.length}</span>
                <span className="stat-label">Active Jobs</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {Object.values(jobsApplicants).reduce((total, applicants) => total + applicants.length, 0)}
                </span>
                <span className="stat-label">Total Applicants</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {Object.values(jobsApplicants).reduce((total, applicants) => 
                    total + applicants.filter(app => app.status === 'pending').length, 0
                  )}
                </span>
                <span className="stat-label">Pending Review</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tips</h3>
            </div>
            <div className="card-content">
              <ul className="tips-list">
                <li>Write clear, detailed job descriptions</li>
                <li>Specify required skills and experience</li>
                <li>Include salary range when possible</li>
                <li>Respond to applicants promptly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}