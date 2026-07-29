import { createContext, useState } from "react"

export const InterviewContext = createContext()

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
