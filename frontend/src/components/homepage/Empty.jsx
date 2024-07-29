import React from 'react';
import PropTypes from 'prop-types';

const Empty = ({ height, backgroundColor }) => {
  return (
    <div
      style={{
        height: height || '420px', 
        backgroundColor: backgroundColor || '#F5F0EC', 
      }}
      className="w-full" 
    >
    </div>
  );
};

// Define prop types for validation
Empty.propTypes = {
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
};

export default Empty;
