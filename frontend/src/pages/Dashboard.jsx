import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const cards = [
    { to: '/permits', title: 'Permits', desc: 'Lihat & kelola working permit' },
    { to: '/notifications', title: 'Notifications', desc: 'Pemberitahuan terbaru' },
  ]
  if (user.role === 'PIC' || user.role === 'MANAGER') {
    cards.push({ to: '/approvals', title: 'Approvals', desc: 'Review & approval permit' })
  }
  if (user.role === 'SECURITY' || user.role === 'ADMIN') {
    cards.push({ to: '/access', title: 'Access', desc: 'Check-in/out & logs' })
  }
  if (user.role === 'ADMIN') {
    cards.push({ to: '/users', title: 'Users', desc: 'Kelola pengguna' })
  }

  return (
    <div>
      <h2>Welcome, {user.fullName}</h2>
      <p>Role: <b>{user.role}</b></p>
      <div className="grid cards">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="card link-card">
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
