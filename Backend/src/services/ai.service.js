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

    const response = await mistral.chat.complete({
        model: "mistral-large-latest",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user",   content: userPrompt }
        ],
        responseFormat: { type: "json_object" }
    })

    const raw = response.choices[0].message.content
    const parsed = JSON.parse(raw)
    const validated = InterviewReportSchema.parse(parsed)

    console.log("✅ AI report generated and validated")
    return validated
}

module.exports = { generateInterviewReport, InterviewReportSchema }
