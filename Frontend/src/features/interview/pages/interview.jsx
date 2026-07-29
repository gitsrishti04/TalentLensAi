import { useState, useEffect } from "react"
import { useParams } from "react-router"
import "../style/interview.scss"
import { useInterview } from "../hooks/useinterview"

const sectionConfig = {
    technical: {
        title: "Technical Questions",
        navLabel: "Technical Questions",
        icon: "<>",
        answerLabel: "Model Answer",
        empty: "No technical questions available."
    },
    behavioral: {
        title: "Behavioral Questions",
        navLabel: "Behavioral Questions",
        icon: "[]",
        answerLabel: "STAR Answer",
        empty: "No behavioral questions available."
    },
    roadmap: {
        title: "Road Map",
        navLabel: "Road Map",
        icon: "->",
        empty: "No preparation plan available."
    }
}

const getScoreTone = (score) => {
    if (score >= 75) return "Strong match for this role"
    if (score >= 50) return "Good base with focused prep"
    return "Needs focused preparation"
}

const Interview = () => {
    const { id } = useParams()
    const { currentReport, loading, handleGetReportById } = useInterview()
    const [activeSection, setActiveSection] = useState("technical")
    const [openItem, setOpenItem] = useState(0)

    useEffect(() => {
        handleGetReportById(id)
    }, [id, handleGetReportById])

    if (loading || !currentReport) {
        return (
            <main className="interview-page">
                <div className="interview-shell loading-shell">
                    <h2>Loading your interview strategy...</h2>
                </div>
            </main>
        )
    }

    const technicalQuestions = currentReport.technicalQuestions || []
    const behavioralQuestions = currentReport.behavioralQuestions || []
    const preparationPlan = currentReport.preparationPlan || []
    const score = currentReport.matchScore || 0

    const switchSection = (section) => {
        setActiveSection(section)
        setOpenItem(0)
    }

    const renderQuestionList = (questions, type) => {
        const config = sectionConfig[type]

        if (!questions.length) {
            return <p className="empty-state">{config.empty}</p>
        }

        return (
            <div className="accordion-list">
                {questions.map((question, index) => {
                    const isOpen = openItem === index

                    return (
                        <article className={`question-row ${isOpen ? "open" : ""}`} key={`${type}-${index}`}>
                            <button className="question-trigger" onClick={() => setOpenItem(isOpen ? -1 : index)}>
                                <span className="question-number">{String(index + 1).padStart(2, "0")}</span>
                                <span className="question-copy">{question.question}</span>
                                <span className="chevron">{isOpen ? "up" : "down"}</span>
                            </button>

                            {isOpen && (
                                <div className="question-panel">
                                    <div className="insight-block">
                                        <span className="block-label">What they are testing</span>
                                        <p>{question.intention}</p>
                                    </div>
                                    <div className="answer-block">
                                        <span className="block-label">{config.answerLabel}</span>
                                        <p>{question.answer}</p>
                                    </div>
                                </div>
                            )}
                        </article>
                    )
                })}
            </div>
        )
    }

    const renderRoadmap = () => {
        if (!preparationPlan.length) {
            return <p className="empty-state">{sectionConfig.roadmap.empty}</p>
        }

        return (
            <div className="roadmap-list">
                {preparationPlan.map((day, index) => (
                    <article className="roadmap-row" key={`${day.day}-${index}`}>
                        <div className="day-pill">Day {day.day}</div>
                        <div className="roadmap-copy">
                            <h3>{day.focus}</h3>
                            <ul>
                                {day.tasks.map((task, taskIndex) => (
                                    <li key={`${task}-${taskIndex}`}>{task}</li>
                                ))}
                            </ul>
                        </div>
                    </article>
                ))}
            </div>
        )
    }

    const activeCount = activeSection === "technical"
        ? technicalQuestions.length
        : activeSection === "behavioral"
            ? behavioralQuestions.length
            : preparationPlan.length

    return (
        <main className="interview-page">
            <div className="interview-shell">
                <aside className="sidebar-left">
                    <p className="panel-kicker">Sections</p>
                    <nav className="section-nav">
                        {Object.entries(sectionConfig).map(([key, config]) => (
                            <button
                                key={key}
                                className={activeSection === key ? "active" : ""}
                                onClick={() => switchSection(key)}
                            >
                                <span className="icon">{config.icon}</span>
                                <span>{config.navLabel}</span>
                                {key !== "roadmap" && (
                                    <span className="count">
                                        {key === "technical" ? technicalQuestions.length : behavioralQuestions.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </aside>

                <section className="main-content">
                    <header className="content-header">
                        <div>
                            <p className="panel-kicker">Interview Plan</p>
                            <h1>{sectionConfig[activeSection].title}</h1>
                        </div>
                        <span className="question-count">
                            {activeCount} {activeSection === "roadmap" ? "days" : "questions"}
                        </span>
                    </header>

                    {activeSection === "technical" && renderQuestionList(technicalQuestions, "technical")}
                    {activeSection === "behavioral" && renderQuestionList(behavioralQuestions, "behavioral")}
                    {activeSection === "roadmap" && renderRoadmap()}
                </section>

                <aside className="sidebar-right">
                    <section className="score-panel">
                        <p className="panel-kicker">Match Score</p>
                        <div className="score-ring" style={{ "--score": `${score}%` }}>
                            <strong>{score}</strong>
                            <span>%</span>
                        </div>
                        <p className="score-tone">{getScoreTone(score)}</p>
                    </section>

                    <section className="skill-gaps-panel">
                        <p className="panel-kicker">Skill Gaps</p>
                        <div className="gaps-list">
                            {currentReport.skillGaps && currentReport.skillGaps.length > 0 ? (
                                currentReport.skillGaps.map((gap, index) => (
                                    <div key={`${gap.skill}-${index}`} className={`gap-item severity-${gap.severity}`}>
                                        <span>{gap.skill}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="empty-state compact">No skill gaps identified.</p>
                            )}
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    )
}

export default Interview
