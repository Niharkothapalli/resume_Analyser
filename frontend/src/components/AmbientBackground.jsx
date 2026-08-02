import React from 'react';

export default function AmbientBackground() {
  return (
    <>
      <div className="ambient-light" aria-hidden="true">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>
      <div className="noise" aria-hidden="true"></div>
    </>
  );
}
