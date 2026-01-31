import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import plnLogo from '../assets/pln-logo.webp';

const loadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            // Convert to PNG via canvas if needed (safest for PDF)
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
    });
};

export const generateMutasiPDF = async (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Load Logo
    try {
        const logoData = await loadImage(plnLogo);
        // Adjusted dimensions for PLN Icon Plus logo (approx 3:2 ratio or similar)
        // x=10, y=5, w=25, h=auto 
        doc.addImage(logoData, 'PNG', 10, 5, 25, 20);
    } catch (e) {
        console.error("Logo load error", e);
    }

    // HEADER (Kop Surat)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PT PLN ICON PLUS', pageWidth / 2, 12, { align: 'center' });

    doc.setFontSize(12);
    doc.text('STRATEGIC BUSINESS UNIT (SBU)', pageWidth / 2, 18, { align: 'center' });
    doc.text('REGIONAL JAWA BAGIAN TENGAH', pageWidth / 2, 24, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Jl. Setiabudi No. 96, Srondol Kulon, Banyumanik, Semarang, Jawa Tengah 50263', pageWidth / 2, 30, { align: 'center' });

    // Double Line Separator
    doc.setLineWidth(0.5);
    doc.line(10, 35, pageWidth - 10, 35);
    doc.setLineWidth(0.1);
    doc.line(10, 36, pageWidth - 10, 36);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('FORMULIR MUTASI BARANG', pageWidth / 2, 45, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 30, 46, pageWidth / 2 + 30, 46); // Underline title

    // Info Section
    let y = 60;
    const col1X = 14;
    const col1ValX = 50;

    const col2X = 110;
    const col2ValX = 150;

    const drawField = (label, value, xLabel, xValue, currentY) => {
        doc.setFont('helvetica', 'normal');
        doc.text(label, xLabel, currentY);
        // Align colon fixed distance from value start or label end
        // Let's use xValue - 5 for consistency so it's close to the value
        doc.text(':', xValue - 5, currentY);
        doc.setFont('helvetica', 'bold');
        doc.text(value || '-', xValue, currentY);
        doc.setFont('helvetica', 'normal');
    };

    // Row 1
    drawField('Nomor Mutasi', data.nomor, col1X, col1ValX, y);
    drawField('Tanggal', new Date(data.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), col2X, col2ValX, y);

    y += 8;
    // Row 2
    drawField('Pemohon', data.nama, col1X, col1ValX, y);
    drawField('Jabatan', data.jabatan, col2X, col2ValX, y);

    y += 8;
    // Row 3
    drawField('Perusahaan/Tim', data.teamPendamping ? data.teamPendamping.replace('_', ' ') : '-', col1X, col1ValX, y);
    drawField('Lokasi DC', (data.lokasi || '-').replace('_', ' '), col2X, col2ValX, y);

    y += 8;
    // Row 4
    drawField('Status', data.status, col1X, col1ValX, y);


    // Table Section
    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('DAFTAR PERANGKAT', col1X, y);

    const tableColumn = ["No", "Nama Barang", "Merk", "Tipe", "SN", "Rak Asal", "Rak Tujuan"];
    const tableRows = [];

    if (data.keterangan && data.keterangan.length > 0) {
        data.keterangan.forEach((item, index) => {
            const rowData = [
                index + 1,
                item.namaBarang,
                item.merk,
                item.tipe,
                item.serialNumber,
                item.rakAsal,
                item.rakTujuan
            ];
            tableRows.push(rowData);
        });
    }

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: y + 5,
        theme: 'grid',
        headStyles: {
            fillColor: [0, 163, 224], // PLN Blue approx
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            4: { fontStyle: 'italic' }, // SN
            5: { halign: 'center' },
            6: { halign: 'center' }
        }
    });

    // Signatures
    let finalY = doc.lastAutoTable.finalY + 20;

    // Check page break
    if (finalY > doc.internal.pageSize.height - 50) {
        doc.addPage();
        finalY = 40;
    }

    const signY = finalY;

    // Helper helpers
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Function to generate QR
    const generateQR = async (text) => {
        try {
            return await QRCode.toDataURL(text, { width: 100, margin: 1 });
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const drawDigitalSignature = async (x, title, name, date, roleLabel) => {
        doc.setFont('helvetica', 'normal');
        doc.text(title, x, signY, { align: 'center' });

        if (date) {
            // Generate QR Content
            const qrText = `Valid Signature\nSigned by: ${name}\nDate: ${date}\nRole: ${title}`;
            let qrDataUrl = null;
            try {
                qrDataUrl = await generateQR(qrText);
            } catch (e) { console.error('QR Error', e); }

            // Valid Digital Signature

            // QR Code Image
            if (qrDataUrl) {
                doc.addImage(qrDataUrl, 'PNG', x - 12.5, signY + 3, 25, 25);
            }

            // No Border (Clean look)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7); // Smaller font for label
            doc.setTextColor(0, 163, 224); // Keep blue text 
            doc.text(`DIGITALLY SIGNED`, x, signY + 32, { align: 'center' }); // Below QR

            doc.setFontSize(8);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold'); // Bold name
            doc.text(`${name || title}`, x, signY + 37, { align: 'center' });

            doc.setFontSize(6);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text(`${formatDateTime(date)}`, x, signY + 41, { align: 'center' });
            doc.setTextColor(0);
        } else {
            // Empty / Pending Placeholder
            doc.text('( ........................... )', x, signY + 25, { align: 'center' });
            doc.text(roleLabel || title, x, signY + 30, { align: 'center' });
        }
        doc.setFontSize(10); // Reset
    };

    // 1. Pemohon (Created By)
    await drawDigitalSignature(35, 'Pemohon', data.nama, data.createdAt, 'Staff / Personel');

    // 2. Mengetahui (PIC DC)
    const picName = data.pic ? (data.pic.fullName || data.pic.username) : 'Petugas DC';
    await drawDigitalSignature(pageWidth / 2, 'Mengetahui (DC)', picName, data.picApprovedAt, 'PIC Data Center');

    // 3. Menyetujui (Manager)
    const managerName = data.approvedByManager ? (data.approvedByManager.fullName || data.approvedByManager.username) : 'Manager';
    await drawDigitalSignature(pageWidth - 35, 'Menyetujui', managerName, data.managerApprovedAt, 'Manager');

    // Footer
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Dicetak dari Sistem Working Permit DC pada: ${today}`, 10, doc.internal.pageSize.height - 10);

    // Save
    doc.save(`MutasiBarang_${data.nomor || 'Draft'}.pdf`);
};
