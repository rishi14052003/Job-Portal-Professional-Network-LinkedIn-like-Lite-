import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout, updateDetails } from '../redux/userSlice.js'
import axiosInstance from '../utils/axiosInstance.js'
import '../design/style.css'
import logoutImage from '../assets/logout.png'

export default function Company() {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [companyName, setCompanyName] = useState(user.companies?.[0]?.companyName || '')
  const [location, setLocation] = useState(user.companies?.[0]?.location || '')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const companyList = user.companies || []
  const initialDetailsCompleted = user.detailsCompleted || false

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user.user_email) return
        
        if (initialDetailsCompleted && companyList.length > 0) {
          setLoading(false)
          return
        }

        const res = await axiosInstance.get(`/api/users/${user.user_email}`)
        const fetched = res.data

        if (fetched && fetched.companies && fetched.companies.length > 0) {
          const fetchedCompany = fetched.companies[0]
          setCompanyName(fetchedCompany.companyName)
          setLocation(fetchedCompany.location)

          const updatePayload = {
            companies: fetched.companies,
            companyName: fetchedCompany.companyName,
            location: fetchedCompany.location,
            detailsCompleted: fetched.detailsCompleted || true,
          }
          dispatch(updateDetails(updatePayload))
        } else {
          setCompanyName('')
          setLocation('')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user.user_email, dispatch, initialDetailsCompleted, companyList.length])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user') 
    dispatch(logout())
    navigate('/signin')
  }

  const handleExplore = () => {
    navigate('/companypage')
  }

  const handleAddOrSave = async () => {
    if (!companyName || !location) {
      setError('Please provide company name and location')
      return
    }

    const newCompany = { companyName, location }
    const updated = [newCompany]
    const shouldSetDetailsCompleted = companyList.length === 0 && !initialDetailsCompleted

    setEditing(false)
    setError('')

    const updatedUserDetails = {
      user_email: user.user_email,
      name: user.name,
      age: user.age,
      role: 'company',
      companies: updated,
      companyName: newCompany.companyName,
      location: newCompany.location,
      detailsCompleted: shouldSetDetailsCompleted ? true : user.detailsCompleted,
    }

    try {
      await axiosInstance.put(`/users/update`, updatedUserDetails)

      dispatch(updateDetails({
        companies: updated,
        companyName,
        location,
        detailsCompleted: updatedUserDetails.detailsCompleted,
      }))
      
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUserDetails, token: user.token }));

    } catch (err) {
      console.error('Failed to save company:', err)
      setError('Failed to save')
    }
  }

  const handleEdit = () => {
    if (companyList.length > 0) {
      setEditing(true)
      setCompanyName(companyList[0].companyName)
      setLocation(companyList[0].location)
    }
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setCompanyName(companyList[0]?.companyName || '')
    setLocation(companyList[0]?.location || '')
  }

  const handleDeleteAsk = () => {
    setDeleting(true)
  }

  const handleDeleteYes = async () => {
    setDeleting(false)

    const updatedUserDetails = {
      user_email: user.user_email,
      name: user.name,
      age: user.age,
      role: 'company',
      companies: [],
      companyName: '',
      location: '',
      detailsCompleted: user.detailsCompleted, 
    }

    try {
      await axiosInstance.put(`/users/update`, updatedUserDetails)
      
      dispatch(updateDetails({ companies: [], companyName: '', location: '' }))
      
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUserDetails, companies: [], companyName: '', location: '', token: user.token }));
    } catch (err) {
      setError('Failed to delete')
    }
  }

  const handleDeleteNo = () => {
    setDeleting(false)
  }

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <>
      <div className="page-container">
        <header className="welcome-header">
          <h1>Welcome {user.name}</h1>
          <p className="subtitle">Company Details</p>
        </header>
        <div className="freelancerdetails"> 
    <p><strong>Name: </strong>{user.name}</p>
    <p><strong>Age: </strong>{user.age}</p>
    <p><strong>Email: </strong>{user.user_email}</p>
</div>
        {companyList.length > 0 && !editing ? (
          <div className="job-card-item">
            <p><strong>Company:</strong> {companyList[0].companyName}</p>
            <p><strong>Location:</strong> {companyList[0].location}</p>
            <div className="button-row">
              {deleting ? (
                <>
                  <span className="confirmation-text">You sure?</span>
                  <button className="button secondary" onClick={handleDeleteYes}>Yes</button>
                  <button className="button secondary" onClick={handleDeleteNo}>No</button>
                </>
              ) : (
                <>
                  <button className="button secondary" onClick={handleEdit}>Edit</button>
                  <button className="button secondary" onClick={handleDeleteAsk}>Delete</button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="add-skill-form">
            <h3>{editing ? 'Edit Company' : 'Add Company'}</h3>
            <input
              type="text"
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
            />
            <div className="button-row">
              <button className="buttonclogout" onClick={handleAddOrSave}>
                {editing ? 'Save Company' : 'Add Company'}
              </button>
              {editing && (
                <button className="buttonprimaryssc" onClick={handleCancelEdit}>Cancel</button>
              )}
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        <div className="navigation-group">
          <button onClick={handleLogout} className="buttonclogout" aria-label="Logout">
            <img 
              src={logoutImage} 
              alt="Logout" 
              width="20" 
              height="20" 
              style={{ verticalAlign: 'middle' }}
            />
          </button>
          <button onClick={handleExplore} className="buttonclogout">Explore Workaholic</button>
        </div>
      </div>
    </>
  )
}
