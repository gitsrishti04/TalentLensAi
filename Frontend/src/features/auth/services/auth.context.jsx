import { useEffect, useState } from "react"
import { getMe } from "./auth.api"
import { AuthContext } from "./auth-context"

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const hydrateUser = async () => {
            try {
                const data = await getMe()
                if (isMounted) setUser(data.user)
            } catch {
                if (isMounted) setUser(null)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        hydrateUser()

        return () => {
            isMounted = false
        }
    }, [])


    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
