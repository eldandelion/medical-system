import { useState, useEffect } from 'react';

const globalCache = new Map<string, any>();

export function useDataFetch<T>(url: string, processData?: (data: any) => T, options?: RequestInit) {
  const cached = globalCache.get(url) as T | undefined;
  const [data, setData] = useState<T | null>(cached || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(rawData => {
        if (active) {
          const finalData = processData ? processData(rawData) : rawData;
          globalCache.set(url, finalData);
          setData(finalData);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          console.error(`Failed to fetch ${url}:`, err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [url]);

  return { data, loading, setData };
}
