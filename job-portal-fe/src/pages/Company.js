import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, updateDetails } from '../redux/userSlice.js'
import { Building, MapPin, Edit2, Save, X, Briefcase, Users, LogOut } from 'lucide-react'
import axiosInstance from '../utils/axiosInstance.js'
import '../design/style.css'

export default function Company() {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState(user.companies?.[0]?.companyName || '')
  const [location, setLocation] = useState(user.companies?.[0]?.location || '')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user.user_email) return

        setLoading(true)
        const res = await axiosInstance.get(`/api/users/${user.user_email}`)
        const fetched = res.data

        if (fetched) {
          // Update Redux store with fresh data
          const updatePayload = {
            name: fetched.name || user.name,
            age: fetched.age || user.age,
            role: fetched.role || user.role,
            companies: fetched.companies || [],
            companyName: fetched.companies?.[0]?.companyName || '',
            location: fetched.companies?.[0]?.location || '',
            skillsList: fetched.skillsList || [],
            experience: fetched.experience || '',
            detailsCompleted: fetched.detailsCompleted || false,
          }
          dispatch(updateDetails(updatePayload))

          // Update local state
          if (fetched.companies && fetched.companies.length > 0) {
            setCompanyName(fetched.companies[0].companyName)
            setLocation(fetched.companies[0].location)
          }
        }
      } catch (err) {
        console.error('Error fetching company data:', err)
        setError('Failed to load company data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user.user_email, dispatch])

  const handleEdit = () => {
    setEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset to original values
    if (user.companies && user.companies.length > 0) {
      setCompanyName(user.companies[0].companyName)
      setLocation(user.companies[0].location)
    }
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!companyName.trim() || !location.trim()) {
      setError('Company name and location are required')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const updatedCompanies = [{ companyName: companyName.trim(), location: location.trim() }]

      const res = await axiosInstance.put(
        '/api/users/update',
        {
          user_email: user.user_email,
          name: user.name,
          age: user.age,
          role: user.role,
          companies: updatedCompanies,
          companyName: companyName.trim(),
          location: location.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.data.success) {
        // Update Redux store
        const updatePayload = {
          companies: updatedCompanies,
          companyName: companyName.trim(),
          location: location.trim(),
        }
        dispatch(updateDetails(updatePayload))

        setSuccess('Company details updated successfully!')
        setEditing(false)
      } else {
        setError(res.data.message || 'Failed to update company details')
      }
    } catch (err) {
      console.error('Error updating company details:', err)
      setError('Failed to update company details')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    navigate('/signin')
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading company profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <Building size={48} />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name || 'Company User'}</h1>
          <p className="profile-role">Company Account</p>
          <div className="profile-stats">
            <div className="stat-item">
              <Briefcase size={20} />
              <span>Active Jobs</span>
            </div>
            <div className="stat-item">
              <Users size={20} />
              <span>Network</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {!editing ? (
            <button className="btn-edit" onClick={handleEdit}>
              <Edit2 size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSave}>
                <Save size={16} />
                Save
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <h2>Company Information</h2>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">
                  <Building size={18} />
                  Company Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="info-input"
                    placeholder="Enter company name"
                  />
                ) : (
                  <p className="info-value">
                    {user.companies?.[0]?.companyName || 'Not specified'}
                  </p>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">
                  <MapPin size={18} />
                  Location
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="info-input"
                    placeholder="Enter location"
                  />
                ) : (
                  <p className="info-value">
                    {user.companies?.[0]?.location || 'Not specified'}
                  </p>
                )}
              </div>

              <div className="info-item">
                <label className="info-label">Email</label>
                <p className="info-value">{user.user_email}</p>
              </div>

              <div className="info-item">
                <label className="info-label">Age</label>
                <p className="info-value">{user.age || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  )
} 
