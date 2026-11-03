import { Navbar } from '../components/Navbar.jsx'
import { useState } from 'react'
import SignupBgImg from '../assets/images/SignupBg.png'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export const Signup = () => {
const navigate = useNavigate()
const [showPassword, setShowPassword] = useState(false)
const [username, setUsername] = useState("")
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")
const [errors, setErrors] = useState({})
const [touched, setTouched] = useState({})
const [loading, setLoading] = useState(false)

const handleNavigation = (path) => {
navigate(path)
window.scrollTo(0, 0)
}

const validateField = (field, value) => {
let error = ""
if (field === "username") {
    if (!value.trim()) {
    error = "Username is required"
    } else if (value.trim().length < 3) {
    error = "Username must be at least 3 characters"
    }
}
if (field === "email") {
    if (!value.trim()) {
    error = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    error = "Enter a valid email address"
    }
}
if (field === "password") {
    if (!value) {
    error = "Password is required"
    } else if (value.length < 6) {
    error = "Password must be at least 6 characters"
    }
}
if (field === "confirmPassword") {
    if (!value) {
    error = "Please confirm your password"
    } else if (value !== password) {
    error = "Passwords do not match"
    }
}
return error
}

const handleChange = (field, value) => {
if (field === "username") setUsername(value)
if (field === "email") setEmail(value)
if (field === "password") {
    setPassword(value)
    if (touched.confirmPassword) {
    setErrors(prev => ({
        ...prev,
        confirmPassword: value !== confirmPassword ? "Passwords do not match" : ""
    }))
    }
}
if (field === "confirmPassword") setConfirmPassword(value)

if (touched[field]) {
    setErrors(prev => ({
    ...prev,
    [field]: validateField(field, value)
    }))
}
}

const handleBlur = (field, value) => {
setTouched(prev => ({ ...prev, [field]: true }))
setErrors(prev => ({
    ...prev,
    [field]: validateField(field, value)
}))
}

const validateForm = () => {
const newErrors = {
    username: validateField("username", username),
    email: validateField("email", email),
    password: validateField("password", password),
    confirmPassword: validateField("confirmPassword", confirmPassword)
}
setErrors(newErrors)
setTouched({ username: true, email: true, password: true, confirmPassword: true })
return !newErrors.username && !newErrors.email && !newErrors.password && !newErrors.confirmPassword
}

const handleSubmit = async (e) => {
e.preventDefault()
if (!validateForm()) return

try {
    setLoading(true)
    const response = await fetch("http://localhost:5000/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), email: email.trim(), password })
    })
    const data = await response.json()

    if (!response.ok) {
    toast.error(data.message || "Signup failed")
    return
    }

    toast.success(data.message || "Account created successfully")
    navigate("/login")
} catch (error) {
    toast.error("Unable to connect to server")
} finally {
    setLoading(false)
}
}

return (
<div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundImage: `url(${SignupBgImg})`,
    backgroundSize: 'cover'
}}>
    <Navbar />
    <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'fit-content',
    backgroundColor: '#f5f5f5',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgba(22, 67, 32, 0.1)',
    marginLeft: 'auto',
    marginRight: "7rem",
    width: "50%"
    }}>
    <h1 style={{ fontSize: '4rem', marginBottom: '2rem', color: '#333' }}>Sign Up</h1>
    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <label style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem' }}>
            Username
        </label>
        <input 
            type="text" 
            placeholder="Enter your username" 
            value={username} 
            onChange={(e) => handleChange("username", e.target.value)} 
            onBlur={(e) => handleBlur("username", e.target.value)} 
            style={{
            width: '100%', 
            padding: '0.75rem', 
            border: errors.username ? '1px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.1)', 
            backgroundColor: '#fff', 
            color: '#333', 
            outline: 'none',
            borderRadius: '0.25rem'
            }} 
        />
        {errors.username && (
            <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#ef4444' }}>
            {errors.username}
            </p>
        )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <label style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem' }}>
            Email Address
        </label>
        <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => handleChange("email", e.target.value)} 
            onBlur={(e) => handleBlur("email", e.target.value)} 
            style={{
            width: '100%', 
            padding: '0.75rem', 
            border: errors.email ? '1px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.1)', 
            backgroundColor: '#fff', 
            color: '#333', 
            outline: 'none',
            borderRadius: '0.25rem'
            }}  />
        {errors.email && (
            <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#ef4444' }}>
            {errors.email}
            </p>
        )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <label style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem' }}>
            Password
        </label>
        <div style={{ position: 'relative', width: '100%' }}>
            <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Create a password" 
            value={password} 
            onChange={(e) => handleChange("password", e.target.value)} 
            onBlur={(e) => handleBlur("password", e.target.value)} 
            style={{
                width: '100%', 
                padding: '0.75rem', 
                border: errors.password ? '1px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.1)', 
                backgroundColor: '#fff', 
                color: '#333', 
                outline: 'none',
                borderRadius: '0.25rem',
                paddingRight: '3rem'
            }}  />
            <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)} 
            style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.875rem',
                color: 'rgba(0, 0, 0, 0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
            }} >
            {showPassword ? "Hide" : "Show"}
            </button>
        </div>
        {errors.password && (
            <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#ef4444' }}>
            {errors.password}
            </p>
        )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <label style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem' }}>
            Confirm Password
        </label>
        <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Confirm your password" 
            value={confirmPassword} 
            onChange={(e) => handleChange("confirmPassword", e.target.value)} 
            onBlur={(e) => handleBlur("confirmPassword", e.target.value)} 
            style={{
            width: '100%', 
            padding: '0.75rem', 
            border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid rgba(0, 0, 0, 0.1)', 
            backgroundColor: '#fff', 
            color: '#333', 
            outline: 'none',
            borderRadius: '0.25rem'
            }}  />
        {errors.confirmPassword && (
            <p style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#ef4444' }}>
            {errors.confirmPassword}
            </p>
        )}
        </div>
        <button 
        type="submit" 
        disabled={loading} 
        style={{
            width: '100%', 
            padding: '0.75rem', 
            backgroundColor: loading ? '#A3A3A3' : '#D4AF5A', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '0.25rem', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            marginTop: '0.5rem'
            }}>
            {loading ? "Signing Up..." : "Sign Up"}
        </button>
    </form>
    </div>
</div>
)
}
