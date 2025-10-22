import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../state/AuthContext'

const visitTypes = [
  'PREVENTIVE_MAINTENANCE',
  'ASSESSMENT',
  'TROUBLESHOOT',
  'CABLE_PULLING',
  'AUDIT',
  'INSTALLATION',
  'VISIT',
]

const dataCenters = ['DC1', 'DC2', 'DC3']

export default function Permits() {
  const { user } = useAuth()
  const [permits, setPermits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [createForm, setCreateForm] = useState({
    visitPurpose: '',
    visitType: visitTypes[0],
    dataCenter: dataCenters[0],
    picId: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    equipmentList: '',
    workOrderDocument: '',
  })
  const canCreate = user.role === 'VISITOR' || user.role === 'ADMIN'

  const listUrl = useMemo(() => {
    if (user.role === 'VISITOR') return `/api/permits/visitor/${user.id}`
    if (user.role === 'PIC') return `/api/permits/pic/${user.id}`
    if (user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'SECURITY') return `/api/permits`
    return `/api/permits`
  }, [user])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(listUrl)
      setPermits(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load permits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl])

  const handleCreateChange = (e) => setCreateForm({ ...createForm, [e.target.name]: e.target.value })

  const submitCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        visitPurpose: createForm.visitPurpose,
        visitType: createForm.visitType,
        dataCenter: createForm.dataCenter,
        picId: Number(createForm.picId),
        scheduledStartTime: createForm.scheduledStartTime,
        scheduledEndTime: createForm.scheduledEndTime,
        equipmentList: createForm.equipmentList
          ? createForm.equipmentList.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        workOrderDocument: createForm.workOrderDocument || null,
      }
      await api.post(`/api/permits`, payload, { params: { visitorId: user.id } })
      setCreateForm({
        visitPurpose: '', visitType: visitTypes[0], dataCenter: dataCenters[0], picId: '',
        scheduledStartTime: '', scheduledEndTime: '', equipmentList: '', workOrderDocument: '',
      })
      await load()
      alert('Permit created')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create permit')
    }
  }

  return (
    <div>
      <h2>Permits</h2>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Visitor</th>
              <th>PIC</th>
              <th>Status</th>
              <th>Schedule</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {permits.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.permitNumber}</td>
                <td>{p.visitor?.fullName || '-'}</td>
                <td>{p.pic?.fullName || '-'}</td>
                <td><span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span></td>
                <td>
                  {p.scheduledStartTime?.replace('T', ' ')} → {p.scheduledEndTime?.replace('T', ' ')}
                </td>
                <td>
                  <Link to={`/permits/${p.id}`} className="btn small">Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canCreate && (
        <div className="card mt">
          <h3>Create Permit</h3>
          <form onSubmit={submitCreate} className="form grid">
            <label>
              Visit Purpose
              <input name="visitPurpose" value={createForm.visitPurpose} onChange={handleCreateChange} required />
            </label>
            <label>
              Visit Type
              <select name="visitType" value={createForm.visitType} onChange={handleCreateChange}>
                {visitTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Data Center
              <select name="dataCenter" value={createForm.dataCenter} onChange={handleCreateChange}>
                {dataCenters.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
            <label>
              PIC ID
              <input name="picId" value={createForm.picId} onChange={handleCreateChange} required />
            </label>
            <label>
              Start Time
              <input type="datetime-local" name="scheduledStartTime" value={createForm.scheduledStartTime} onChange={handleCreateChange} required />
            </label>
            <label>
              End Time
              <input type="datetime-local" name="scheduledEndTime" value={createForm.scheduledEndTime} onChange={handleCreateChange} required />
            </label>
            <label className="col-span-2">
              Equipment List (comma separated)
              <input name="equipmentList" value={createForm.equipmentList} onChange={handleCreateChange} />
            </label>
            <label className="col-span-2">
              Work Order Document (path)
              <input name="workOrderDocument" value={createForm.workOrderDocument} onChange={handleCreateChange} />
            </label>
            <div className="col-span-2">
              <button className="btn primary">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
