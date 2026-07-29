import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

/**
 * Generate a new interview report
 * @param {FormData} formData — contains jobDescription, selfDescription, resume (file)
 */
export async function generateReport(formData) {
    const response = await api.post("/api/interview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

/**
 * Get a single interview report by ID
 */
export async function getReportById(id) {
    const response = await api.get(`/api/interview/${id}`)
    return response.data
}

/**
 * Get all reports for the logged-in user
 */
export async function getAllReports() {
    const response = await api.get("/api/interview")
    return response.data
}
