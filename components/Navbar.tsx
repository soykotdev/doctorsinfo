'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.navbarBrand}>
        Doctor Finder
      </Link>
      <div className={styles.menuIcon} onClick={toggleMenu}>
        ☰
      </div>
      <ul className={`${styles.navbarLinks} ${isMenuOpen ? styles.active : ''}`}>
        <li><Link href="/">Home</Link></li>
        <li key="Medicine Specialist">
          <Link href={`/?specialty=${encodeURIComponent('Medicine Specialist')}`}>
            Medicine Specialist
          </Link>
        </li>
        <li key="Liver Diseases Specialist">
          <Link href={`/?specialty=${encodeURIComponent('Liver Diseases Specialist')}`}>
            Liver Diseases Specialist
          </Link>
        </li>
        <li key="Gynecologist & Surgeon">
          <Link href={`/?specialty=${encodeURIComponent('Gynecologist & Surgeon')}`}>
            Gynecologist & Surgeon
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
