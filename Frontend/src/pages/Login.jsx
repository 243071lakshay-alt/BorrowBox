import {Navbar} from '../components/Navbar.jsx'
import { useState } from 'react'
import SignupBgImg from '../assets/images/SignupBg.png'
import {useNavigate} from 'react-router-dom'
import {toast} from 'react-toastify'
export const Login=()=>{
    const navigate = useNavigate()
    const [showPassword,setShowPassword] = useState(false)
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [errors,setErrors] = useState({})
    const [touched,setTouched] = useState({})
    const [loading,setLoading] = useState(false)

    const handleNavigation=(path)=>{
        navigate(path)
        window.scrollTo(0,0)
    }

    const validateField=(field,value)=>{
        let error=""
        if(field==="email"){
            if(!value.trim()){
                error="Email is required"
            }else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){
                error="Enter a valid email address"
            }
        }
        if(field==="password"){
            if(!value){
                error="Password is required"
            }
        }
        return error
    }

    const handleChange=(field,value)=>{
        if(field==="email"){
            setEmail(value)
        }
        if(field==="password"){
            setPassword(value)
        }
        if(touched[field]){
            setErrors(prev=>({
                ...prev,
                [field]:validateField(field,value)
            }))
        }
    }

    const handleBlur=(field,value)=>{
        setTouched(prev=>({
            ...prev,
            [field]:true
        }))
        setErrors(prev=>({
            ...prev,
            [field]:validateField(field,value)
        }))
    }

    const validateForm=()=>{
        const newErrors={
            email:validateField("email",email),
            password:validateField("password",password)
        }
        setErrors(newErrors)
        setTouched({
            email:true,
            password:true
        })
        return !newErrors.email && !newErrors.password
    }

    const handleSubmit=async(e)=>{
        e.preventDefault()
        if(!validateForm()){
            return
        }
        try{
            setLoading(true)
            const response = await fetch("http://localhost:5000/api/login",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:email.trim(),
                    password
                })
            })
            const data = await response.json()
            if(!response.ok){
                toast.error(data.message || "Login failed")
                return
            }
            login(data.token);
            toast.success(data.message || "Login successful");
            navigate("/dashboard");
        }catch(error){
            toast.error("Unable to connect to server")
        }finally{
            setLoading(false)
        }
    }
    return(
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh',backgroundImage:`url(${SignupBgImg})`,backgroundSize:'cover'}}>
            <Navbar/>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'fit-content',width:'60%',backgroundColor:'#f5f5f5',padding:'2rem',borderRadius:'1rem',boxShadow:'0 4px 12px rgba(22, 67, 32, 0.1)',marginLeft:'auto',marginRight:"7rem",width:"50%"}}>
                <h1 style={{fontSize: '4rem', marginBottom: '2rem'}}>Login</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label style={{fontSize: '0.875rem', color: '#fff/65'}}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e)=>handleChange("email",e.target.value)}
                                    onBlur={(e)=>handleBlur("email",e.target.value)}
                                    style={{width: '100%', padding: '0.75rem', border: errors.email ? '1px solid #ef4444' : '1px solid #ffffff/10', backgroundColor: 'rgba(255, 255, 255, 0.04)', color: '#fff', placeholderTextColor: '#ffffff/20', outline: 'none', focus: {borderColor: '#D4AF5A/50', backgroundColor: 'rgba(255, 255, 255, 0.06)'}}} />
                                {errors.email && (
                                    <p style={{marginTop: '0.375rem', fontSize: '0.75rem', color: '#ef4444'}}>
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label style={{fontSize: '0.875rem', color: '#fff/65'}}>
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={()=>handleNavigation("/forgot-password")}
                                        style={{fontSize: '0.875rem', color: '#D4AF5A/80', hover: {color: '#D4AF5A'}, transition: 'color 0.2s ease'}} >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e)=>handleChange("password",e.target.value)}
                                        onBlur={(e)=>handleBlur("password",e.target.value)}
                                        style={{width: '100%', padding: '0.75rem', border: errors.password ? '1px solid #ef4444' : '1px solid #ffffff/10', backgroundColor: 'rgba(255, 255, 255, 0.04)', color: '#fff', placeholderTextColor: '#ffffff/20', outline: 'none', focus: {borderColor: '#D4AF5A/50', backgroundColor: 'rgba(255, 255, 255, 0.06)'}}}
                                    />
                                    <button type="button" onClick={()=>setShowPassword(!showPassword)}
                                        style={{position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: '#fff/35', hover: {color: '#fff/70'}, transition: 'color 0.2s ease'}} >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-red-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{width: '100%', padding: '0.75rem', backgroundColor: '#D4AF5A', color: '#fff', border: 'none', borderRadius: '0.25rem', cursor: loading ? 'not-allowed' : 'pointer'}}>
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
            </div>
        </div>
    )
}