import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mutasiService from '../../services/mutasiService';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Badge } from '../../components/ui';

// Generate unique mutation number
const generateNomorMutasi = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MUT-${year}${month}${day}-${random}`;
};

const initialForm = {
  nomor: '',
  tanggal: '',
  nama: '',
  jabatan: '',
  email: '',
  telepon: '',
  lokasi: '',
  statusMutasi: '',
  teamPendamping: '',
  visibleToPIC: true,
  visibleToManager: true,
  visibleToSecurity: true,
  visibleToManager: true,
  visibleToSecurity: true,
  keterangan: [
    { namaBarang: '', rakAsal: '', rakTujuan: '', merk: '', tipe: '', serialNumber: '' },
  ],
};

// Team options
const teamOptions = [
  { id: 'TIM_ODC', name: 'Tim ODC' },
  { id: 'TIM_INFRA', name: 'Tim INFRA' },
  { id: 'TIM_NETWORK', name: 'Tim Network' },
  { id: 'TIM_SECURITY', name: 'Tim Security' },
];

// Status options
const statusOptions = [
  { id: 'Draft', name: 'Draft' },
  { id: 'Proses', name: 'Dalam Proses' },
  { id: 'Selesai', name: 'Selesai' },
];

// Data Center options (same as permit form)
const dataCenterOptions = [
  { id: 'DC1', name: 'Data Center 1' },
  { id: 'DC2', name: 'Data Center 2' },
  { id: 'DC3', name: 'Data Center 3' },
];

export default function MutasiBarangForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const printRef = useRef();

  // Auto-generate nomor mutasi on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setForm(prev => ({
      ...prev,
      nomor: generateNomorMutasi(),
      tanggal: today
    }));
  }, []);

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

  const removeKeterangan = (idx) => {
    if (form.keterangan.length > 1) {
      const newKeterangan = form.keterangan.filter((_, i) => i !== idx);
      setForm({ ...form, keterangan: newKeterangan });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await mutasiService.createMutasiBarang(form);

      if (uploadedFile) {
        try {
          await mutasiService.uploadDocument(result.id, uploadedFile);
        } catch (uploadErr) {
          console.error('Upload failed:', uploadErr);
          alert('Mutasi berhasil dibuat, tetapi gagal mengupload dokumen. Silakan coba upload ulang di halaman detail.');
        }
      }

      alert('Data berhasil disimpan!');
      navigate('/dashboard/mutasi-barang/list');
    } catch (err) {
      alert('Gagal menyimpan data!');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-600">
            <i className="ri-exchange-line text-primary-600 mr-2"></i>
            Formulir Mutasi Barang
          </h1>
          <p className="text-gray-500">Isi form untuk mencatat mutasi barang</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/mutasi-barang/list')}
          icon={<i className="ri-arrow-left-line"></i>}
        >
          Kembali ke Daftar
        </Button>
      </div>

      <form onSubmit={handleSubmit} ref={printRef}>
        {/* Basic Information */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-file-text-line text-primary-600 text-xl"></i>
            <h3 className="font-bold text-dark-600">Informasi Dasar</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">No. Mutasi</label>
              <div className="flex items-center gap-2">
                <input
                  name="nomor"
                  value={form.nomor}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 text-gray-700 font-mono cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, nomor: generateNomorMutasi() }))}
                  className="p-2.5 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors"
                  title="Generate ulang nomor"
                >
                  <i className="ri-refresh-line"></i>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Nomor di-generate otomatis</p>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Tanggal <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Status Mutasi</label>
              <select
                name="statusMutasi"
                value={form.statusMutasi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">-- Pilih Status --</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Lokasi Data Center <span className="text-red-500">*</span></label>
              <select
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              >
                <option value="">-- Pilih Data Center --</option>
                {dataCenterOptions.map(dc => (
                  <option key={dc.id} value={dc.id}>{dc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Personnel Information */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-user-line text-primary-600 text-xl"></i>
            <h3 className="font-bold text-dark-600">Data Personel</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-gray-700 mb-2">Nama <span className="text-red-500">*</span></label>
              <input
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Nama Personel"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Jabatan <span className="text-red-500">*</span></label>
              <input
                name="jabatan"
                value={form.jabatan}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Jabatan"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Telepon</label>
              <input
                name="telepon"
                value={form.telepon}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-2">Tim Pendamping <span className="text-red-500">*</span></label>
              <select
                name="teamPendamping"
                value={form.teamPendamping}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              >
                <option value="">-- Pilih Tim --</option>
                {teamOptions.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Visibility Settings */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-eye-line text-primary-600 text-xl"></i>
            <h3 className="font-bold text-dark-600">Visibilitas Dokumen</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Pilih role yang dapat melihat dokumen ini:</p>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="visibleToPIC"
                checked={form.visibleToPIC}
                onChange={(e) => setForm({ ...form, visibleToPIC: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div>
                <span className="font-medium text-dark-600">PIC</span>
                <p className="text-xs text-gray-500">Person In Charge</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="visibleToManager"
                checked={form.visibleToManager}
                onChange={(e) => setForm({ ...form, visibleToManager: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div>
                <span className="font-medium text-dark-600">Manager</span>
                <p className="text-xs text-gray-500">Manager Tim</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                name="visibleToSecurity"
                checked={form.visibleToSecurity}
                onChange={(e) => setForm({ ...form, visibleToSecurity: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <div>
                <span className="font-medium text-dark-600">Security</span>
                <p className="text-xs text-gray-500">Tim Keamanan</p>
              </div>
            </label>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-upload-cloud-line text-primary-600 text-xl"></i>
            <h3 className="font-bold text-dark-600">Dokumen Pendukung</h3>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              id="fileUpload"
              onChange={(e) => setUploadedFile(e.target.files[0])}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            />
            <label htmlFor="fileUpload" className="cursor-pointer">
              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <i className="ri-file-line text-3xl text-green-500"></i>
                  <div className="text-left">
                    <p className="font-medium text-dark-600">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">File siap diupload</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setUploadedFile(null); }}
                    className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ) : (
                <>
                  <i className="ri-upload-cloud-2-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">Klik untuk upload atau drag & drop file</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</p>
                </>
              )}
            </label>
          </div>
        </Card>

        {/* Keterangan Perangkat */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="ri-server-line text-primary-600 text-xl"></i>
              <h3 className="font-bold text-dark-600">Keterangan Perangkat</h3>
            </div>
            <Badge variant="primary">{form.keterangan.length} Item</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama Barang</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Rak Asal</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Rak Tujuan</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Merk</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipe</th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Serial Number</th>
                  <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.keterangan.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        name="namaBarang"
                        value={item.namaBarang}
                        onChange={e => handleKeteranganChange(idx, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                        placeholder="Nama Barang"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name="rakAsal"
                        value={item.rakAsal}
                        onChange={e => handleKeteranganChange(idx, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                        placeholder="Rak Asal"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name="rakTujuan"
                        value={item.rakTujuan}
                        onChange={e => handleKeteranganChange(idx, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                        placeholder="Rak Tujuan"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name="merk"
                        value={item.merk}
                        onChange={e => handleKeteranganChange(idx, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                        placeholder="Merk"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name="tipe"
                        value={item.tipe}
                        onChange={e => handleKeteranganChange(idx, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                        placeholder="Tipe"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        name="serialNumber"
                        value={item.serialNumber}
                        onChange={e => handleKeteranganChange(idx, e)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-500"
                        placeholder="S/N"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {form.keterangan.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeKeterangan(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus baris"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={addKeterangan}
            className="mt-4 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Tambah Barang
          </button>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/mutasi-barang/list')}
            icon={<i className="ri-close-line"></i>}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            icon={<i className="ri-printer-line"></i>}
          >
            Cetak
          </Button>
          <Button
            type="submit"
            disabled={loading}
            icon={loading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
          >
            {loading ? 'Menyimpan...' : 'Simpan Data'}
          </Button>
        </div>
      </form>
    </div>
  );
}