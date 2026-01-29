import React, { useRef } from 'react';
import { useState } from 'react';
import mutasiService from '../../services/mutasiService';

const initialForm = {
  nomor: '',
  tanggal: '',
  nama: '',
  jabatan: '',
  email: '',
  telepon: '',
  lokasi: '',
  statusMutasi: '',
  keterangan: [
    { namaBarang: '', rakAsal: '', rakTujuan: '', merk: '', tipe: '', serialNumber: '' },
  ],
  tandaTanganDC: '',
  tandaTanganPersonel: '',
};

export default function MutasiBarangForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleKeteranganChange = (idx, e) => {
    const newKeterangan = [...form.keterangan];
    newKeterangan[idx][e.target.name] = e.target.value;
    setForm({ ...form, keterangan: newKeterangan });
  };

  const addKeterangan = () => {
    setForm({
      ...form,
      keterangan: [
        ...form.keterangan,
        { namaBarang: '', rakAsal: '', rakTujuan: '', merk: '', tipe: '', serialNumber: '' },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mutasiService.createMutasiBarang(form);
      alert('Data berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan data!');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Formulir Mutasi Barang</h2>
      <form onSubmit={handleSubmit} ref={printRef} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">No. <span className="text-red-500">*</span></label>
            <input name="nomor" value={form.nomor} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Nomor Mutasi" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Tanggal <span className="text-red-500">*</span></label>
            <input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Nama <span className="text-red-500">*</span></label>
            <input name="nama" value={form.nama} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Nama Personel" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Jabatan <span className="text-red-500">*</span></label>
            <input name="jabatan" value={form.jabatan} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Jabatan" required />
          </div>
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Email" />
          </div>
          <div>
            <label className="block font-medium mb-1">Telepon</label>
            <input name="telepon" value={form.telepon} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="No. Telepon" />
          </div>
          <div>
            <label className="block font-medium mb-1">Lokasi</label>
            <input name="lokasi" value={form.lokasi} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Lokasi" />
          </div>
          <div>
            <label className="block font-medium mb-1">Status Mutasi</label>
            <input name="statusMutasi" value={form.statusMutasi} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Status Mutasi" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Keterangan Perangkat</h3>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Nama Barang</th>
                  <th className="p-2 border">Rak Asal</th>
                  <th className="p-2 border">Rak Tujuan</th>
                  <th className="p-2 border">Merk</th>
                  <th className="p-2 border">Tipe</th>
                  <th className="p-2 border">Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {form.keterangan.map((item, idx) => (
                  <tr key={idx}>
                    <td><input name="namaBarang" value={item.namaBarang} onChange={e => handleKeteranganChange(idx, e)} className="border rounded px-2 py-1 w-full" placeholder="Nama Barang" /></td>
                    <td><input name="rakAsal" value={item.rakAsal} onChange={e => handleKeteranganChange(idx, e)} className="border rounded px-2 py-1 w-full" placeholder="Rak Asal" /></td>
                    <td><input name="rakTujuan" value={item.rakTujuan} onChange={e => handleKeteranganChange(idx, e)} className="border rounded px-2 py-1 w-full" placeholder="Rak Tujuan" /></td>
                    <td><input name="merk" value={item.merk} onChange={e => handleKeteranganChange(idx, e)} className="border rounded px-2 py-1 w-full" placeholder="Merk" /></td>
                    <td><input name="tipe" value={item.tipe} onChange={e => handleKeteranganChange(idx, e)} className="border rounded px-2 py-1 w-full" placeholder="Tipe" /></td>
                    <td><input name="serialNumber" value={item.serialNumber} onChange={e => handleKeteranganChange(idx, e)} className="border rounded px-2 py-1 w-full" placeholder="Serial Number" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addKeterangan} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Tambah Barang</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-1">Tanda Tangan DC Facility</label>
            <input name="tandaTanganDC" value={form.tandaTanganDC} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Nama DC Facility" />
          </div>
          <div>
            <label className="block font-medium mb-1">Tanda Tangan Personel</label>
            <input name="tandaTanganPersonel" value={form.tandaTanganPersonel} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Nama Personel" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-end mt-6">
          <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded hover:bg-primary-700" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
          <button type="button" className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300" onClick={handlePrint}>Cetak</button>
        </div>
      </form>
    </div>
  );
}
