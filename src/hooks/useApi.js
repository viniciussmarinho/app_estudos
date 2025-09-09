// src/hooks/useApi.js
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

export const useApiMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      return { 
        success: false, 
        error: err.response?.data?.detail || 'Erro na operação' 
      };
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};