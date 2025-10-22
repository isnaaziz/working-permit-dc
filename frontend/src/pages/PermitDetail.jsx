import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import api from '../api/client'
import { useAuth } from '../state/AuthContext'

export default function PermitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/permits/${id}`)
      setPermit(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load permit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const cancelPermit = async () => {
    if (!confirm('Cancel this permit?')) return
    await api.post(`/api/permits/${id}/cancel`)
    alert('Cancelled')
    navigate('/permits')
  }

  const activatePermit = async () => {
    await api.post(`/api/permits/${id}/activate`)
    alert('Activated')
    await load()
  }

  const regenerateOtp = async () => {
    const { data } = await api.post(`/api/permits/${id}/regenerate-otp`)
    alert(`New OTP: ${data.otp}`)
    await load()
  }

  if (loading) return <div>Loading…</div>
  if (error) return <div className="error">{error}</div>
  if (!permit) return null

  const showActions = ['ADMIN', 'MANAGER', 'PIC'].includes(user.role)

  return (
    <div>
      <h2>Permit #{permit.permitNumber} ({permit.status})</h2>
      <div className="grid">
        <div className="card">
          <h3>Details</h3>
          <p><b>Visitor:</b> {permit.visitor?.fullName} ({permit.visitor?.company})</p>
          <p><b>PIC:</b> {permit.pic?.fullName}</p>
          <p><b>Purpose:</b> {permit.visitPurpose}</p>
          <p><b>Type:</b> {permit.visitType}</p>
          <p><b>Data Center:</b> {permit.dataCenter}</p>
          <p><b>Schedule:</b> {permit.scheduledStartTime?.replace('T',' ')} → {permit.scheduledEndTime?.replace('T',' ')}</p>
          <p><b>Equipments:</b> {(permit.equipmentList||[]).join(', ') || '-'}</p>
        </div>
        <div className="card">
          <h3>Access</h3>
          {permit.qrCodeData ? (
            <div>
              <QRCodeCanvas value={permit.qrCodeData} size={180} />
              <p className="muted">QR Code Data: {permit.qrCodeData}</p>
              <p><b>OTP:</b> {permit.otpCode || '-'}</p>
            </div>
          ) : (
            <p>No QR generated yet</p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="actions mt">
          <button className="btn" onClick={regenerateOtp}>Regenerate OTP</button>
          <button className="btn" onClick={activatePermit}>Activate</button>
          <button className="btn danger" onClick={cancelPermit}>Cancel</button>
        </div>
      )}
    </div>
  )
}
