import { useState, useEffect } from "react"
import { useParams } from "react-router"
import "../style/interview.scss"
import { useInterview } from "../hooks/useinterview"

const Interview = () => {
    const { id } = useParams()
    const { currentReport, loading, handleGetReportById } = useInterview()
    const [activeSection, setActiveSection] = useState("technical")
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)

    useEffect(() => {
        handleGetReportById(id)
    }, [id])

    if (loading || !currentReport) {
        return (
            <main className="interview-page">
                <div style={{ padding: "3rem", textAlign: "center", color: "#888" }}>
                    <h2>Loading your interview strategy...</h2>
                </div>
            </main>
        )
    }

    const renderContent = () => {
        if (activeSection === "technical") {
            if (!currentReport.technicalQuestions || currentReport.technicalQuestions.length === 0) {
                return <p>No technical questions available.</p>
            }
            const q = currentReport.technicalQuestions[activeQuestionIndex]
            return (
                <div className="question-detail">
                    <div className="question-header">
                        <span className="badge">Technical · Question {activeQuestionIndex + 1}/{currentReport.technicalQuestions.length}</span>
                    </div>
                    <h2 className="question-text">{q.question}</h2>
                    <div className="intention-box">
                        <span className="label">💡 What they're really asking:</span>
                        <p>{q.intention}</p>
                    </div>
                    <div className="answer-box">
                        <span className="label">✅ Model Answer:</span>
                        <p className="answer-text">{q.answer}</p>
                    </div>

                    <div className="question-nav">
                        <button
                            disabled={activeQuestionIndex === 0}
                            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                        >
                            ← Previous
                        </button>
                        <button
                            disabled={activeQuestionIndex === currentReport.technicalQuestions.length - 1}
                            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )
        }

        if (activeSection === "behavioral") {
            if (!currentReport.behavioralQuestions || currentReport.behavioralQuestions.length === 0) {
                return <p>No behavioral questions available.</p>
            }
            const q = currentReport.behavioralQuestions[activeQuestionIndex]
            return (
                <div className="question-detail">
                    <div className="question-header">
                        <span className="badge behavioral">Behavioral · Question {activeQuestionIndex + 1}/{currentReport.behavioralQuestions.length}</span>
                    </div>
                    <h2 className="question-text">{q.question}</h2>
                    <div className="intention-box">
                        <span className="label">💡 What they're really asking:</span>
                        <p>{q.intention}</p>
                    </div>
                    <div className="answer-box">
                        <span className="label">✅ STAR Format Answer:</span>
                        <p className="answer-text">{q.answer}</p>
                    </div>

                    <div className="question-nav">
                        <button
                            disabled={activeQuestionIndex === 0}
                            onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
                        >
                            ← Previous
                        </button>
                        <button
                            disabled={activeQuestionIndex === currentReport.behavioralQuestions.length - 1}
                            onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )
        }

        if (activeSection === "roadmap") {
            if (!currentReport.preparationPlan || currentReport.preparationPlan.length === 0) {
                return <p>No preparation plan available.</p>
            }
            return (
                <div className="roadmap-detail">
                    <h2>7-Day Preparation Roadmap</h2>
                    <p className="roadmap-intro">Follow this focused plan to address your skill gaps and maximize interview success.</p>
                    <div className="roadmap-timeline">
                        {currentReport.preparationPlan.map((day, idx) => (
                            <div key={idx} className="day-card">
                                <div className="day-header">
                                    <span className="day-number">Day {day.day}</span>
                                    <span className="day-focus">{day.focus}</span>
                                </div>
                                <ul className="tasks-list">
                                    {day.tasks.map((task, i) => (
                                        <li key={i}>{task}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    }

    return (
        <main className="interview-page">

            {/* Header */}
            <header className="interview-header">
                <div className="header-content">
                    <h1>Your Interview Strategy</h1>
                    <div className="match-score">
                        <span className="score-label">Match Score</span>
                        <span className="score-value">{currentReport.matchScore || 0}%</span>
                    </div>
                </div>
            </header>

            <div className="interview-layout">

                {/* Left Sidebar */}
                <aside className="sidebar-left">
                    <nav className="section-nav">
                        <button
                            className={activeSection === "technical" ? "active" : ""}
                            onClick={() => { setActiveSection("technical"); setActiveQuestionIndex(0) }}
                        >
                            <span className="icon">💻</span>
                            Technical Questions
                            <span className="count">{currentReport.technicalQuestions?.length || 0}</span>
                        </button>
                        <button
                            className={activeSection === "behavioral" ? "active" : ""}
                            onClick={() => { setActiveSection("behavioral"); setActiveQuestionIndex(0) }}
                        >
                            <span className="icon">🤝</span>
                            Behavioral Questions
                            <span className="count">{currentReport.behavioralQuestions?.length || 0}</span>
                        </button>
                        <button
                            className={activeSection === "roadmap" ? "active" : ""}
                            onClick={() => setActiveSection("roadmap")}
                        >
                            <span className="icon">🗺️</span>
                            Road Map
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <div className="main-content">
                    {renderContent()}
                </div>

                {/* Right Sidebar */}
                <aside className="sidebar-right">
                    <div className="skill-gaps-panel">
                        <h3>Skill Gaps</h3>
                        <div className="gaps-list">
                            {currentReport.skillGaps && currentReport.skillGaps.length > 0 ? (
                                currentReport.skillGaps.map((gap, i) => (
                                    <div key={i} className={`gap-item severity-${gap.severity}`}>
                                        <span className="gap-skill">{gap.skill}</span>
                                        <span className={`gap-badge ${gap.severity}`}>{gap.severity}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ fontSize: "0.8rem", color: "#666" }}>No skill gaps identified.</p>
                            )}
                        </div>
                        <div className="legend">
                            <span className="legend-item"><span className="dot high" />High = Core requirement</span>
                            <span className="legend-item"><span className="dot medium" />Medium = Disadvantage</span>
                            <span className="legend-item"><span className="dot low" />Low = Nice-to-have</span>
                        </div>
                    </div>
                </aside>

            </div>

        </main>
    )
}

export default Interview
