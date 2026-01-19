import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user_email: '',
  token: '',
  loggedIn: false,
  detailsCompleted: false,
  role: null,
  name: '',
  age: '',
  companyName: '',
  company_id: null,
  location: '',
  companies: [],
  skillsList: [],
  experience: '',
  appliedJobs: []
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    registerSuccess: (state, action) => {
      const payload = action.payload || {};
      return {
        user_email: payload.user_email || '',
        token: payload.token || '',
        loggedIn: !!payload.token,
        name: '',
        age: '',
        role: null,
        companyName: '',
        company_id: null,
        location: '',
        companies: [],
        skillsList: [],
        experience: '',
        appliedJobs: [],
        detailsCompleted: false
      };
    },
    loginSuccess: (state, action) => {
      const payload = action.payload || {};
      const detailsFromPayload = payload.userDetails || payload;
      state.user_email = payload.user_email || detailsFromPayload.user_email || state.user_email;
      state.token = payload.token || state.token;
      state.loggedIn = true;
      state.name = detailsFromPayload.name !== undefined ? detailsFromPayload.name : state.name;
      state.age = detailsFromPayload.age !== undefined ? detailsFromPayload.age : state.age;
      state.role = payload.role !== undefined ? payload.role : (detailsFromPayload.role !== undefined ? detailsFromPayload.role : state.role);
      state.companyName = detailsFromPayload.companyName !== undefined ? detailsFromPayload.companyName : state.companyName;
      state.company_id = detailsFromPayload.company_id !== undefined ? detailsFromPayload.company_id : state.company_id;
      state.location = detailsFromPayload.location !== undefined ? detailsFromPayload.location : state.location;
      state.companies = Array.isArray(detailsFromPayload.companies) ? detailsFromPayload.companies : state.companies;
      state.skillsList = Array.isArray(detailsFromPayload.skillsList) ? detailsFromPayload.skillsList : state.skillsList;
      state.experience = detailsFromPayload.experience !== undefined ? detailsFromPayload.experience : state.experience;
      state.appliedJobs = Array.isArray(detailsFromPayload.appliedJobs) ? detailsFromPayload.appliedJobs : state.appliedJobs;
      const hasBasicDetails = !!state.name && !!state.age && !!state.role;
      let hasRoleSpecificDetails = false;
      if (state.role === 'company') {
        hasRoleSpecificDetails = (!!state.companyName && !!state.location) || state.companies.length > 0;
      } else if (state.role === 'freelancer') {
        hasRoleSpecificDetails = state.skillsList.length > 0;
      }
      state.detailsCompleted = detailsFromPayload.detailsCompleted !== undefined ? detailsFromPayload.detailsCompleted : (hasBasicDetails && hasRoleSpecificDetails);
      const stateToStore = {
        user_email: state.user_email,
        token: state.token,
        loggedIn: state.loggedIn,
        detailsCompleted: state.detailsCompleted,
        role: state.role,
        name: state.name,
        age: state.age,
        companyName: state.companyName,
        company_id: state.company_id,
        location: state.location,
        companies: state.companies,
        skillsList: state.skillsList,
        experience: state.experience,
        appliedJobs: state.appliedJobs
      };
      localStorage.setItem('user', JSON.stringify(stateToStore));
      if (state.token) localStorage.setItem('token', state.token);
    },
    logout: (state) => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.clear();
      window.location.href = '/signin';
      return { ...initialState };
    },
    setDetailsCompleted: (state, action) => {
      state.detailsCompleted = action.payload;
      localStorage.setItem('user', JSON.stringify(state));
    },
    updateDetails: (state, action) => {
      const { name, age, role, companyName, company_id, location, companies, skillsList, experience } = action.payload;
      state.name = name !== undefined ? name : state.name;
      state.age = age !== undefined ? age : state.age;
      state.role = role !== undefined ? role : state.role;
      state.companyName = companyName !== undefined ? companyName : state.companyName;
      state.company_id = company_id !== undefined ? company_id : state.company_id;
      state.location = location !== undefined ? location : state.location;
      state.companies = Array.isArray(companies) ? companies : state.companies;
      state.skillsList = Array.isArray(skillsList) ? skillsList : state.skillsList;
      state.experience = experience !== undefined ? experience : state.experience;
      const hasBasicDetails = !!state.name && !!state.age && !!state.role;
      let hasRoleSpecificDetails = false;
      if (state.role === 'company') {
        hasRoleSpecificDetails = (!!state.companyName && !!state.location) || state.companies.length > 0;
      } else if (state.role === 'freelancer') {
        hasRoleSpecificDetails = state.skillsList.length > 0;
      }
      state.detailsCompleted = hasBasicDetails && hasRoleSpecificDetails;
      localStorage.setItem('user', JSON.stringify(state));
    },
    addAppliedJob: (state, action) => {
      if (!state.appliedJobs.includes(action.payload)) state.appliedJobs.push(action.payload);
      localStorage.setItem('user', JSON.stringify(state));
    },
    removeAppliedJob: (state, action) => {
      state.appliedJobs = state.appliedJobs.filter(id => id !== action.payload);
      localStorage.setItem('user', JSON.stringify(state));
    },
    loadUserFromStorage: (state) => {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        try {
          const parsed = JSON.parse(stored);
          return { ...state, ...parsed, token, loggedIn: !!parsed.user_email };
        } catch (e) {
          return state;
        }
      }
      return state;
    },
    resetUser: () => {
      localStorage.clear();
      return { ...initialState };
    }
  }
});

export const { registerSuccess, loginSuccess, logout, setDetailsCompleted, updateDetails, loadUserFromStorage, addAppliedJob, removeAppliedJob, resetUser } = userSlice.actions;
export default userSlice.reducer;