import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    <div className="card center-card">
      <div className="freelancer-header">
        <img src={companyLogo} alt="Company Logo" width="150" height="150" />
        <h3>Workaholic Dashboard</h3>
        <div className="header-controls">
          <button type="button"className="profile-button" onClick={handleProfileClick}>Profile</button>
          <button type="button"className="profile-button" onClick={handleLogout} aria-label="Logout">
            <img 
              src={logoutImage} 
              alt="Logout" 
              width="20" 
              height="20" 
              style={{ verticalAlign: 'middle' }}
            />
          </button>
        </div>
      </div>

      {errorMessage && <p className="error2">{errorMessage}</p>}
      {successMessage && <p className="success2">{successMessage}</p>}

      <div className="form3">
        <h3>{editingJobId ? 'Edit Job' : 'Post a Job'}</h3>
        <label className="cplabel"><strong>Job Title*</strong></label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="e.g. Software Developer" />

        <label className="cplabel"><strong>Location*</strong></label>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="e.g. Gujarat, India" />

        <label className="cplabel"><strong>Job Description*</strong></label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="Describe role, responsibilities and requirements" />

        <div className="button-row">
          <button className="buttonpj" onClick={handlePostOrUpdate} disabled={updateLoading}>
            {editingJobId ? (updateLoading ? 'Updating...' : 'Update Job') : 'Post Job'}
          </button>
          {editingJobId && <button className="buttonpj" onClick={handleCancelEdit}>Cancel</button>}
        </div>

        <h3>Jobs Posted</h3>
        {jobs.length === 0 ? <p className="muted">No jobs posted</p> : (
          <ul className="output">
            {jobs.map(job => (
              <li key={job.id} className="entry-item job-item">
                <div className="entry-text job-entry-text">
                  <p><strong>Title:</strong> {job.title}</p>
                  <p><strong>Location:</strong> {job.location}</p>
                  <p><strong>Description:</strong> {job.description}</p>
                </div>

                <div className="job-actions">
                  {expandedJobId !== job.id && (
                    <div className="button-row">
                      {confirmDeleteId === job.id ? (
                        <div className="delete-confirm-box">
                          <p>You sure?</p>
                          <div className="buttondcp">
                            <button className="buttonert1" onClick={() => handleDeleteJob(job.id)} disabled={deleteLoadingId === job.id}>
                              {deleteLoadingId === job.id ? 'Deleting...' : 'Yes'}
                            </button>
                            <button className="buttonert1" onClick={() => setConfirmDeleteId(null)} disabled={deleteLoadingId === job.id}>No</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button className="buttondcpage edit-btn" onClick={() => handleEditClick(job)}>Edit</button>
                          <button className="buttondcpage delete-btn" onClick={() => setConfirmDeleteId(job.id)} disabled={deleteLoadingId === job.id}>Delete</button>
                        </>
                      )}
                    </div>
                  )}
                  <div className="button-row job-applicants-toggle-button">
                    {confirmDeleteId !== job.id && (
                      <button className="buttondcpage application-btn" onClick={() => toggleApplicants(job.id)}>
                        {expandedJobId === job.id ? 'Hide Applications' : 'View Applications'}
                      </button>
                    )}
                  </div>
                </div>

                {expandedJobId === job.id && jobsApplicants[job.id] && (
                  <div className="applicants-container full-width-container">
                    <h4>Applicants:</h4>
                    {jobsApplicants[job.id].length === 0 ? <p className="muted">No applicants for this job yet.</p> : (
                      <ul className="output applicants-list">
                        {jobsApplicants[job.id].map(app => (
                          <li key={app.applicationId} className="entry-item applicant-item">
                            <div className="entry-text applicant-info">
                              <p><strong>Email:</strong> {app.user_email}</p>
                              <p><strong>Name:</strong> {app.user_name}</p>
                              <p><strong>Status:</strong> <strong className={`status-${app.status}`}>{app.status}</strong></p>
                            </div>
                            {app.status === 'pending' && (
                              <div className="button-row applicant-actions">
                                {confirmRespond.applicationId === app.applicationId ? (
                                  <div className="confirm-boxfree">
                                    <span>You sure?</span>
                                    <div className="action-buttons">
                                      <button className="buttoncpyes" onClick={confirmRespondYes}>Yes</button>
                                      <button className="buttoncpno" onClick={confirmRespondNo}>No</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <button className="button accept-btn" onClick={() => handleRespond(app.applicationId, 'accept')}>Accept</button>
                                    <button className="button reject-btn" onClick={() => handleRespond(app.applicationId, 'reject')}>Reject</button>
                                  </>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}