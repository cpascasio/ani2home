import axios from "axios";
import { useState, useEffect } from "react";

const Sample = ({ token }) => {
  useEffect(() => {
    if (token) {
      fetchData(token);
    }
  }, [token]);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:5000/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(res.data);
  };

  return (
    <div>
      <h1>Sample Page</h1>
    </div>
  );
};

export default Sample;
