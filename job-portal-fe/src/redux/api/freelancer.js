import axiosInstance from "../../utils/axiosInstance.js"
export const fetchFreelancerUser = async (email) => {
  try {
    const res = await axiosInstance.get(`/api/users/${email}`)
    if (res.data) {
      return res.data
    }
  } 
  catch (err) {
    console.error("Error fetching freelancer data:", err)
    return null
  }
}
