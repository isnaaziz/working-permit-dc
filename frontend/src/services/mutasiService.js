import api from './api';

const mutasiService = {
  async createMutasiBarang(data) {
    return api.post('/mutasi-barang', data);
  },
  async getAll() {
    return api.get('/mutasi-barang');
  },
  async getById(id) {
    return api.get(`/mutasi-barang/${id}`);
  },
  async update(id, data) {
    return api.put(`/mutasi-barang/${id}`, data);
  },
  async remove(id) {
    return api.delete(`/mutasi-barang/${id}`);
  },
};

export default mutasiService;
