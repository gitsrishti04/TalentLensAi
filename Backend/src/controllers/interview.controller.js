const { PDFParse } = require("pdf-parse")
const { generateInterviewReport } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * POST /api/interview
 * Generate a new interview report
 */
async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required" })
        }
        if (!req.file && !selfDescription?.trim()) {
            return res.status(400).json({ message: "Resume or self description is required" })
        }

        let resumeContent = ""
        if (req.file) {
            console.log("📄 Parsing PDF resume...")
            let parser
            try {
                parser = new PDFParse({ data: req.file.buffer })
                const pdfData = await parser.getText()
                resumeContent = pdfData.text
            } catch {
                return res.status(400).json({ message: "Could not read that PDF. Please upload a text-based PDF or use self-description." })
            } finally {
                await parser?.destroy?.()
            }
        }

        console.log("🤖 Generating AI report...")
        const aiReport = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        })

        console.log("💾 Saving to database...")
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            matchScore:          aiReport.matchScore,
            technicalQuestions:  aiReport.technicalQuestions,
            behavioralQuestions: aiReport.behavioralQuestions,
            skillGaps:           aiReport.skillGaps,
            preparationPlan:     aiReport.preparationPlan
        })

        console.log("✅ Report created:", interviewReport._id)
        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("❌ Error in generateInterViewReportController:")
        console.error(err)
        return res.status(500).json({
            message: err.isClientSafe ? err.message : "Failed to generate interview report",
            error: err.message
        })
    }
}

/**
 * GET /api/interview/:id
 * Get a single report by ID
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const report = await interviewReportModel.findOne({
            _id: req.params.id,
            user: req.user.id
        })

        if (!report) {
            return res.status(404).json({ message: "Report not found" })
        }

        return res.status(200).json({ report })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

/**
 * GET /api/interview
 * Get all reports for the logged-in user
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const reports = await interviewReportModel
            .find({ user: req.user.id })
            .select("jobDescription matchScore createdAt")
            .sort({ createdAt: -1 })

        return res.status(200).json({ reports })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController
}
