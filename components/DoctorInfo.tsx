'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './DoctorInfo.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loading from './Loading';

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string;
  Degree: string;
  Specialty: string;
  Designation: string;
  Workplace: string;
  About: string;
}

interface DoctorInfoProps {
  doctor: Doctor;
}

const DoctorInfo: React.FC<DoctorInfoProps> = ({ doctor }) => {
  const router = useRouter();
  const [similarDoctors, setSimilarDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSimilarDoctors = useCallback(async () => {
    if (!doctor?.Specialty) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/doctors?specialty=${encodeURIComponent(doctor.Specialty)}`, {
        signal: AbortSignal.timeout(8000), // 8 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unable to fetch similar doctors');
      }

      const data = await response.json();
      
      if (!data || !data.doctors || !Array.isArray(data.doctors)) {
        throw new Error('Invalid response format');
      }

      const filtered = data.doctors
        .filter((d: Doctor) => d["Doctor Name"] !== doctor["Doctor Name"])
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
        
      setSimilarDoctors(filtered);
    } catch (error) {
      console.error('Error fetching similar doctors:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timed out while fetching similar doctors.');
        } else {
          setError(error.message);
        }
      } else {
        setError('An unexpected error occurred while loading similar doctors.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [doctor?.Specialty, doctor?.["Doctor Name"]]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSimilarDoctors();
    return () => controller.abort();
  }, [fetchSimilarDoctors]);

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

  if (!doctor) {
    return (
      <div className={styles.errorContainer}>
        <h2>Doctor Information Not Available</h2>
        <button 
          onClick={() => router.push('/')}
          className={styles.backButton}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className={styles.doctorInfoContainer}>
      <h1 className={styles.pageTitle}>
        Dr. {doctor["Doctor Name"]} - {doctor.Specialty} Specialist
      </h1>

      <div className={styles.mainContent}>
        <div className={styles.profileHeader}>
          <div className={styles.imageContainer}>
            {isValidUrl(doctor["Photo URL"]) ? (
              <img
                src={doctor["Photo URL"]}
                alt={doctor["Doctor Name"]}
                className={styles.doctorImage}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/placeholder-image.png';
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

          <div className={styles.doctorDetails}>
            <h2 className={styles.doctorName}>{doctor["Doctor Name"]}</h2>
            <div className={styles.credentials}>
              <p className={styles.specialty}>{doctor.Specialty}</p>
              <p className={styles.designation}>{doctor.Designation}</p>
              <p className={styles.workplace}>{doctor.Workplace}</p>
            </div>
            <div className={styles.degree}>
              <h3>Degrees & Certifications</h3>
              <p>{doctor.Degree}</p>
            </div>
          </div>
        </div>

        <div className={styles.aboutSection}>
          <h3>About Dr. {doctor["Doctor Name"]}</h3>
          <p>{doctor.About}</p>
        </div>

        <div className={styles.similarDoctors}>
          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className={styles.errorMessage}>
              <p>{error}</p>
              <button 
                onClick={() => fetchSimilarDoctors()}
                className={styles.retryButton}
              >
                Retry Loading Similar Doctors
              </button>
            </div>
          ) : similarDoctors.length > 0 ? (
            <>
              <h3>Similar {doctor.Specialty} Specialists</h3>
              <div className={styles.similarDoctorsGrid}>
                {similarDoctors.map((similarDoctor) => (
                  <Link
                    href={`/${encodeURIComponent(similarDoctor["Doctor Name"])}`}
                    key={similarDoctor["Doctor Name"]}
                    className={styles.similarDoctorCard}
                    onClick={() => {
                      setSimilarDoctors([]);
                      setError(null);
                    }}
                  >
                    <div className={styles.cardImage}>
                      {isValidUrl(similarDoctor["Photo URL"]) ? (
                        <img
                          src={similarDoctor["Photo URL"]}
                          alt={similarDoctor["Doctor Name"]}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/placeholder-image.png';
                          }}
                        />
                      ) : (
                        <img
                          src="/placeholder-image.png"
                          alt="Doctor photo not available"
                        />
                      )}
                    </div>
                    <div className={styles.cardInfo}>
                      <h4>{similarDoctor["Doctor Name"]}</h4>
                      <p>{similarDoctor.Designation}</p>
                      <p className={styles.workplaceInfo}>{similarDoctor.Workplace}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DoctorInfo;
