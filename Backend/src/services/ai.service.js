const { Mistral } = require("@mistralai/mistralai")
const { z } = require("zod")

const mistral = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY
})

function clientSafeError(message) {
    const error = new Error(message)
    error.isClientSafe = true
    return error
}

function parseJsonContent(content) {
    const raw = Array.isArray(content)
        ? content.map((part) => part.text || "").join("")
        : String(content || "")

    const cleaned = raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")

    return JSON.parse(cleaned)
}

function normalizeSeverity(severity) {
    return ["low", "medium", "high"].includes(severity) ? severity : "medium"
}

function normalizeQuestions(questions, type) {
    const fallbackAnswer = type === "behavioral"
        ? "A strong answer should describe the Situation, Task, Action, and Result clearly. Connect the example to the role requirements and highlight measurable impact. End by explaining what you learned and how you would apply it in this job."
        : "A strong answer should explain the concept, describe the trade-offs, and connect the solution to the job requirements. Include a practical example from your experience or a realistic project scenario. Close with how you would validate the result in production."

    const normalized = Array.isArray(questions)
        ? questions.map((question) => ({
            question: String(question?.question || `${type === "behavioral" ? "Behavioral" : "Technical"} interview question`).trim(),
            intention: String(question?.intention || "Assess role fit and readiness for the target job.").trim(),
            answer: String(question?.answer || fallbackAnswer).trim()
        }))
        : []

    while (normalized.length < 5) {
        normalized.push({
            question: `${type === "behavioral" ? "Behavioral" : "Technical"} interview question ${normalized.length + 1}`,
            intention: "Assess role fit and readiness for the target job.",
            answer: fallbackAnswer
        })
    }

    return normalized.slice(0, 5)
}

function normalizeReport(report) {
    const matchScore = Math.max(0, Math.min(100, Number(report?.matchScore) || 0))

    const skillGaps = Array.isArray(report?.skillGaps)
        ? report.skillGaps.slice(0, 5).map((gap) => ({
            skill: String(gap?.skill || "Role-specific skill").trim(),
            severity: normalizeSeverity(gap?.severity)
        }))
        : []

    const preparationPlan = Array.isArray(report?.preparationPlan)
        ? report.preparationPlan.slice(0, 7).map((day, index) => ({
            day: Number(day?.day) || index + 1,
            focus: String(day?.focus || "Targeted interview preparation").trim(),
            tasks: Array.isArray(day?.tasks) && day.tasks.length > 0
                ? day.tasks.map((task) => String(task).trim()).filter(Boolean)
                : ["Review the job description", "Practice one relevant answer", "Note improvements for the next session"]
        }))
        : []

    while (preparationPlan.length < 7) {
        preparationPlan.push({
            day: preparationPlan.length + 1,
            focus: preparationPlan.length === 6 ? "Mock interview and revision" : "Targeted interview preparation",
            tasks: ["Review the job description", "Practice one relevant answer", "Note improvements for the next session"]
        })
    }

    return {
        matchScore,
        technicalQuestions: normalizeQuestions(report?.technicalQuestions, "technical"),
        behavioralQuestions: normalizeQuestions(report?.behavioralQuestions, "behavioral"),
        skillGaps,
        preparationPlan
    }
}

// ── Zod schema with descriptions ─────────────────────────────────────────────

const QuestionSchema = z.object({
    question:  z.string().min(1).describe("Realistic, role-specific interview question based on the JD"),
    intention: z.string().min(1).describe("What skill or trait the interviewer is probing for"),
    answer:    z.string().min(50).describe("Strong model answer of at least 2-3 sentences; use STAR format for behavioral questions. MUST NOT be empty.")
})

const SkillGapSchema = z.object({
    skill:    z.string().describe("Skill required by JD but missing or weak in the resume"),
    severity: z.enum(["low", "medium", "high"]).describe("high=core requirement, medium=disadvantage, low=nice-to-have")
})

const PreparationPlanSchema = z.object({
    day:   z.number().describe("Day number 1-7"),
    focus: z.string().describe("Single topic tied to a skill gap or key JD requirement"),
    tasks: z.array(z.string()).describe("2-4 concrete actionable tasks for this day")
})

const InterviewReportSchema = z.object({
    matchScore:          z.number().min(0).max(100).describe("Honest 0-100 fit score. 70+=strong, 40-69=partial, <40=weak"),
    technicalQuestions:  z.array(QuestionSchema).describe("Exactly 5 technical questions, mid-to-senior difficulty"),
    behavioralQuestions: z.array(QuestionSchema).describe("Exactly 5 behavioral STAR-style questions"),
    skillGaps:           z.array(SkillGapSchema).describe("Up to 5 real gaps only — no gaps where candidate already has experience"),
    preparationPlan:     z.array(PreparationPlanSchema).describe("7-day plan addressing skill gaps; day 7 = mock interview and revision")
})

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert career coach and senior technical interviewer.
Analyze the job description, resume, and self-description provided and return ONLY a raw JSON object (no markdown, no explanation) with this structure:
{
  "matchScore": <0-100>,
  "technicalQuestions": [{"question":"","intention":"","answer":""}],
  "behavioralQuestions": [{"question":"","intention":"","answer":""}],
  "skillGaps": [{"skill":"","severity":"low|medium|high"}],
  "preparationPlan": [{"day":<1-7>,"focus":"","tasks":[""]}]
}
Rules:
- matchScore: honest fit score (70+=strong, 40-69=partial, <40=weak)
- technicalQuestions: exactly 5, specific to the JD tech stack, vary difficulty
- behavioralQuestions: exactly 5, use STAR format in answers
- CRITICAL: every "answer" field MUST contain a detailed response of at least 3 sentences. Never leave answer empty.
- skillGaps: only real gaps from JD vs resume, up to 5
- preparationPlan: 7 days, each targeting a gap; day 7 = mock interview + revision`

// ── Main function ─────────────────────────────────────────────────────────────

async function generateInterviewReport({ jobDescription, resume = "", selfDescription = "" }) {
    if (!process.env.MISTRAL_API_KEY) {
        throw clientSafeError("MISTRAL_API_KEY is missing in Backend/.env")
    }

    const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resume || "Not provided"}\n\nSelf Description:\n${selfDescription || "Not provided"}`

    let response
    try {
        response = await mistral.chat.complete({
            model: "mistral-large-latest",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user",   content: userPrompt }
            ],
            responseFormat: { type: "json_object" }
        })
    } catch (err) {
        throw clientSafeError(`Mistral request failed: ${err.message}`)
    }

    const raw = response.choices?.[0]?.message?.content
    if (!raw) {
        throw clientSafeError("Mistral returned an empty response")
    }

    let parsed
    try {
        parsed = parseJsonContent(raw)
    } catch {
        throw clientSafeError("Mistral returned invalid JSON. Please try again.")
    }

    const validated = InterviewReportSchema.parse(normalizeReport(parsed))

    console.log("✅ AI report generated and validated")
    return validated
}

module.exports = { generateInterviewReport, InterviewReportSchema }
