package com.datacenter.workingpermit.controller;

import com.datacenter.workingpermit.model.MutasiBarang;
import com.datacenter.workingpermit.repository.MutasiBarangRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mutasi-barang")
public class MutasiBarangController {
    @Autowired
    private MutasiBarangRepository mutasiBarangRepository;

    @PostMapping
    public ResponseEntity<?> createMutasiBarang(@RequestBody MutasiBarang mutasiBarang) {
        MutasiBarang saved = mutasiBarangRepository.save(mutasiBarang);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> getAllMutasiBarang() {
        return ResponseEntity.ok(mutasiBarangRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMutasiBarangById(@PathVariable Long id) {
        return mutasiBarangRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMutasiBarang(@PathVariable Long id, @RequestBody MutasiBarang mutasiBarang) {
        return mutasiBarangRepository.findById(id)
                .map(existing -> {
                    mutasiBarang.setId(id);
                    MutasiBarang updated = mutasiBarangRepository.save(mutasiBarang);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMutasiBarang(@PathVariable Long id) {
        if (!mutasiBarangRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        mutasiBarangRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
