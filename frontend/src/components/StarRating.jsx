import React from 'react';

const Star = ({ filled, onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={`h-8 w-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
    onClick={onClick}
    fill="currentColor"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
    />
  </svg>
);

export default Star;
