const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_DAY_MS
}

function sanitizeUser(user) {
    return { id: user._id, username: user.username, email: user.email }
}

function createToken(user) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters long")
    }

    return jwt.sign(
        { id: user._id.toString(), username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )
}

async function registerUserController(req, res) {
    try {
        const username = String(req.body.username || "").trim()
        const email = String(req.body.email || "").trim().toLowerCase()
        const password = String(req.body.password || "")

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (!USERNAME_REGEX.test(username)) {
            return res.status(400).json({ message: "Username must be 3-30 characters and use only letters, numbers, or underscores" })
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" })
        }
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and include uppercase, lowercase, and a number" })
        }

        const isUserExists = await userModel.findOne({ $or: [{ email }, { username }] })
        if (isUserExists) {
            return res.status(409).json({ message: "User already exists" })
        }

        const hash = await bcrypt.hash(password, 12)
        const user = await userModel.create({ username, email, password: hash })
        const token = createToken(user)

        res.cookie("token", token, COOKIE_OPTIONS)

        return res.status(201).json({
            message: "User registered successfully",
            user: sanitizeUser(user)
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Authentication service error", error: err.message })
    }
}

async function loginUserController(req, res) {
    try {
        const email = String(req.body.email || "").trim().toLowerCase()
        const password = String(req.body.password || "")

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" })
        }

        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const token = createToken(user)

        res.cookie("token", token, COOKIE_OPTIONS)

        return res.status(200).json({
            message: "User logged in successfully",
            user: sanitizeUser(user)
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Authentication service error", error: err.message })
    }
}

async function logoutUserController(req, res) {
    try {
        const token = req.cookies.token
        if (!token) {
            res.clearCookie("token", COOKIE_OPTIONS)
            return res.status(200).json({ message: "User logged out successfully" })
        }
        await tokenBlacklistModel.create({ token })
        res.clearCookie("token", COOKIE_OPTIONS)
        return res.status(200).json({ message: "User logged out successfully" })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        return res.status(200).json({
            message: "User details fetched successfully",
            user: sanitizeUser(user)
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}
