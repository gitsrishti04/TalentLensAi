import { createBrowserRouter } from "react-router"
import RootLayout from "./layouts/RootLayout"
import Login from "./features/auth/pages/Login"
import Register from "./features/auth/pages/Register"
import Home from "./features/interview/pages/Home"
import Interview from "./features/interview/pages/interview"
import Protected from "./features/auth/components/protected"

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <Protected><Home /></Protected>
            },
            {
                path: "/interview/:id",
                element: <Protected><Interview /></Protected>
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            }
        ]
    }
])
