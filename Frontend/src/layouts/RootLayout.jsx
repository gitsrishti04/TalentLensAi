import { Outlet } from "react-router"
import { AuthProvider } from "../features/auth/services/auth.context"
import { InterviewProvider } from "../features/interview/interview.context"

const RootLayout = () => {
    return (
        <AuthProvider>
            <InterviewProvider>
                <Outlet />
            </InterviewProvider>
        </AuthProvider>
    )
}

export default RootLayout
