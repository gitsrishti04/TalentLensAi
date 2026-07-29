import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Register = () => {

    
    const { loading, handleRegister } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await handleRegister({ username, email, password })
            navigate("/")
        } catch (err) {
            console.log(err)
        }
    }

    if (loading) {
        return <main><h1>Loading...</h1></main>
    }

    return (
        <main>
            <div className="form-container">
                <h1>Register</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                            type="text" id="username" name="username" placeholder="Enter username" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            type="email" id="email" name="email" placeholder="Enter email address" />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            type="password" id="password" name="password" placeholder="Enter your password" />
                    </div>

                    <button className="button primary-button" type="submit">Register</button>
                </form>

                <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
        </main>
    )
}

export default Register
