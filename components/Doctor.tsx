'use client';

import React from 'react';
import styles from './Doctor.module.css'; // Import the CSS module

interface DoctorProps {
  doctor: {
    "Doctor Name": string;
    "Photo URL": string;
    Degree: string;
    Specialty: string;
    Designation: string;
    Workplace: string;
    About: string;
  };
}

const Doctor: React.FC<DoctorProps> = ({ doctor }) => {
  // Basic check for valid URL, replace with more robust validation if needed
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className={styles.doctorContainer}>
      <h2>{doctor["Doctor Name"]}</h2>
      {isValidUrl(doctor["Photo URL"]) ? (
        <img
          src={doctor["Photo URL"]}
          alt={doctor["Doctor Name"]}
          className={styles.doctorImage}
          // Add error handling for image loading if needed
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop if fallback fails
            target.src = '/placeholder-image.png'; // Provide a path to a placeholder image
            target.alt = 'Image not available';
          }}
        />
      ) : (
        <p>Photo not available</p> // Or display a placeholder image/icon
      )}
      <p><strong>Degree:</strong> {doctor.Degree}</p>
      <p><strong>Specialty:</strong> {doctor.Specialty}</p>
      <p><strong>Designation:</strong> {doctor.Designation}</p>
      <p><strong>Workplace:</strong> {doctor.Workplace}</p>
      <p><strong>About:</strong> {doctor.About}</p>
    </div>
  );
};

export default Doctor;
