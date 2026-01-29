import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import mutasiService from '../../services/mutasiService';

export default function MutasiBarangEdit() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    mutasiService.getById(id).then(setForm).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleKeteranganChange = (idx, e) => {
    const newKeterangan = [...form.keterangan];
    newKeterangan[idx][e.target.name] = e.target.value;
    setForm({ ...form, keterangan: newKeterangan });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await mutasiService.update(id, form);
    alert('Data berhasil diupdate!');
    navigate('/dashboard/mutasi-barang');
  };

  if (loading || !form) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit Mutasi Barang</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>No.:</label>
            <input name="nomor" value={form.nomor} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label>Tanggal:</label>
            <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label>Nama:</label>
            <input name="nama" value={form.nama} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label>Jabatan:</label>
            <input name="jabatan" value={form.jabatan} onChange={handleChange} className="input" required />
          </div>
          <div>
            <label>Email:</label>
            <input name="email" value={form.email} onChange={handleChange} className="input" />
          </div>
          <div>
            <label>Telepon:</label>
            <input name="telepon" value={form.telepon} onChange={handleChange} className="input" />
          </div>
          <div>
            <label>Lokasi:</label>
            <input name="lokasi" value={form.lokasi} onChange={handleChange} className="input" />
          </div>
          <div>
            <label>Status Mutasi:</label>
            <input name="statusMutasi" value={form.statusMutasi} onChange={handleChange} className="input" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Keterangan Perangkat</h3>
          <table className="w-full border mt-2">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Rak Asal</th>
                <th>Rak Tujuan</th>
                <th>Merk</th>
                <th>Tipe</th>
                <th>Serial Number</th>
              </tr>
            </thead>
            <tbody>
              {form.keterangan.map((item, idx) => (
                <tr key={idx}>
                  <td><input name="namaBarang" value={item.namaBarang} onChange={e => handleKeteranganChange(idx, e)} className="input" /></td>
                  <td><input name="rakAsal" value={item.rakAsal} onChange={e => handleKeteranganChange(idx, e)} className="input" /></td>
                  <td><input name="rakTujuan" value={item.rakTujuan} onChange={e => handleKeteranganChange(idx, e)} className="input" /></td>
                  <td><input name="merk" value={item.merk} onChange={e => handleKeteranganChange(idx, e)} className="input" /></td>
                  <td><input name="tipe" value={item.tipe} onChange={e => handleKeteranganChange(idx, e)} className="input" /></td>
                  <td><input name="serialNumber" value={item.serialNumber} onChange={e => handleKeteranganChange(idx, e)} className="input" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label>Tanda Tangan DC Facility:</label>
            <input name="tandaTanganDC" value={form.tandaTanganDC} onChange={handleChange} className="input" />
          </div>
          <div>
            <label>Tanda Tangan Personel:</label>
            <input name="tandaTanganPersonel" value={form.tandaTanganPersonel} onChange={handleChange} className="input" />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button type="submit" className="btn">Update</button>
        </div>
      </form>
    </div>
  );
}
