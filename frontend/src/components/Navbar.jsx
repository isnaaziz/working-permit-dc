import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">Working Permit</Link>
      {isAuthenticated && (
        <nav className="nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/permits">Permits</NavLink>
          {(user.role === 'PIC' || user.role === 'MANAGER') && <NavLink to="/approvals">Approvals</NavLink>}
          {(user.role === 'SECURITY' || user.role === 'ADMIN') && <NavLink to="/access">Access</NavLink>}
          <NavLink to="/notifications">Notifications</NavLink>
          {user.role === 'ADMIN' && <NavLink to="/users">Users</NavLink>}
        </nav>
      )}
      <div className="auth">
        {isAuthenticated ? (
          <>
            <span className="user-chip">{user.fullName} ({user.role})</span>
            <button onClick={handleLogout} className="btn">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </header>
  )
}
