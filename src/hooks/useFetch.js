import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust data-fetching hook.
 * - Stores fetchFn in a ref so the effect never runs stale closures.
 * - Cancels in-flight state updates when the component unmounts
 *   (fixes the "no data on navigation" race condition with AnimatePresence).
 */
const useFetch = (fetchFn) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Always keep the latest fetchFn without re-running the effect
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchFnRef.current();
        if (!cancelled) setData(res.data.data ?? res.data ?? null);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    // Cleanup: mark as cancelled so no state updates fire after unmount
    return () => { cancelled = true; };
  }, []); // runs once per mount — fetchFnRef keeps it current

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFnRef.current();
      setData(res.data.data ?? res.data ?? null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, refetch };
};

export default useFetch;
