import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
		<div className="card">
			<div className="freelancer-header">
				<img src={companyLogo} alt="Company Logo" width="150" height="150" />
				<h3>Freelancer Job Portal</h3>
				<div className="header-controls">
					<button type="button"className="profile-button" onClick={handleProfileClick}>Profile</button>
					<button type="button"className="profile-button" onClick={() => setShowAppliedOverlay(true)}>Applied Jobs</button>
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

			<div className="job-container">
				<h3>Available Jobs ({pagination.totalJobs} total)</h3>
				{jobs.length === 0 && pagination.currentPage === 1 ? (
					<p className="no-jobs">No jobs available</p>
				) : jobs.length === 0 && pagination.currentPage > 1 ? (
					<p className="no-jobs">No jobs found on this page</p>
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
									<div className="job-info">
										<p><strong>Company:</strong> {job.companyName}</p>
										<p><strong>Title:</strong> {job.title}</p>
										<p><strong>Location:</strong> {job.location}</p>
										<p><strong>Description:</strong> {job.description}</p>
									</div>
									<div className="button-row">
										{hasStatus ? (
											<>
												{applicationStatus === 'pending' && (
													<button className="status-button" onClick={() => setWithdrawConfirm(job.id)}>Withdraw</button>
												)}
												<button className={`status-button status-${applicationStatus}`} disabled>
													{applicationStatus === 'pending'
														? 'Pending'
														: applicationStatus === 'accept'
															? 'Accepted'
															: 'Rejected'}
												</button>
											</>
										) : isApplied ? (
											checkingStatusIds.includes(job.id) ? (
												<button className="status-button" disabled>Checking...</button>
											) : (
												<button className="check-btn" onClick={() => handleCheckStatus(job.id)}>Check Status</button>
											)
										) : (
											<button
												onClick={() => handleApply(job.id)}
												className="button"
												disabled={applyingJobIds.includes(job.id)}
											>
												{applyingJobIds.includes(job.id) ? 'Applying...' : 'Apply'}
											</button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
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
						<h3>Your Applied Jobs</h3>
						{appliedJobs.length === 0 ? (
							<p>No applied jobs yet.</p>
						) : (
							<div className="job-grid">
								{appliedJobs.map(job => {
									const status = userApplications[job.id]?.status || 'pending';
									return (
										<div key={job.id} className="job-card-item">
											<div className="job-info">
												<p><strong>Company:</strong> {job.companyName}</p>
												<p><strong>Title:</strong> {job.title}</p>
												<p><strong>Description:</strong> {job.description}</p>
												<p><strong>Location:</strong> {job.location}</p>
												<p><strong>Status:</strong> <span className={`status-${status}`}>{status}</span></p>
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
						<h3>Are you sure you want to withdraw your application?</h3>
						<div>
							<button className="withdrawbuttonfp" onClick={() => handleWithdraw(withdrawConfirm)}>Yes</button>
							<button className="withdrawbuttonfp" onClick={() => setWithdrawConfirm(null)}>No</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
