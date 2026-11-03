export const Navbar=()=>{
    return(
        <div style={{width:'100%'}}>
        <nav style={{marginTop:'0.0rem',display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#6A6C37', boxShadow: '0 4px 12px rgba(22, 67, 32, 0.1)', width:'100%',position:'fixed',top:0,left:0,right:0,zIndex:1000}}>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'white'}}>BorrowBox</div>
            <div style={{display: 'flex', alignItems: 'center',marginLeft:'4rem'}}>
                <a href="/" style={{marginRight: '1rem', textDecoration: 'none', color: 'white'}}>Home</a>
                <a href="/about" style={{marginRight: '1rem', textDecoration: 'none', color: 'white'}}>About</a>
                <a href="/contact" style={{textDecoration: 'none', color: 'white'}}>Contact</a>
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginRight:'4rem'}}>
                <a href="/login" style={{marginRight: '1rem', textDecoration: 'none', color: 'white'}}>Login</a>
                <a href="/signup" style={{textDecoration: 'none', color: 'white'}}>Sign Up</a>
            </div>
        </nav>
        </div>
    )
}