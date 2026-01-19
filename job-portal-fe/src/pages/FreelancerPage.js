import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, Briefcase } from 'lucide-react';
import { logout, addAppliedJob, removeAppliedJob } from '../redux/userSlice';
import '../design/style.css';
import companyLogo from '../assets/workaholic-high-resolution-logo.png';
import logoutImage from '../assets/logout.png';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function FreelancerPage() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const user = useSelector(state => state.user);
	const [jobs, setJobs] = useState([]);
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalJobs: 0,
		limit: 10,
	});
	const [applyingJobIds, setApplyingJobIds] = useState([]);
	const [userApplications, setUserApplications] = useState({});
	const [checkingStatusIds, setCheckingStatusIds] = useState([]);
	const [showAppliedOverlay, setShowAppliedOverlay] = useState(false);
	const [withdrawConfirm, setWithdrawConfirm] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');

	const fetchJobs = useCallback((page = 1, limit = 10) => {
		axios.get(`${BASE_URL}/api/jobs?page=${page}&limit=${limit}`)
			.then(res => {
				setJobs(res.data.jobs || []);
				setPagination({
					currentPage: res.data.currentPage || 1,
					totalPages: res.data.totalPages || 1,
					totalJobs: res.data.totalJobs || 0,
					limit: res.data.limit || 10,
				});
			})
			.catch(err => console.error(err));
	}, []);

	const fetchUserApplications = useCallback(() => {
		const email = user?.user_email;
		if (!email) return;
		axios.get(`${BASE_URL}/api/jobs/freelancer/${email}/applications`)
			.then(res => {
				const map = {};
				(res.data.applications || []).forEach(a => {
					map[a.job_id] = a;
				});
				setUserApplications(map);
				try {
					const appliedIds = Object.keys(map).map(k => Number(k));
					appliedIds.forEach(id => {
						try { dispatch(addAppliedJob(id)); } catch (e) { }
					});
				} catch (e) { }
			})
			.catch(err => console.error(err));
	}, [user?.user_email, dispatch]);

	useEffect(() => {
		if (!user?.user_email) return;
		fetchJobs(pagination.currentPage, pagination.limit);
		fetchUserApplications();
	}, [user, fetchJobs, fetchUserApplications, navigate, pagination.currentPage, pagination.limit]);

	const handleProfileClick = () => navigate('/freelancer');

	const handleLogout = () => {
		dispatch(logout());
		navigate('/signin');
	};

	const handleApply = jobId => {
		if (!user.user_email) return;
		const appliedJobs = Array.isArray(user.appliedJobs) ? user.appliedJobs : [];
		if (appliedJobs.includes(jobId) || (userApplications[jobId] && userApplications[jobId].status)) return;
		setApplyingJobIds(prev => [...prev, jobId]);
		axios.post(`${BASE_URL}/api/jobs/apply`, { user_email: user.user_email, job_id: jobId })
			.then(() => {
				dispatch(addAppliedJob(jobId));
				setUserApplications(prev => ({
					...prev,
					[jobId]: { job_id: jobId, user_email: user.user_email, status: 'pending' }
				}));
			})
			.catch(err => console.error(err))
			.finally(() => setApplyingJobIds(prev => prev.filter(id => id !== jobId)));
	};

	const handleCheckStatus = async jobId => {
		if (!user.user_email) return;
		if (checkingStatusIds.includes(jobId)) return;
		setCheckingStatusIds(prev => [...prev, jobId]);
		try {
			const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}/applications`);
			const apps = res.data || [];
			const app = apps.find(a => a.user_email === user.user_email);
			if (app && app.status) {
				setUserApplications(prev => ({ ...prev, [jobId]: { ...app, job_id: jobId } }));
			} else if (app) {
				setUserApplications(prev => ({ ...prev, [jobId]: { ...app, job_id: jobId, status: 'pending' } }));
			} else {
				setUserApplications(prev => ({ ...prev, [jobId]: null }));
			}
		} catch (err) {
			console.error(err);
		} finally {
			setCheckingStatusIds(prev => prev.filter(id => id !== jobId));
		}
	};

	const handleWithdraw = async jobId => {
		try {
			const res = await axios.get(`${BASE_URL}/api/jobs/${jobId}/applications`);
			const applications = res.data || [];
			const currentApp = applications.find(a => a.user_email === user.user_email);
			if (currentApp && currentApp.status && currentApp.status !== 'pending') {
				setErrorMessage("You cannot withdraw this application because its status has been updated.");
				setWithdrawConfirm(null);
				setUserApplications(prev => ({ ...prev, [jobId]: { ...currentApp, job_id: jobId } }));
				setTimeout(() => setErrorMessage(''), 2000);
				return;
			}
			await axios.delete(`${BASE_URL}/api/jobs/withdraw`, { data: { user_email: user.user_email, job_id: jobId } });
			setUserApplications(prev => {
				const updated = { ...prev };
				delete updated[jobId];
				return updated;
			});
			dispatch(removeAppliedJob(jobId));
			setWithdrawConfirm(null);
		} catch (err) {
			console.error(err);
			setErrorMessage("Something went wrong while withdrawing your application. Please try again.");
			setTimeout(() => setErrorMessage(''), 4000);
		}
	};

	const appliedJobs = jobs.filter(job =>
		userApplications[job.id] || (Array.isArray(user.appliedJobs) && user.appliedJobs.includes(job.id))
	);

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			setPagination(prev => ({ ...prev, currentPage: newPage }));
			fetchJobs(newPage, pagination.limit);
		}
	};

	return (
		<div className="page-layout">
			<div className="freelancer-header">
				<div className="header-content">
					<div className="welcome-section">
						<h1 className="welcome-text">Welcome back, {user.name || 'Freelancer'}!</h1>
						<p className="page-subtitle">Discover exciting opportunities and grow your career</p>
					</div>
					<div className="header-controls">
						<button className="profile-button" onClick={handleProfileClick}>
							<User size={16} />
							Profile
						</button>
						<button className="profile-button" onClick={() => setShowAppliedOverlay(true)}>
							<Briefcase size={16} />
							Applied Jobs
						</button>
					</div>
				</div>
			</div>

			{errorMessage && <div className="alert alert-error">{errorMessage}</div>}

			<div className="job-container">
				<div className="card">
					<div className="card-header">
						<h2 className="card-title">Available Opportunities</h2>
						<span className="job-count">{pagination.totalJobs} total jobs</span>
					</div>
					<div className="card-content">
						{jobs.length === 0 && pagination.currentPage === 1 ? (
							<div className="empty-state">
								<p className="no-jobs">No opportunities available at the moment.</p>
								<p className="muted">Check back later for new job postings!</p>
							</div>
						) : jobs.length === 0 && pagination.currentPage > 1 ? (
							<div className="empty-state">
								<p className="no-jobs">No jobs found on this page.</p>
							</div>
						) : (
							<div className="job-grid">
								{jobs.map(job => {
									const application = userApplications[job.id];
									const applicationStatus = application?.status;
									const hasStatus = application && applicationStatus;
									const isAppliedViaRedux = Array.isArray(user.appliedJobs) && user.appliedJobs.includes(job.id);
									const isApplied = hasStatus || isAppliedViaRedux;
									return (
										<div key={job.id} className="job-card-item">
											<div className="job-content">
												<h3 className="job-title">{job.title}</h3>
												<p className="job-location">📍 {job.location}</p>
												<p className="job-company">🏢 {job.companyName}</p>
												<p className="job-description">{job.description}</p>
											</div>
											<div className="job-actions">
												{hasStatus ? (
													<>
														{applicationStatus === 'pending' && (
															<button 
																className="button danger" 
																onClick={() => setWithdrawConfirm(job.id)}
															>
																Withdraw Application
															</button>
														)}
														<button className={`status-button status-${applicationStatus}`} disabled>
															{applicationStatus === 'pending'
																? 'Application Pending'
																: applicationStatus === 'accept'
																	? 'Application Accepted'
																	: 'Application Rejected'}
														</button>
													</>
												) : isApplied ? (
													checkingStatusIds.includes(job.id) ? (
														<button className="status-button" disabled>
															Checking Status...
														</button>
													) : (
														<button className="check-btn" onClick={() => handleCheckStatus(job.id)}>
															Check Status
														</button>
													)
												) : (
													<button
														onClick={() => handleApply(job.id)}
														className="button primary"
														disabled={applyingJobIds.includes(job.id)}
													>
														{applyingJobIds.includes(job.id) ? 'Applying...' : 'Apply Now'}
													</button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>

				{pagination.totalPages > 1 && (
					<div className="pagination-controls">
						<button
							onClick={() => handlePageChange(pagination.currentPage - 1)}
							disabled={pagination.currentPage === 1}
							className="pagination-button"
						>
							Previous
						</button>
						<span>Page {pagination.currentPage} of {pagination.totalPages}</span>
						<button
							onClick={() => handlePageChange(pagination.currentPage + 1)}
							disabled={pagination.currentPage === pagination.totalPages}
							className="pagination-button"
						>
							Next
						</button>
					</div>
				)}
			</div>

			{showAppliedOverlay && (
				<div className="overlay">
					<div className="overlay-content">
						<button className="close-overlay" onClick={() => setShowAppliedOverlay(false)}>×</button>
						<h2 className="card-title">Your Applied Jobs</h2>
						{appliedJobs.length === 0 ? (
							<div className="empty-state">
								<p>You haven't applied to any jobs yet.</p>
								<p className="muted">Start exploring opportunities above!</p>
							</div>
						) : (
							<div className="job-grid">
								{appliedJobs.map(job => {
									const status = userApplications[job.id]?.status || 'pending';
									return (
										<div key={job.id} className="job-card-item">
											<div className="job-content">
												<h3 className="job-title">{job.title}</h3>
												<p className="job-location">📍 {job.location}</p>
												<p className="job-company">🏢 {job.companyName}</p>
												<p className="job-description">{job.description}</p>
												<div className="application-status">
													Status: <span className={`status-badge status-${status}`}>{status}</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}

			{withdrawConfirm && (
				<div className="overlay">
					<div className="overlay-content">
						<h3 className="card-title">Confirm Withdrawal</h3>
						<p>Are you sure you want to withdraw your application for this position?</p>
						<div className="button-row">
							<button className="button danger" onClick={() => handleWithdraw(withdrawConfirm)}>
								Yes, Withdraw
							</button>
							<button className="button secondary" onClick={() => setWithdrawConfirm(null)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
