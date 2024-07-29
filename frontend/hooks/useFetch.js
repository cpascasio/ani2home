import { useEffect, useState } from "react";

const useFetch = (url) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:3000${url}`
                );
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
    }, [url]);
    return { loading, error, data };
};








    /*
    const useFetch = (url) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${import.meta.env.VITE_BASE_URL}${url}`,
                    {
                        method: "POST",
                        body: JSON.stringify(data),
                    }
                );
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
        
    }, [url]);
    return { loading, error, data };
};


    */


export default useFetch;
