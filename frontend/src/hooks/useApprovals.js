import { useState, useCallback } from 'react';
import { approvalService } from '../services';

export const useApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPICPending = useCallback(async (picId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalService.getPICPending(picId);
      setApprovals(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagerPending = useCallback(async (managerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalService.getManagerPending(managerId);
      setApprovals(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const picReview = useCallback(async (approvalData, picId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalService.picReview(approvalData, picId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const managerApprove = useCallback(async (approvalData, managerId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalService.managerApprove(approvalData, managerId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByPermit = useCallback(async (permitId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await approvalService.getByPermit(permitId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    approvals,
    loading,
    error,
    fetchPICPending,
    fetchManagerPending,
    picReview,
    managerApprove,
    fetchByPermit,
  };
};

export default useApprovals;
