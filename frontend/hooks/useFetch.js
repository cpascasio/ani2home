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

        // Get user token from localStorage
        const storedUser = localStorage.getItem("user");
        let headers = {
          "Content-Type": "application/json",
        };

        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user && user.token) {
              headers["Authorization"] = `Bearer ${user.token}`;
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
          }
        }

        const response = await fetch(`http://localhost:3000${url}`, {
          headers,
        });

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
        console.error("Fetch error:", e);
        if (isMounted) {
          setLoading(false);
          setError(true);
        }
      }
    };

    if (url) {
      fetchData();
    }

    return () => {
      isMounted = false; // Cleanup function to set isMounted to false
    };
  }, [url]);

  return { loading, error, data };
};

export default useFetch;
