import { useState, useEffect, useCallback } from 'react';

const globalCache = new Map<string, any>();
type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const clearDataCache = () => {
  globalCache.clear();
};

export const mutateData = (url: string) => {
  globalCache.delete(url);
  const urlListeners = listeners.get(url);
  if (urlListeners) {
    urlListeners.forEach(listener => listener());
  }
};

export function useDataFetch<T>(url: string, processData?: (data: any) => T, options?: RequestInit) {
  const cached = globalCache.get(url) as T | undefined;
  const [data, setData] = useState<T | null>(cached || null);
  const [loading, setLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    const listener = () => setTrigger(t => t + 1);
    if (!listeners.has(url)) {
      listeners.set(url, new Set());
    }
    listeners.get(url)!.add(listener);
    
    return () => {
      const urlListeners = listeners.get(url);
      if (urlListeners) {
        urlListeners.delete(listener);
      }
    };
  }, [url]);

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
  }, [url, trigger]);

  return { data, loading, setData };
}
