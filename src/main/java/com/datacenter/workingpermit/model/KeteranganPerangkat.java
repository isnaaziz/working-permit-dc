package com.datacenter.workingpermit.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class KeteranganPerangkat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String namaBarang;
    private String rakAsal;
    private String rakTujuan;
    private String merk;
    private String tipe;
    private String serialNumber;
}
