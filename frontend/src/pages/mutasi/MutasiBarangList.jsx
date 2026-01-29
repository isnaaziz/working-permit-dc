import React, { useEffect, useState } from 'react';
import mutasiService from '../../services/mutasiService';
import { useNavigate } from 'react-router-dom';

export default function MutasiBarangList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    mutasiService.getAll().then(setData).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Yakin hapus data ini?')) {
      await mutasiService.remove(id);
      setData(data.filter(item => item.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-white rounded shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Data Mutasi Barang</h2>
        <button className="btn" onClick={() => navigate('/dashboard/mutasi-barang')}>+ Tambah Mutasi Barang</button>
      </div>
      {loading ? <div>Loading...</div> : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>No.</th>
              <th>Nomor</th>
              <th>Tanggal</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>{item.nomor}</td>
                <td>{item.tanggal}</td>
                <td>{item.nama}</td>
                <td>{item.jabatan}</td>
                <td className="flex gap-2">
                  <button className="btn" onClick={() => navigate(`/dashboard/mutasi-barang/${item.id}`)}>Lihat/Edit</button>
                  <button className="btn" onClick={() => navigate(`/dashboard/mutasi-barang/${item.id}/pdf`)}>Export PDF</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(item.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
