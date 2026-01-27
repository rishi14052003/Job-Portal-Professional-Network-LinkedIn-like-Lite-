import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout, updateDetails } from "../redux/userSlice.js"
import { User, Edit2, Save, X, Briefcase, Award, Clock, LogOut } from 'lucide-react'
import axiosInstance from "../utils/axiosInstance.js"
import "../design/style.css"

function Freelancer() {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [skills, setSkills] = useState("")
  const [experience, setExperience] = useState("")
  const [editingSkillIndex, setEditingSkillIndex] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const skillsList = user.skillsList || []

  useEffect(() => {
    const loadFreelancerData = async () => {
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
        }
      } catch (err) {
        console.error("Error loading freelancer data:", err)
        setError('Failed to load freelancer data')
      } finally {
        setLoading(false)
      }
    }
    loadFreelancerData()
  }, [user.user_email, dispatch])

  const handleEdit = () => {
    setEditing(true)
    setError('')
    setSuccess('')
  }

  const handleCancel = () => {
    setEditing(false)
    setSkills('')
    setExperience('')
    setEditingSkillIndex(null)
    setError('')
    setSuccess('')
  }

  const handleAddSkill = async () => {
    if (!skills.trim() || !experience.trim()) {
      setError('Please provide both skill and experience')
      return
    }

    const expNum = Number(experience)
    if (isNaN(expNum) || expNum < 0) {
      setError('Experience must be a valid positive number')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const updatedSkillsList = [...skillsList, { skills: skills.trim(), experience: expNum }]

      const res = await axiosInstance.put(
        '/api/users/update',
        {
          user_email: user.user_email,
          name: user.name,
          age: user.age,
          role: user.role,
          skillsList: updatedSkillsList,
          experience: experience.trim(),
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
          skillsList: updatedSkillsList,
          experience: experience.trim(),
        }
        dispatch(updateDetails(updatePayload))

        setSuccess('Skill added successfully!')
        setSkills('')
        setExperience('')
      } else {
        setError(res.data.message || 'Failed to add skill')
      }
    } catch (err) {
      console.error('Error adding skill:', err)
      setError('Failed to add skill')
    }
  }

  const handleDeleteSkill = async (indexToDelete) => {
    try {
      const token = localStorage.getItem('token')
      const updatedSkillsList = skillsList.filter((_, index) => index !== indexToDelete)

      const res = await axiosInstance.put(
        '/api/users/update',
        {
          user_email: user.user_email,
          name: user.name,
          age: user.age,
          role: user.role,
          skillsList: updatedSkillsList,
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
          skillsList: updatedSkillsList,
        }
        dispatch(updateDetails(updatePayload))

        setSuccess('Skill deleted successfully!')
      } else {
        setError(res.data.message || 'Failed to delete skill')
      }
    } catch (err) {
      console.error('Error deleting skill:', err)
      setError('Failed to delete skill')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    dispatch(logout())
    navigate("/signin")
  }

  const handleExplore = () => {
    navigate("/freelancerpage")
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading freelancer profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name || 'Freelancer'}</h1>
          <p className="profile-role">Freelancer Account</p>
          <div className="profile-stats">
            <div className="stat-item">
              <Briefcase size={20} />
              <span>{skillsList.length} Skills</span>
            </div>
            <div className="stat-item">
              <Award size={20} />
              <span>Experience</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {!editing ? (
            <button className="btn-edit" onClick={handleEdit}>
              <Edit2 size={16} />
              Add Skills
            </button>
          ) : (
            <div className="edit-actions">
              <button className="btn-save" onClick={handleAddSkill}>
                <Save size={16} />
                Add
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
            <h2>Skills & Experience</h2>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {editing && (
              <div className="skill-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="info-label">Skill</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="info-input"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>
                  <div className="form-group">
                    <label className="info-label">Experience (years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="info-input"
                      placeholder="Years of experience"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="skills-list">
              {skillsList.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} />
                  <p>No skills added yet</p>
                  <p>Click "Add Skills" to get started</p>
                </div>
              ) : (
                skillsList.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-info">
                      <h3 className="skill-name">{skill.skills}</h3>
                      <div className="skill-experience">
                        <Clock size={16} />
                        <span>{skill.experience} years</span>
                      </div>
                    </div>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteSkill(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="card-header">
            <h2>Personal Information</h2>
          </div>
          <div className="card-body">
            <div className="info-grid">
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

export default Freelancer
