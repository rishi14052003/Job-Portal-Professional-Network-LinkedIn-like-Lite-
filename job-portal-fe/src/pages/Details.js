import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/userSlice.js";
import { useNavigate } from "react-router-dom";
import { Building, User } from "lucide-react";
import "../design/style.css";
import companyLogo from "../assets/workaholic-high-resolution-logo.png";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Details() {
  const user = useSelector((state) => state.user);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState(
    user.age !== undefined && user.age !== null ? String(user.age) : ""
  );
  const [role, setRole] = useState(user.role || "");
  const [companyName, setCompanyName] = useState(user.companyName || "");
  const [location, setLocation] = useState(user.location || "");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [companyList, setCompanyList] = useState(user.companies || []);
  const [skillsList, setSkillsList] = useState(user.skillsList || []);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Function to get user initials
  const getUserInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || 'U';
  };

  // Function to get full name
  const getFullName = (firstName, lastName) => {
    return `${firstName} ${lastName}`.trim();
  };

  useEffect(() => {
    setCompanyList(user.companies || []);
    setSkillsList(user.skillsList || []);
    setRole(user.role || "");
    
    // Split existing name into first and last name
    if (user.name) {
      const nameParts = user.name.trim().split(' ');
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(' ') || "");
    } else {
      setFirstName("");
      setLastName("");
    }
    
    setAge(user.age !== undefined && user.age !== null ? String(user.age) : "");
    setCompanyName(user.companyName || "");
    setLocation(user.location || "");
  }, [user]);

  useEffect(() => {
    if (user && user.user_email && user.detailsCompleted) {
      if (user.role === "company") navigate("/companypage");
      else if (user.role === "freelancer") navigate("/freelancerpage");
    }
  }, [user, navigate]);

  const handleSave = async () => {
    const ageNumber = age === "" ? NaN : Number(age);
    if (!firstName || !lastName || age === "" || isNaN(ageNumber) || role === "") {
      setError("Please fill in all fields");
      return;
    }
    if (ageNumber < 18 || ageNumber > 65) {
      setError("Age must be between 18 and 65");
      return;
    }
    if (
      role === "company" &&
      companyList.length === 0 &&
      (!companyName || !location)
    ) {
      setError("Please add at least one company");
      return;
    }
    if (role === "freelancer" && skillsList.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    const finalCompanyList =
      role === "company"
        ? companyList.length > 0
          ? companyList
          : [{ companyName, location }]
        : [];

    const userDetails = {
      user_email: user.user_email,
      name: getFullName(firstName, lastName),
      age: ageNumber,
      role,
      companyName:
        role === "company" ? finalCompanyList[0]?.companyName || null : null,
      location:
        role === "company" ? finalCompanyList[0]?.location || null : null,
      skillsList: role === "freelancer" ? skillsList : [],
      companies: role === "company" ? finalCompanyList : [],
    };

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${BASE_URL}/api/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userDetails),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.message || "Update failed");
      } else {
        const updatedUser = {
          ...user,
          ...userDetails,
          detailsCompleted: true,
        };
        dispatch(loginSuccess(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (role === "company") navigate("/companypage");
        else navigate("/freelancerpage");
      }
    } catch {
      setError("Server error");
    }
  };

  const handleCompanyAddOrSave = () => {
    if (companyList.length >= 1) {
      setError("You can only add 1 company.");
      return;
    }

    if (!companyName || !location) {
      setError("Please provide company name and location");
      return;
    }
    setCompanyList([{ companyName, location }]);
    setCompanyName("");
    setLocation("");
    setError("");
  };

  const handleSkillAddOrSave = () => {
    if (!skills || experience === "") {
      setError("Please provide skills and experience");
      return;
    }
    const expNum = Number(experience);
    if (isNaN(expNum) || expNum < 0) {
      setError("Experience cannot be negative");
      return;
    }
    setSkillsList([...skillsList, { skills, experience: expNum }]);
    setSkills("");
    setExperience("");
    setError("");
  };

  return (
    <div className="page-layout">
      <div className="page-header">
        <h1 className="page-title">Complete Your Profile</h1>
        <p className="page-subtitle">Tell us about yourself to get started with Workaholic</p>
      </div>

      <div className="form-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="form-section">
            <h2 className="section-title">Basic Information</h2>
            
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                min="18"
                max="65"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-group">
                <div className="role-option">
                  <input
                    type="radio"
                    id="company"
                    name="role"
                    value="company"
                    checked={role === "company"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label htmlFor="company">
                    <Building size={20} />
                    Company
                  </label>
                </div>
                <div className="role-option">
                  <input
                    type="radio"
                    id="freelancer"
                    name="role"
                    value="freelancer"
                    checked={role === "freelancer"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <label htmlFor="freelancer">
                    <User size={20} />
                    Freelancer
                  </label>
                </div>
              </div>
            </div>
          </div>

          {role === "company" && (
            <div className="form-section">
              <h2 className="section-title">Company Information</h2>
              
              {companyList.length === 0 ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      placeholder="Enter company name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      placeholder="Enter location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="button-row">
                    <button
                      type="button"
                      onClick={handleCompanyAddOrSave}
                      className="button primary"
                    >
                      Add Company
                    </button>
                  </div>
                </>
              ) : (
                <div className="alert alert-success">
                  You've successfully added your company details.
                </div>
              )}

              <ul className="output company-list">
                {companyList.map((item, index) => (
                  <li key={index} className="entry-item">
                    <div className="entry-text">
                      <strong>Company Name:</strong> {item.companyName}
                    </div>
                    <div className="entry-text">
                      <strong>Location:</strong> {item.location}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {role === "freelancer" && (
            <div className="form-section">
              <h2 className="section-title">Skills & Experience</h2>
              
              <div className="form-group">
                <label className="form-label">Skills</label>
                <input
                  type="text"
                  placeholder="e.g., JavaScript, React, Node.js"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  placeholder="Years of experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="input"
                />
              </div>
              <div className="button-row">
                <button
                  type="button"
                  onClick={handleSkillAddOrSave}
                  className="button primary"
                >
                  Add Skill
                </button>
              </div>
              
              <ul className="output skills-list">
                {skillsList.map((item, index) => (
                  <li key={index} className="entry-item">
                    <div className="entry-text">
                      <strong>Skill:</strong> {item.skills}
                    </div>
                    <div className="entry-text">
                      <strong>Experience:</strong> {item.experience} years
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && <div className="alert alert-error">{error}</div>}

          <div className="button-row">
            <button type="submit" className="button primary">
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Details;
