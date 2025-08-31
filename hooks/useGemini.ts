import { useState, useCallback } from 'react';

export const useGemini = <T extends any[], U>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<U | null>(null);

  const execute = useCallback(async (executor: (...args: T) => Promise<U>, ...args: T) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await executor(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
};