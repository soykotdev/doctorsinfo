import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.links}>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Doctor Finder. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
