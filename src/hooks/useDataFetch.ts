import { useState, useEffect } from 'react';

const globalCache = new Map<string, any>();

export const clearDataCache = () => {
  globalCache.clear();
};

export function useDataFetch<T>(url: string, processData?: (data: any) => T, options?: RequestInit) {
  const cached = globalCache.get(url) as T | undefined;
  const [data, setData] = useState<T | null>(cached || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchUrl = url.startsWith('/') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;
    fetch(fetchUrl, options)
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
