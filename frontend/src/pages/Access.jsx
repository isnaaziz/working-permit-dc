import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../state/AuthContext'

export default function Access() {
  const { user } = useAuth()
  const [verifyForm, setVerifyForm] = useState({ qrCodeData: '', otpCode: '', location: 'Main Gate' })
  const [permitLogs, setPermitLogs] = useState([])
  const [allLogs, setAllLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const isSecurity = user.role === 'SECURITY' || user.role === 'ADMIN'

  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/access/logs')
      setAllLogs(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  const handleChange = (e) => setVerifyForm({ ...verifyForm, [e.target.name]: e.target.value })

  const verify = async (e) => {
    e.preventDefault()
    const { data } = await api.post('/api/access/verify', verifyForm)
    alert(`${data.message}: ${data.visitor} / ${data.permitNumber}`)
  }

  const checkIn = async () => {
    const { data } = await api.post('/api/access/check-in', verifyForm)
    alert(`Check-in OK, Card: ${data.idCardNumber}`)
    await loadLogs()
  }

  const checkOut = async (permitId) => {
    await api.post('/api/access/check-out', null, { params: { permitId, location: verifyForm.location } })
    alert('Check-out OK')
    await loadLogs()
  }

  return (
    <div>
      <h2>Access Control</h2>
      {!isSecurity && <div className="muted">Read-only access</div>}

      <div className="card">
        <h3>Verify / Check-in</h3>
        <form onSubmit={verify} className="form grid">
          <label className="col-span-2">
            QR Code Data
            <input name="qrCodeData" value={verifyForm.qrCodeData} onChange={handleChange} required />
          </label>
          <label>
            OTP Code
            <input name="otpCode" value={verifyForm.otpCode} onChange={handleChange} required />
          </label>
          <label>
            Location
            <input name="location" value={verifyForm.location} onChange={handleChange} />
          </label>
          <div className="col-span-2">
            <button className="btn">Verify</button>
            {isSecurity && <button type="button" className="btn" onClick={checkIn}>Check-in</button>}
          </div>
        </form>
      </div>

      <div className="card mt">
        <h3>Access Logs</h3>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Permit</th>
                <th>Visitor</th>
                <th>Type</th>
                <th>Status</th>
                <th>Location</th>
                <th>Time</th>
                {isSecurity && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {allLogs.map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.workingPermit?.permitNumber}</td>
                  <td>{l.workingPermit?.visitor?.fullName}</td>
                  <td>{l.accessType}</td>
                  <td>{l.accessStatus}</td>
                  <td>{l.location}</td>
                  <td>{l.timestamp?.replace('T', ' ')}</td>
                  {isSecurity && (
                    <td>
                      {l.workingPermit?.id && (
                        <button className="btn small" onClick={() => checkOut(l.workingPermit.id)}>Checkout</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
