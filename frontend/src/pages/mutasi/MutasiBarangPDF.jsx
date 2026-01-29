import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import mutasiService from '../../services/mutasiService';
import jsPDF from 'jspdf';

export default function MutasiBarangPDF() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    mutasiService.getById(id).then(setData);
  }, [id]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Formulir Mutasi Barang', 10, 10);
    doc.text(`Nomor: ${data.nomor || ''}`, 10, 20);
    doc.text(`Tanggal: ${data.tanggal || ''}`, 10, 30);
    doc.text(`Nama: ${data.nama || ''}`, 10, 40);
    doc.text(`Jabatan: ${data.jabatan || ''}`, 10, 50);
    doc.text(`Email: ${data.email || ''}`, 10, 60);
    doc.text(`Telepon: ${data.telepon || ''}`, 10, 70);
    doc.text(`Lokasi: ${data.lokasi || ''}`, 10, 80);
    doc.text(`Status Mutasi: ${data.statusMutasi || ''}`, 10, 90);
    doc.text('Keterangan Perangkat:', 10, 100);
    let y = 110;
    data.keterangan.forEach((item, idx) => {
      doc.text(`${idx + 1}. ${item.namaBarang} | ${item.rakAsal} | ${item.rakTujuan} | ${item.merk} | ${item.tipe} | ${item.serialNumber}`, 10, y);
      y += 10;
    });
    doc.text(`Tanda Tangan DC: ${data.tandaTanganDC || ''}`, 10, y + 10);
    doc.text(`Tanda Tangan Personel: ${data.tandaTanganPersonel || ''}`, 10, y + 20);
    doc.save(`mutasi-barang-${data.nomor || id}.pdf`);
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Export PDF Mutasi Barang</h2>
      <button className="btn" onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
}
