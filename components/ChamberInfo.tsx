'use client';

'use client';

import React, { useState, useEffect } from 'react';

interface Chamber {
  name: string;
  address: string;
  // Add more fields as needed
}

const ChamberInfo = () => {
  const [chambers, setChambers] = useState<Chamber[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/chambers');
      const data: Chamber[] = await response.json();
      setChambers(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Chamber Information</h1>
      {chambers.map((chamber, index) => (
        <div key={index}>
          <h2>{chamber.name}</h2>
          <p>Address: {chamber.address}</p>
          {/* Add more fields as needed */}
        </div>
      ))}
    </div>
  );
};

export default ChamberInfo;
