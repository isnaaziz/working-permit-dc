import { useState, useCallback } from 'react';
import { permitService } from '../services';

export const usePermits = () => {
  const [permits, setPermits] = useState([]);
  const [permit, setPermit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.getAll();
      setPermits(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.getById(id);
      setPermit(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByVisitor = useCallback(async (visitorId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.getByVisitor(visitorId);
      setPermits(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByPIC = useCallback(async (picId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.getByPIC(picId);
      setPermits(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.getByStatus(status);
      setPermits(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (permitData, visitorId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.create(permitData, visitorId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id, permitData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.update(id, permitData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.cancel(id, reason);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerateOTP = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await permitService.regenerateOTP(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permits,
    permit,
    loading,
    error,
    fetchAll,
    fetchById,
    fetchByVisitor,
    fetchByPIC,
    fetchByStatus,
    create,
    update,
    cancel,
    regenerateOTP,
  };
};

export default usePermits;
