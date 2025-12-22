import React from 'react';

const Skeleton = ({ className = '' }) => {
  return <div className={`animate-pulse rounded-xl bg-bg-elevated ${className}`} />;
};

export default Skeleton;
