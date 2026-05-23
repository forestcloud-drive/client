import React from 'react';

export const TabSelector = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex border-b border-green-200 relative">{children}</div>
    </>
  );
};
