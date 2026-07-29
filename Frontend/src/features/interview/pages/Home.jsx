import { useState, useRef } from "react"
import { useNavigate } from "react-router"
import "../style/home.scss"
import { useInterview } from "../hooks/useinterview"

const Home = () => {
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeFile, setResumeFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState("")
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const { handleGenerateReport, loading } = useInterview()

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file && file.type === "application/pdf") {
            setResumeFile(file)
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) setResumeFile(file)
    }

    const handleSubmit = async () => {
        if (!jobDescription.trim()) return
        setError("")

        // build multipart form data
        const formData = new FormData()
        formData.append("jobDescription", jobDescription)
        formData.append("selfDescription", selfDescription)
        if (resumeFile) formData.append("resume", resumeFile)

        try {
            const report = await handleGenerateReport(formData)
            navigate(`/interview/${report._id}`)
        } catch (err) {
            setError("Failed to generate report. Please try again.")
            console.error(err)
        }
    }

    return (
        <main className="home">

            {/* ── Hero ── */}
            <section className="hero">
                <h1>Create Your Custom <span className="accent">Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </section>

            {/* ── Two-column card ── */}
            <div className="input-card">

                {/* Left — Job Description */}
                <div className="card-left">
                    <div className="card-header">
                        <span className="dot red" />
                        <h3>Target Job Description</h3>
                        <span className="badge">Required</span>
                    </div>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder={"Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"}
                        maxLength={5000}
                    />
                    <div className="char-count">{jobDescription.length} / 5000</div>
                </div>

                {/* Right — Profile */}
                <div className="card-right">
                    <div className="card-header">
                        <span className="dot pink" />
                        <h3>Your Profile</h3>
                    </div>

                    <p className="section-label">Upload Resume <span className="optional">Optional</span></p>
                    <div
                        className={`drop-zone ${isDragging ? "dragging" : ""} ${resumeFile ? "has-file" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        {resumeFile ? (
                            <>
                                <span className="upload-icon">✅</span>
                                <p className="upload-text">{resumeFile.name}</p>
                                <span className="upload-hint">Click to replace</span>
                            </>
                        ) : (
                            <>
                                <span className="upload-icon">☁️</span>
                                <p className="upload-text">Click to upload or drag & drop</p>
                                <span className="upload-hint">PDF only · Max 3MB</span>
                            </>
                        )}
                    </div>

                    <div className="or-divider"><span>OR</span></div>

                    <p className="section-label">Quick Self-Description</p>
                    <textarea
                        className="self-desc"
                        value={selfDescription}
                        onChange={(e) => setSelfDescription(e.target.value)}
                        placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                    />

                    {!resumeFile && !selfDescription.trim() && (
                        <div className="info-note">
                            <span>ℹ️</span> Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalised plan.
                        </div>
                    )}
                </div>
            </div>

            {/* ── Error ── */}
            {error && <p className="error-msg">{error}</p>}

            {/* ── CTA ── */}
            <div className="cta-section">
                <p className="cta-hint">⚡ AI-Powered Strategy Generation · Approx 30s</p>
                <button
                    className="generate-btn"
                    onClick={handleSubmit}
                    disabled={!jobDescription.trim() || loading}
                >
                    {loading ? "⏳ Generating..." : "✦ Generate My Interview Strategy"}
                </button>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Help Center</a>
                </div>
            </div>

        </main>
    )
}

export default Home
