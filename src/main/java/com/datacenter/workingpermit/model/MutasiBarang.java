package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
public class MutasiBarang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nomor;
    private String tanggal;
    private String nama;
    private String jabatan;
    private String email;
    private String telepon;
    private String lokasi;
    private String statusMutasi;
    private String tandaTanganDC;
    private String tandaTanganPersonel;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "mutasi_barang_id")
    private List<KeteranganPerangkat> keterangan;
}
