'use client';

'use client';

import React, { useState, useEffect } from 'react';

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string;
  Degree: string;
  Specialty: string;
  Designation: string;
  Workplace: string;
  About: string;
}

const DoctorInfo = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/doctors');
      const data: Doctor[] = await response.json();
      setDoctors(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Doctor Information</h1>
      {doctors.map((doctor, index) => (
        <div key={index}>
          <h2>{doctor["Doctor Name"]}</h2>
          <img src={doctor["Photo URL"]} alt={doctor["Doctor Name"]} />
          <p>Degree: {doctor.Degree}</p>
          <p>Specialty: {doctor.Specialty}</p>
          <p>Designation: {doctor.Designation}</p>
          <p>Workplace: {doctor.Workplace}</p>
          <p>About: {doctor.About}</p>
        </div>
      ))}
    </div>
  );
};

export default DoctorInfo;
