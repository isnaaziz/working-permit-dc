#!/bin/bash

# Script untuk export semua PlantUML ke PNG dan SVG
# Butuh PlantUML terinstall: brew install plantuml

echo "🚀 Mulai export PlantUML diagrams..."

# Buat folder output
mkdir -p exports/png
mkdir -p exports/svg

# Export semua .plantuml files
for file in *.plantuml; do
    if [ -f "$file" ]; then
        filename="${file%.plantuml}"
        echo "📊 Processing: $filename"
        
        # Export ke PNG
        plantuml -tpng "$file" -o exports/png
        
        # Export ke SVG
        plantuml -tsvg "$file" -o exports/svg
        
        echo "   ✅ PNG: exports/png/$filename.png"
        echo "   ✅ SVG: exports/svg/$filename.svg"
    fi
done

echo "🎉 Selesai! Semua diagram berhasil di-export"
echo "📁 PNG files: $(pwd)/exports/png/"
echo "📁 SVG files: $(pwd)/exports/svg/"
