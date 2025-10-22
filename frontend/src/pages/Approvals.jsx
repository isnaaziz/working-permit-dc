import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../state/AuthContext'

export default function Approvals() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isPIC = user.role === 'PIC'
  const isManager = user.role === 'MANAGER'

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = isPIC
        ? `/api/approvals/pic/${user.id}/pending`
        : `/api/approvals/manager/${user.id}/pending`
      const { data } = await api.get(url)
      setItems(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const act = async (permitId, approved) => {
    try {
      if (isPIC) {
        await api.post(`/api/approvals/pic/review`, { permitId, approved }, { params: { picId: user.id } })
      } else if (isManager) {
        await api.post(`/api/approvals/manager/approve`, { permitId, approved }, { params: { managerId: user.id } })
      }
      await load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to perform action')
    }
  }

  if (!(isPIC || isManager)) return <div className="error">Only PIC or MANAGER can access this page.</div>

  return (
    <div>
      <h2>Pending Approvals ({isPIC ? 'PIC' : 'Manager'})</h2>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : items.length === 0 ? (
        <div className="muted">No pending approvals</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Approval ID</th>
              <th>Permit</th>
              <th>Visitor</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.workingPermit?.permitNumber || a.permit?.permitNumber}</td>
                <td>{a.workingPermit?.visitor?.fullName || a.permit?.visitor?.fullName}</td>
                <td>{a.status}</td>
                <td>
                  <button className="btn small" onClick={() => act(a.workingPermit?.id || a.permit?.id, true)}>Approve</button>
                  <button className="btn small danger" onClick={() => act(a.workingPermit?.id || a.permit?.id, false)}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
