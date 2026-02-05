# 📐 Panduan Import PlantUML ke Draw.io

## 🎯 Metode 1: Export ke Gambar (Paling Mudah)

### Dari VS Code:
1. **Install Extension PlantUML** (jika belum)
   - Buka Extensions (`Cmd+Shift+X`)
   - Cari "PlantUML" by jebbs
   - Install

2. **Preview Diagram**
   - Buka file `.plantuml`
   - Tekan `Alt + D` atau `Option + D` (Mac)
   - Atau klik kanan → "Preview Current Diagram"

3. **Export Diagram**
   - Klik kanan pada preview
   - Pilih **"Export Current Diagram"**
   - Pilih format:
     - **SVG** - Terbaik (vector, scalable, tidak pecah)
     - **PNG** - Alternatif (raster, resolusi tetap)
     - **PDF** - Untuk dokumen
   - Pilih lokasi simpan

4. **Import ke Draw.io**
   - Buka https://app.diagrams.net
   - **File** → **Import from** → **Device**
   - Pilih file SVG/PNG
   - Atau **drag & drop** file ke canvas

---

## 🎯 Metode 2: PlantUML Plugin di Draw.io

### Setup Plugin:
1. Buka Draw.io (https://app.diagrams.net)
2. Klik **Extras** → **Plugins**
3. Klik **Add**
4. Paste URL plugin PlantUML:
   ```
   https://jgraph.github.io/drawio-tools/tools/plantUML.js
   ```
5. Klik **Apply**
6. **Reload** halaman

### Cara Pakai:
1. Klik **Arrange** → **Insert** → **Advanced** → **PlantUML**
2. Copy-paste kode dari file `.plantuml`
3. Klik **Insert PlantUML**
4. Diagram akan muncul di canvas

### Keuntungan:
- ✅ Bisa edit langsung di Draw.io
- ✅ Otomatis update saat code berubah
- ✅ Tetap editable

### Kekurangan:
- ❌ Butuh koneksi internet
- ❌ Agak lambat untuk diagram besar

---

## 🎯 Metode 3: Online PlantUML Renderer

### Via PlantUML Server:
1. Buka: http://www.plantuml.com/plantuml/uml/
2. Copy isi file `.plantuml`
3. Paste ke editor
4. Klik **Submit**
5. Klik kanan pada gambar → **Save Image As**
6. Save sebagai PNG/SVG
7. Import ke Draw.io

### Via PlantText:
1. Buka: https://www.planttext.com/
2. Paste kode PlantUML
3. Diagram akan auto-generate
4. Download PNG/SVG
5. Import ke Draw.io

---

## 🎯 Metode 4: Command Line (Batch Export)

### Install PlantUML:
```bash
# macOS
brew install plantuml

# atau download JAR
brew install graphviz  # dependency
wget https://github.com/plantuml/plantuml/releases/download/v1.2024.0/plantuml.jar
```

### Export Single File:
```bash
# Export ke PNG
plantuml -tpng 01-login-register.plantuml

# Export ke SVG (lebih bagus)
plantuml -tsvg 01-login-register.plantuml

# Export dengan resolusi tinggi
plantuml -tpng -Sresolution=300 01-login-register.plantuml
```

### Export Semua File Sekaligus:
```bash
# Gunakan script yang sudah dibuat
chmod +x export-all.sh
./export-all.sh
```

File hasil export akan ada di:
- `exports/png/` - File PNG
- `exports/svg/` - File SVG

### Import ke Draw.io:
1. Buka Draw.io
2. **File** → **Import from** → **Device**
3. Select multiple files (Shift+Click)
4. Atau drag & drop semua file sekaligus

---

## 🎯 Metode 5: Konversi ke Draw.io Native Format

### Gunakan Online Converter:
1. Buka: https://products.aspose.app/diagram/conversion/vsd-to-vsdx
2. Upload file SVG hasil export PlantUML
3. Convert ke format Draw.io (XML)
4. Download hasil convert
5. Open di Draw.io

**Note**: Hasilnya mungkin perlu adjustment manual

---

## 📊 Perbandingan Metode

| Metode | Kelebihan | Kekurangan | Rekomendasi |
|--------|-----------|------------|-------------|
| **Export SVG** | ✅ Kualitas terbaik<br>✅ Scalable<br>✅ Cepat | ❌ Tidak bisa edit | ⭐⭐⭐⭐⭐ |
| **Plugin Draw.io** | ✅ Bisa edit<br>✅ Terintegrasi | ❌ Butuh internet<br>❌ Lambat | ⭐⭐⭐ |
| **Online Renderer** | ✅ Tidak butuh install<br>✅ Mudah | ❌ Butuh internet<br>❌ Manual | ⭐⭐⭐ |
| **Command Line** | ✅ Batch export<br>✅ Otomatis | ❌ Butuh setup | ⭐⭐⭐⭐ |

---

## 🎨 Tips Hasil Terbaik

### 1. **Format SVG** (Paling Direkomendasikan)
```bash
plantuml -tsvg *.plantuml
```
- Vector graphic (tidak pecah saat zoom)
- File size kecil
- Bisa di-scale tanpa loss quality

### 2. **PNG dengan Resolusi Tinggi**
```bash
plantuml -tpng -Sresolution=300 *.plantuml
```
- Resolusi 300 DPI untuk print quality
- Cocok untuk dokumen/presentasi

### 3. **Export dengan Transparent Background**
```bash
plantuml -tpng -transparent *.plantuml
```
- Background transparan
- Bagus untuk overlay di document

### 4. **Custom Skin/Theme**
Tambahkan di awal file `.plantuml`:
```plantuml
@startuml
!theme aws-orange
' atau
skinparam backgroundColor transparent
skinparam handwritten true
' kode diagram...
@enduml
```

---

## 🔧 Troubleshooting

### **Diagram tidak muncul saat export**
- Pastikan syntax PlantUML benar
- Check preview dulu dengan `Alt+D`
- Pastikan ada `@startuml` dan `@enduml`

### **Gambar pecah/buram**
- Gunakan SVG bukan PNG
- Atau export PNG dengan resolusi tinggi

### **Plugin Draw.io tidak muncul**
- Reload halaman setelah install plugin
- Clear cache browser
- Coba browser berbeda

### **Command line error**
```bash
# Install dependencies
brew install graphviz
brew install plantuml
```

---

## 📝 Quick Reference

### Export All Diagrams to SVG:
```bash
cd docs/activity-diagrams
plantuml -tsvg *.plantuml -o exports/svg
```

### Export All to PNG (High-Res):
```bash
cd docs/activity-diagrams
plantuml -tpng -Sresolution=300 *.plantuml -o exports/png
```

### Import ke Draw.io:
1. Buka https://app.diagrams.net
2. Drag & drop semua SVG files
3. Arrange sesuai kebutuhan
4. Save as `.drawio` file

---

## 🎬 Video Tutorial

Untuk tutorial visual, lihat:
- PlantUML Export: https://plantuml.com/export
- Draw.io Import: https://www.drawio.com/doc/

---

**💡 Rekomendasi Terbaik:**
Gunakan **Metode 1 (Export SVG)** untuk hasil terbaik dan paling praktis!
