'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import styles from './HomePage.module.css';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';
import ErrorBoundary from '../components/ErrorBoundary';

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string;
  Degree: string;
  Specialty: string;
  Designation: string;
  Workplace: string;
  About: string;
}

const getRandomDoctors = (doctors: Doctor[], count: number) => {
  const shuffled = [...doctors].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

function HomePageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlSpecialty = searchParams.get('specialty');
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState(urlSpecialty || 'All');
  const [specialties, setSpecialties] = useState<string[]>(['All']);
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Update selected specialty when URL changes
  useEffect(() => {
    if (urlSpecialty) {
      setSelectedSpecialty(urlSpecialty);
      setCurrentPage(1);
    }
  }, [urlSpecialty]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First fetch all doctors to get complete specialties list
      const allDoctorsResponse = await fetch('/api/doctors', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!allDoctorsResponse.ok) {
        const errorData = await allDoctorsResponse.json();
        throw new Error(errorData.error || 'Failed to fetch doctors');
      }

      const allDoctorsData = await allDoctorsResponse.json();
      const uniqueSpecialties = ['All', ...new Set(allDoctorsData.doctors.map((doc: Doctor) => doc.Specialty))].sort() as string[];
      setSpecialties(uniqueSpecialties);

      // Then fetch filtered doctors if a specialty is selected
      const queryParams = new URLSearchParams();
      if (selectedSpecialty !== 'All') {
        queryParams.set('specialty', selectedSpecialty);
      }
      queryParams.set('page', currentPage.toString());
      queryParams.set('pageSize', itemsPerPage.toString());

      const filteredResponse = await fetch(`/api/doctors?${queryParams.toString()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!filteredResponse.ok) {
        const errorData = await filteredResponse.json();
        throw new Error(errorData.error || 'Failed to fetch doctors');
      }

      const data = await filteredResponse.json();
      
      if (!data.doctors || !Array.isArray(data.doctors)) {
        throw new Error('Invalid data format received from server');
      }

      setDoctors(data.doctors);
      setTotalPages(data.totalPages);

      // Set featured doctors only when on the first page and specialty is 'All'
      if (currentPage === 1 && selectedSpecialty === 'All') {
        setFeaturedDoctors(getRandomDoctors(allDoctorsData.doctors, 10));
      } else {
        setFeaturedDoctors([]);
      }

      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
      setError(errorMessage);

      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 1000 * Math.pow(2, retryCount));
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedSpecialty, retryCount]);

  // Effect for initial data fetch and cleanup
  useEffect(() => {
    // Reset states when component mounts
    setDoctors([]);
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setSelectedSpecialty(urlSpecialty || 'All');
    setFeaturedDoctors([]);
    setCurrentPage(1);
    setTotalPages(1);
    
    // Fetch fresh data
    fetchData();

    // Cleanup function
    return () => {
      setDoctors([]);
      setLoading(false);
      setError(null);
      setRetryCount(0);
      setFeaturedDoctors([]);
    };
  }, [fetchData, urlSpecialty]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setCurrentPage(1);
  };

  const isHomePage = pathname === '/';

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
    <div className={styles.container}>
      <h1 className={styles.title}>Find Your Doctor</h1>
      
      {isHomePage && featuredDoctors.length > 0 && (
        <section className={styles.featuredSection}>
          <h2>Featured Doctors</h2>
          <div className={styles.featuredGrid}>
            {featuredDoctors.map((doctor) => (
              <Link 
                href={`/${encodeURIComponent(doctor["Doctor Name"])}`}
                key={`featured-${doctor["Doctor Name"]}`}
                className={styles.featuredDoctorCard}
              >
                <div className={styles.featuredDoctorImage}>
                  {isValidUrl(doctor["Photo URL"]) ? (
                    <img
                      src={doctor["Photo URL"]}
                      alt={doctor["Doctor Name"]}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-image.png';
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="/placeholder-image.png"
                      alt="Doctor photo not available"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className={styles.featuredDoctorInfo}>
                  <h3>{doctor["Doctor Name"]}</h3>
                  <p>{doctor.Specialty}</p>
                  <p>{doctor.Designation}</p>
                  <p className={styles.workplace}>{doctor.Workplace}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <h2>Find Doctors by Specialty</h2>
        </div>
        <div className={styles.filterContainer}>
          <select
            id="specialty"
            value={selectedSpecialty}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className={styles.specialtySelect}
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : (
        <>
          <div className={styles.doctorsGrid}>
            {doctors.map((doctor) => (
              <Link
                href={`/${encodeURIComponent(doctor["Doctor Name"])}`}
                key={`doctor-${doctor["Doctor Name"]}`}
                className={styles.doctorCard}
              >
                <div className={styles.doctorCardImage}>
                  {isValidUrl(doctor["Photo URL"]) ? (
                    <img
                      src={doctor["Photo URL"]}
                      alt={doctor["Doctor Name"]}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/placeholder-image.png';
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="/placeholder-image.png"
                      alt="Doctor photo not available"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className={styles.doctorCardInfo}>
                  <h3>{doctor["Doctor Name"]}</h3>
                  <p className={styles.specialty}>{doctor.Specialty}</p>
                  <p className={styles.designation}>{doctor.Designation}</p>
                  <p className={styles.workplace}>{doctor.Workplace}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={styles.pageButton}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`${styles.pageButton} ${
                    currentPage === pageNum ? styles.activePage : ''
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  // Add a random key to force component remount when navigating back
  const randomKey = Math.random();
  
  return (
    <ErrorBoundary>
      <HomePageContent key={randomKey} />
    </ErrorBoundary>
  );
}
