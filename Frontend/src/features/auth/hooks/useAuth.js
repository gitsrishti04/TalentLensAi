import { useContext } from "react"
import { AuthContext } from "../services/auth-context"
import { login, register, logout, getMe } from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }

    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        try {
            const data = await login({ email, password })
            setUser(data.user)
            return data
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
            return true
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const fetchMe = async () => {
        setLoading(true)
        try {
            const data = await getMe()
            setUser(data.user)
            return data
        } catch (err) {
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    return { user, loading, handleLogin, handleRegister, handleLogout, fetchMe }
}
