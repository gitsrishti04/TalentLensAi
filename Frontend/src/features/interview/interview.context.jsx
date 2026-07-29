import { useState } from "react"
import { InterviewContext } from "./interview-context"

export const InterviewProvider = ({ children }) => {
    const [reports, setReports] = useState([])
    const [currentReport, setCurrentReport] = useState(null)
    const [loading, setLoading] = useState(false)

    return (
        <InterviewContext.Provider value={{
            reports,
            setReports,
            currentReport,
            setCurrentReport,
            loading,
            setLoading
        }}>
            {children}
        </InterviewContext.Provider>
    )
}
