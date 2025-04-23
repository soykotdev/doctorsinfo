'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import Link from 'next/link';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import styles from './HomePage.module.css'; // Import home page styles

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string; // Need Photo URL for the grid
  Designation: string; // Need Designation for the grid
  Specialty: string; // Keep specialty if needed elsewhere, or remove if only for grid
}

// Helper function to shuffle an array (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  const newArray = [...array]; // Create a copy

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [newArray[currentIndex], newArray[randomIndex]] = [
      newArray[randomIndex], newArray[currentIndex]];
  }

  return newArray;
}

// Wrap the main component logic in a new component to use Suspense
function HomePageContent() {
  const searchParams = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || 'All'; // Get specialty from URL or default to 'All'

  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]); // Store all fetched doctors
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]); // Store doctors to display
  const [specialties, setSpecialties] = useState<string[]>([]); // Store unique specialties
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(initialSpecialty); // Initialize with URL param
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error(`Failed to fetch doctors: ${response.statusText}`);
        }
        const data: Doctor[] = await response.json();

        setAllDoctors(data); // Store all doctors

        // Extract unique specialties
        const uniqueSpecialties = ['All', ...new Set(data.map(doc => doc.Specialty).filter(Boolean))];
        setSpecialties(uniqueSpecialties);

        // Initial filter based on selectedSpecialty (which might come from URL)
        if (selectedSpecialty === 'All') {
          const shuffledDoctors = shuffleArray(data);
          setFilteredDoctors(shuffledDoctors.slice(0, 10));
        } else {
          const filtered = data.filter(doc => doc.Specialty === selectedSpecialty);
          setFilteredDoctors(filtered);
        }

      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Effect to filter doctors when selectedSpecialty changes (triggered by dropdown or URL change)
  useEffect(() => {
    // No need to re-fetch, just filter the existing allDoctors list
    if (!loading) { // Only filter after initial data load
        if (selectedSpecialty === 'All') {
          // Reshuffle and take first 10 when 'All' is selected
          const shuffledDoctors = shuffleArray(allDoctors);
          setFilteredDoctors(shuffledDoctors.slice(0, 10));
        } else {
          const filtered = allDoctors.filter(doc => doc.Specialty === selectedSpecialty);
          setFilteredDoctors(filtered);
        }
    }
  }, [selectedSpecialty, allDoctors, loading]); // Re-run when filter, data, or loading state changes

    // Effect to update selectedSpecialty state if URL query param changes
  useEffect(() => {
    const currentSpecialty = searchParams.get('specialty') || 'All';
    if (currentSpecialty !== selectedSpecialty) {
        setSelectedSpecialty(currentSpecialty);
    }
  }, [searchParams, selectedSpecialty]);


  // Function to create a URL-friendly slug from the doctor's name
  const createSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  // Basic check for valid URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (loading) {
    return <main className={styles.pageContainer}><h1>Loading Doctors...</h1></main>;
  }

  if (error) {
    return <main className={styles.pageContainer}><h1>Error loading doctors: {error}</h1></main>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1>Find the Best Doctor In Bangladesh</h1>
      <p>Discover leading medical professionals across various specialties in Bangladesh. Our featured doctors are highly experienced and dedicated to providing excellent healthcare.</p>

      {/* Filter Dropdown */}
      <div className={styles.filterContainer}>
        <label htmlFor="specialty-filter">Filter by Specialty:</label>
        <select
          id="specialty-filter"
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          className={styles.filterSelect} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '1em', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s ease-in-out', width: '100%', textAlign: 'center' }}
        >
          {specialties.map(specialty => (
            <option key={specialty} value={specialty}>{specialty}</option>
          ))}
        </select>
      </div>

      <h2>Featured Doctors</h2>
      <div className={styles.gridContainer}>
        {filteredDoctors.map((doctor, index) => ( // Use filteredDoctors here
          <Link key={index} href={`/${createSlug(doctor["Doctor Name"])}`} className={styles.doctorCard}>
              {isValidUrl(doctor["Photo URL"]) ? (
                <img
                  src={doctor["Photo URL"]}
                  alt={doctor["Doctor Name"]}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder-image.png'; // Fallback image
                    target.alt = 'Image not available';
                  }}
                />
              ) : (
                 <img src="/placeholder-image.png" alt="Placeholder" /> // Placeholder if URL invalid
              )}
              <h3>{doctor["Doctor Name"]}</h3>
              <p>{doctor.Designation}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Export a default component that wraps HomePageContent in Suspense
export default function Home() {
  return (
    <Suspense fallback={<main className={styles.pageContainer}><h1>Loading Filter...</h1></main>}>
      <HomePageContent />
    </Suspense>
  );
}
