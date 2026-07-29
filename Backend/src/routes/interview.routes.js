const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

// all routes require auth
interviewRouter.use(authMiddleware.authUser)

/**
 * @route POST /api/interview
 * @description Generate a new interview report
 * @access Private
 */
interviewRouter.post(
    "/",
    upload.single("resume"),
    interviewController.generateInterViewReportController
)

/**
 * @route GET /api/interview
 * @description Get all reports for the logged-in user
 * @access Private
 */
interviewRouter.get("/", interviewController.getAllInterviewReportsController)

/**
 * @route GET /api/interview/:id
 * @description Get a single report by ID
 * @access Private
 */
interviewRouter.get("/:id", interviewController.getInterviewReportByIdController)

module.exports = interviewRouter
