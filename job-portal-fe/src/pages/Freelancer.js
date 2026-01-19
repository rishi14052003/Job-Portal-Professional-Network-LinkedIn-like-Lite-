import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { logout, updateDetails } from "../redux/userSlice.js"
import { fetchFreelancerUser } from "../redux/api/freelancer.js"
import axiosInstance from "../utils/axiosInstance.js"
import "../design/style.css"
import logoutImage from "../assets/logout.png"

export default function Freelancer() {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [skills, setSkills] = useState("")
  const [experience, setExperience] = useState("")
  const [editingSkillIndex, setEditingSkillIndex] = useState(null)
  const [deletingSkillIndex, setDeletingSkillIndex] = useState(null)
  const [error, setError] = useState("")

  const skillsList = user.skillsList || []
  const initialDetailsCompleted = user.detailsCompleted || false

  useEffect(() => {
    const loadFreelancerData = async () => {
      if (user && user.user_email && !initialDetailsCompleted) {
        try {
          const response = await fetchFreelancerUser(user.user_email)
          if (response) {
            const updatePayload = {
              skillsList: response.skillsList || [],
              experience: response.experience || "",
              detailsCompleted: response.detailsCompleted || false,
            }
            dispatch(updateDetails(updatePayload))
          }
        } catch (err) {
          console.error("Error loading freelancer data:", err)
        }
      }
    }
    loadFreelancerData()
  }, [user.user_email, dispatch, initialDetailsCompleted])


  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    dispatch(logout())
    navigate("/signin")
  }

  const handleExplore = () => {
    navigate("/freelancerpage")
  }

  const handleSkillAddOrSave = async () => {
    if (!skills || experience === "") {
      setError("Please provide skills and experience")
      return
    }

    const expNum = Number(experience)
    if (isNaN(expNum) || expNum < 0) {
      setError("Experience cannot be negative")
      return
    }

    let updatedSkillsList
    if (editingSkillIndex !== null) {
      updatedSkillsList = [...skillsList]
      updatedSkillsList[editingSkillIndex] = { skills, experience: expNum }
    } else {
      updatedSkillsList = [...skillsList, { skills, experience: expNum }]
    }

    setEditingSkillIndex(null)
    setSkills("")
    setExperience("")
    setError("")

    const shouldSetDetailsCompleted = skillsList.length === 0 && !initialDetailsCompleted
    
    const updatedUserDetails = {
      user_email: user.user_email,
      name: user.name,
      age: user.age,
      role: "freelancer",
      skillsList: updatedSkillsList,
      detailsCompleted: shouldSetDetailsCompleted ? true : user.detailsCompleted,
    }

    try {
      await axiosInstance.put(`/users/update`, updatedUserDetails)

      dispatch(updateDetails({ 
        skillsList: updatedSkillsList, 
        detailsCompleted: updatedUserDetails.detailsCompleted,
      }))
      
      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUserDetails, token: user.token }));

    } catch (err) {
      console.error("Failed to save skill:", err)
      setError("Failed to save")
    }
  }

  const handleSkillEdit = (index) => {
    setEditingSkillIndex(index)
    setSkills(skillsList[index].skills)
    setExperience(String(skillsList[index].experience))
    setDeletingSkillIndex(null)
  }

  const handleSkillEditCancel = () => {
    setEditingSkillIndex(null)
    setSkills("")
    setExperience("")
  }

  const handleSkillDeleteAsk = (index) => {
    setDeletingSkillIndex(index)
  }

  const handleSkillDeleteYes = async () => {
    if (deletingSkillIndex !== null) {
      const updatedSkillsList = skillsList.filter((_, i) => i !== deletingSkillIndex)
      setDeletingSkillIndex(null)

      const updatedUserDetails = {
        user_email: user.user_email,
        name: user.name,
        age: user.age,
        role: "freelancer",
        skillsList: updatedSkillsList,
        detailsCompleted: user.detailsCompleted, 
      }

      try {
        await axiosInstance.put(`/users/update`, updatedUserDetails)
        
        dispatch(updateDetails({ skillsList: updatedSkillsList }))
        
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUserDetails, skillsList: updatedSkillsList, token: user.token }));

      } catch (err) {
        console.error("Failed to delete skill:", err)
        setError("Failed to delete")
      }
    }
  }

  const handleSkillDeleteNo = () => {
    setDeletingSkillIndex(null)
  }

  return (
    <>
      <div className="page-container">
        <header className="welcome-header">
          <h2>Welcome {user.name}</h2>
          <p className="subtitle">Freelancer Details</p>
        </header>
<div className="freelancerdetails"> 
    <p><strong>Name: </strong>{user.name}</p>
    <p><strong>Age: </strong>{user.age}</p>
    <p><strong>Email: </strong>{user.user_email}</p>
</div>
        <div className="job-grid">
          {skillsList.map((item, index) => (
            <div key={index} className="job-card-item">
              <p><strong>Skill:</strong> {item.skills}</p>
              <p><strong>Experience:</strong> {item.experience} Yrs</p>
              <div className="button-row">
                {deletingSkillIndex === index ? (
                  <>
                    <span className="confirmation-text">You sure?</span>
                    <button className="buttonfdanger" onClick={handleSkillDeleteYes}>Yes</button>
                    <button className="buttonfsecondary" onClick={handleSkillDeleteNo}>No</button>
                  </>
                ) : (
                  <>
                    <button className="button secondary" onClick={() => handleSkillEdit(index)}>Edit</button>
                    <button className="button secondary" onClick={() => handleSkillDeleteAsk(index)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="add-skill-form">
          <h3>{editingSkillIndex !== null ? "Edit Skill" : "Add New Skill"}</h3>
          <input
            type="text"
            placeholder="Enter skill"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="input"
          />
          <br /><br />
          <input
            type="number"
            placeholder="Experience (Years)"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="input"
          />
          <div className="button-row">
            <button className="buttonflogout" onClick={handleSkillAddOrSave}>
              {editingSkillIndex !== null ? "Save Skill" : "Add Skill"}
            </button>
            {editingSkillIndex !== null && (
              <button className="buttonprimaryssc" onClick={handleSkillEditCancel}>Cancel</button>
            )}
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="navigation-group">
          <button onClick={handleLogout} className="buttonflogout" aria-label="Logout">
            <img src={logoutImage} alt="Logout" width="20" height="20" style={{ verticalAlign: "middle" }} />
          </button>
          <button onClick={handleExplore} className="buttonflogout">Explore Workaholic</button>
        </div>
      </div>
    </>
  )
}