import { useState, useCallback } from 'react';
import { accessService } from '../services';

export const useAccess = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accessService.getLogs();
      setLogs(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPermitLogs = useCallback(async (permitId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await accessService.getPermitLogs(permitId);
      setLogs(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verify = useCallback(async (qrCodeData, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await accessService.verify(qrCodeData, otpCode);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkIn = useCallback(async (checkInData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await accessService.checkIn(checkInData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkOut = useCallback(async (permitId, location) => {
    setLoading(true);
    setError(null);
    try {
      const data = await accessService.checkOut(permitId, location);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    logs,
    loading,
    error,
    fetchLogs,
    fetchPermitLogs,
    verify,
    checkIn,
    checkOut,
  };
};

export default useAccess;
