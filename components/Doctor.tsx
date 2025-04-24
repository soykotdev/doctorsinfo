'use client';

import React from 'react';
import styles from './Doctor.module.css';

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
  featured?: boolean;
}

const Doctor: React.FC<DoctorProps> = ({ doctor, featured = false }) => {
  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      // Check for common image extensions
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(parsed.pathname);
    } catch (_) {
      return false;
    }
  };

  return (
    <div className={styles.doctorContainer}>
      <div className={styles.doctorHeader}>
        <div className={styles.doctorImageWrapper}>
          {isValidUrl(doctor["Photo URL"]) ? (
            <img
              src={doctor["Photo URL"]}
              alt={doctor["Doctor Name"]}
              className={styles.doctorImage}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder-image.png';
                target.alt = 'Image not available';
              }}
            />
          ) : (
            <img
              src="/placeholder-image.png"
              alt="Doctor photo not available"
              className={styles.doctorImage}
            />
          )}
        </div>
        
        <div className={styles.doctorInfo}>
          <h2 className={styles.doctorName}>{doctor["Doctor Name"]}</h2>
          <h3 className={styles.doctorSpecialty}>{doctor.Specialty}</h3>
        </div>
      </div>

      <div className={styles.infoGrid}>
        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Designation</div>
          <div className={styles.infoValue}>{doctor.Designation}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Workplace</div>
          <div className={styles.infoValue}>{doctor.Workplace}</div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoLabel}>Degrees & Certifications</div>
          <div className={styles.infoValue}>{doctor.Degree}</div>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h4 className={styles.aboutHeading}>About {doctor["Doctor Name"]}</h4>
        <p className={styles.aboutText}>{doctor.About}</p>
      </div>
    </div>
  );
};

export default Doctor;
