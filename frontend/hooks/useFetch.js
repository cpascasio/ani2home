import { useEffect, useState } from "react";

const useFetch = (url) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        let isMounted = true; // Track if the component is mounted

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(false); // Reset error state before fetching
                const response = await fetch(`http://localhost:3000${url}`);
                const consume = await response.json();
                if (!response.ok) {
                    if (isMounted) {
                        setLoading(false);
                        setError(true);
                    }
                    return;
                }
                if (isMounted) {
                    setLoading(false);
                    setData(consume);
                }
            } catch (e) {
                if (isMounted) {
                    setLoading(false);
                    setError(true);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false; // Cleanup function to set isMounted to false
        };
    }, [url]);

    return { loading, error, data };
};

export default useFetch;