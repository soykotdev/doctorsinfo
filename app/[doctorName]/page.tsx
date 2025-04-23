'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Doctor from '../../components/Doctor';
import styles from '../HomePage.module.css'; // Import home page styles

interface DoctorData {
  "Doctor Name": string;
  "Photo URL": string;
  Degree: string;
  Specialty: string;
  Designation: string;
  Workplace: string;
  About: string;
}

const createSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const DoctorPage: React.FC = () => {
  const params = useParams();
  const slug = params.doctorName as string;
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarDoctors, setSimilarDoctors] = useState<DoctorData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/doctors');
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const allDoctors: DoctorData[] = await response.json();
        const foundDoctor = allDoctors.find(doc => createSlug(doc["Doctor Name"]) === slug);

        if (foundDoctor) {
          setDoctor(foundDoctor);
          // Fetch similar doctors
          const similar = allDoctors.filter(doc => doc.Specialty === foundDoctor.Specialty && doc["Doctor Name"] !== foundDoctor["Doctor Name"]);
          // Randomly select 5 similar doctors
          const shuffledSimilar = shuffleArray(similar).slice(0, 5);
          setSimilarDoctors(shuffledSimilar);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Helper function to shuffle an array (Fisher-Yates shuffle)
  function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array];
    for (let i = 0; i < currentIndex; i++) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [newArray[i], newArray[randomIndex]] = [
        newArray[randomIndex], newArray[i]];
    }
    return newArray;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!doctor) {
    return <div>Doctor not found.</div>;
  }

  return (
    <div>
      <h1>{`Best ${doctor.Specialty} Doctor in ${doctor.Workplace}`}</h1>
      <Doctor doctor={doctor} />
      <h2>Similar Doctors</h2>
      {similarDoctors.length > 0 ? (
        <div className={styles.gridContainer}>
          {similarDoctors.map((doc) => (
            <Link key={doc["Doctor Name"]} href={`/${createSlug(doc["Doctor Name"])}`} className={styles.doctorCard}>
              {doc["Photo URL"] && (
                <img
                  src={doc["Photo URL"]}
                  alt={doc["Doctor Name"]}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder-image.png';
                    target.alt = 'Image not available';
                  }}
                />
              )}
              <h3>{doc["Doctor Name"]}</h3>
              <p>{doc.Designation}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>No similar doctors found.</p>
      )}
    </div>
  );
};

export default DoctorPage;
