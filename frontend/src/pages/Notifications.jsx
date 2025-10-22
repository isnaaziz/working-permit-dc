import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../state/AuthContext'

export default function Notifications() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const { data } = await api.get(`/api/notifications/user/${user.id}`)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await api.post(`/api/notifications/${id}/read`)
    await load()
  }

  const markAll = async () => {
    await api.post(`/api/notifications/user/${user.id}/read-all`)
    await load()
  }

  return (
    <div>
      <h2>Notifications</h2>
      <div className="actions">
        <button className="btn" onClick={markAll}>Mark all as read</button>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div className="muted">No notifications</div>
      ) : (
        <ul className="list">
          {items.map((n) => (
            <li key={n.id} className={n.deliveryStatus === 'DELIVERED' ? '' : 'muted'}>
              <div>
                <b>{n.title || n.deliveryChannel}</b>
                <div className="muted small">{new Date(n.createdAt || n.timestamp || Date.now()).toLocaleString()}</div>
              </div>
              <div>{n.message || n.content}</div>
              <div>
                {!n.read && <button className="btn small" onClick={() => markRead(n.id)}>Mark read</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
