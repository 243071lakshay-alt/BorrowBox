import { useState } from 'react'
import SignupBgImg from '../assets/images/SignupBg.png'
import {Navbar} from '../components/Navbar.jsx'
export const Signup=()=>{
    const [username,setUsername]=useState('')
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [hide,setHide]=useState(true)
    const fetchData=async ()=>{
        try{
            const response=await fetch('http://localhost:5000/api/signup',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({username,email,password})
            })
            const data=await response.json()
            console.log(data)
        }catch{
            alert('Error creating user')
        }
    }
    const handleSubmit=(e)=>{
        e.preventDefault()
        fetchData()
    }
    return(
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh',backgroundImage:`url(${SignupBgImg})`,backgroundSize:'cover'}}>
            <Navbar/>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'fit-content',width:'60%',backgroundColor:'#f5f5f5',padding:'2rem',borderRadius:'1rem',boxShadow:'0 4px 12px rgba(22, 67, 32, 0.1)',marginLeft:'auto',marginRight:"7rem",width:"50%"}}>
                <h1 style={{fontSize: '4rem', marginBottom: '2rem'}}>Sign Up</h1>
                <form style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} onSubmit={handleSubmit}>
                    <input type="text" placeholder="Username" 
                        style={{marginBottom: '1rem', padding: '0.5rem', width: '20rem', borderRadius: '0.25rem'}} value={username} onChange={(e)=>setUsername(e.target.value)} />
                    <input type="email" placeholder="Email" style={{marginBottom: '1rem', padding: '0.5rem', width: '20rem', borderRadius: '0.25rem'}} value={email} onChange={(e)=>setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" style={{marginBottom: '1rem', padding: '0.5rem', width: '20rem', borderRadius: '0.25rem'}} value={password} onChange={(e)=>setPassword(e.target.value)} />
                    <span style={{marginBottom: '1rem', cursor: 'pointer', color: 'blue'}} onClick={()=>setHide(!hide)}>{hide?'Show Password':'Hide Password'}</span>
                    <input type="password" placeholder="Confirm Password" style={{marginBottom: '1rem', padding: '0.5rem', width: '20rem', borderRadius: '0.25rem'}} />
                    <button type="submit" style={{padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '0.25rem'}}
                        onSubmit={handleSubmit}>Sign Up</button>
                </form>
            </div>
        </div>
    )
}