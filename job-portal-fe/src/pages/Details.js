import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/userSlice.js";
import { useNavigate } from "react-router-dom";
import "../design/style.css";
import companyLogo from "../assets/workaholic-high-resolution-logo.png";
import Footer from "../components/Footer.js";

const BASE_URL = process.env.REACT_APP_BASE_URL;

function Details() {
  const user = useSelector((state) => state.user);
  const [name, setName] = useState(user.name || "");
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

  useEffect(() => {
    setCompanyList(user.companies || []);
    setSkillsList(user.skillsList || []);
    setRole(user.role || "");
    setName(user.name || "");
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
    if (!name || age === "" || isNaN(ageNumber) || role === "") {
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
      name,
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
    <>
      <div className="signin-page-wrapper">
        <div className="signin-page-container">
          <div className="signin-card-container">
            <div className="signin-left-section">
              <div className="signin-header">
                <h1 className="signin-title">Complete Your Profile</h1>
                <p className="signin-subtitle">
                  Tell us about yourself to get started
                </p>
              </div>

              <form
                className="signin-form form1"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input input"
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
                    className="form-input input"
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
                      <label htmlFor="company">Company</label>
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
                      <label htmlFor="freelancer">Freelancer</label>
                    </div>
                  </div>
                </div>

                {role === "company" && (
                  <>
                    {companyList.length === 0 ? (
                      <>
                        <div className="form-group">
                          <label className="form-label">Company Name</label>
                          <input
                            type="text"
                            placeholder="Enter company name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="form-input input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Location</label>
                          <input
                            type="text"
                            placeholder="Enter location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="form-input input"
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
                      <p className="info-text">
                        You’ve already added your company details.
                      </p>
                    )}

                    <ul className="output company-list">
                      {companyList.map((item, index) => (
                        <li key={index} className="entry-item">
                          <span className="entry-text">
                            Company Name: {item.companyName}
                          </span>
                          <br />
                          <span className="entry-text">
                            Company Location: {item.location}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {role === "freelancer" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Skills</label>
                      <input
                        type="text"
                        placeholder="Enter skills"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        className="form-input input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Experience (years)</label>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        placeholder="Experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="form-input input"
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
                          <span className="entry-text">
                            Skill: {item.skills}
                          </span>
                          <br />
                          <span className="entry-text">
                            Experience: {item.experience} years
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {error && <div className="alert alert-error">{error}</div>}

                <div className="button-row">
                  <button type="submit" className="btn-primary signin-btn">
                    Save Details
                  </button>
                </div>
              </form>
            </div>

            <div className="signin-right-section">
              <div className="brand-content">
                <div className="brand-logo-container">
                  <img
                    src={companyLogo}
                    alt="Workaholic Logo"
                    className="brand-logo-image"
                  />
                </div>
                <h2 className="brand-name">Workaholic</h2>
                <p className="brand-tagline">
                  Enter your details so we can tailor your experience on
                  Workaholic
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Details;
