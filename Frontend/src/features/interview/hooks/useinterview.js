import { useCallback, useContext } from "react"
import { InterviewContext } from "../interview-context"
import { generateReport, getReportById, getAllReports } from "../services/interview.api"

export const useInterview = () => {
    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { reports, setReports, currentReport, setCurrentReport, loading, setLoading } = context

    const handleGenerateReport = useCallback(async (formData) => {
        setLoading(true)
        try {
            const data = await generateReport(formData)
            setCurrentReport(data.interviewReport)
            return data.interviewReport
        } catch (err) {
            console.error(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [setCurrentReport, setLoading])

    const handleGetReportById = useCallback(async (id) => {
        setLoading(true)
        try {
            const data = await getReportById(id)
            setCurrentReport(data.report)
            return data.report
        } catch (err) {
            console.error(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [setCurrentReport, setLoading])

    const handleGetAllReports = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getAllReports()
            setReports(data.reports)
            return data.reports
        } catch (err) {
            console.error(err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [setReports, setLoading])

    return {
        reports,
        currentReport,
        loading,
        handleGenerateReport,
        handleGetReportById,
        handleGetAllReports
    }
}
