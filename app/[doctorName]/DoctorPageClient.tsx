'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DoctorInfo from '@/components/DoctorInfo';
import Loading from '@/components/Loading';
import ErrorDisplay from '@/components/ErrorDisplay';
import styles from './page.module.css';

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string;
  Degree: string;
  Specialty: string;
  Designation: string;
  Workplace: string;
  About: string;
}

interface DoctorPageClientProps {
  doctorName: string;
}

export default function DoctorPageClient({ doctorName }: DoctorPageClientProps) {
  const router = useRouter();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/doctors?name=${encodeURIComponent(doctorName)}`, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch doctor information');
      }

      if (!data.doctors || !Array.isArray(data.doctors) || data.doctors.length === 0) {
        throw new Error('We couldn\'t find the doctor you\'re looking for. Please check the name and try again.');
      }

      setDoctor(data.doctors[0]);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching doctor data:', err);
      let errorMessage = 'We\'re having technical difficulties. Please try again later.';

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);

      if (retryCount < maxRetries) {
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchData(), backoffDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [doctorName, retryCount, maxRetries]);

  useEffect(() => {
    fetchData();
    
    return () => {
      // Cleanup
      setDoctor(null);
      setError(null);
    };
  }, [fetchData]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Unable to Load Doctor Information</h2>
        <p>{error}</p>
        {retryCount >= maxRetries ? (
          <>
            <p className={styles.retryMessage}>
              We've tried multiple times but couldn't load the information.
              You can try again or return to the home page.
            </p>
            <div className={styles.buttonGroup}>
              <button 
                onClick={() => {
                  setRetryCount(0);
                  fetchData();
                }}
                className={styles.retryButton}
              >
                Try Again
              </button>
              <button 
                onClick={() => router.push('/')}
                className={styles.backButton}
              >
                Return to Home
              </button>
            </div>
          </>
        ) : (
          <p className={styles.retryMessage}>
            Attempting to reconnect... ({retryCount + 1} of {maxRetries})
          </p>
        )}
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className={styles.errorContainer}>
        <h2>Doctor Not Found</h2>
        <p>We couldn't find the doctor you're looking for in our database.</p>
        <div className={styles.buttonGroup}>
          <button 
            onClick={() => router.push('/')}
            className={styles.backButton}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <DoctorInfo doctor={doctor} />
    </div>
  );
}