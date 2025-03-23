import { useEffect, useState } from "react";

const useDynamicFetch = (url, refetch) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000${url}`);
        const consume = await response.json();
        if (!response.ok) {
          setLoading(false);
          setError(true);
          return;
        }
        setLoading(false);
        setData(consume);
      } catch (e) {
        setLoading(false);
        setError(true);
      }
    };
    fetchData();
  }, [url, refetch]);
  return { loading, error, data };
};

export default useDynamicFetch;
