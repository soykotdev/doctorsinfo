'use client';

import styles from './page.module.css';

export default function ContactPage() {
  return (
    <div className={styles.contactContainer}>
      <h1 className={styles.pageTitle}>Contact Us</h1>
      
      <div className={styles.content}>
        <div className={styles.contactInfo}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Email</div>
            <div className={styles.infoValue}>
              <a href="mailto:info@doctorfinder.com">info@doctorfinder.com</a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Phone</div>
            <div className={styles.infoValue}>
              <a href="tel:+880123456789">+880 12345-6789</a>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>Support Hours</div>
            <div className={styles.infoValue}>
              Sunday - Thursday<br />
              9:00 AM - 6:00 PM
            </div>
          </div>
        </div>

        <div className={styles.address}>
          <p>
            Doctor Finder Bangladesh<br />
            Level 4, House 123<br />
            Road 12, Banani<br />
            Dhaka 1213, Bangladesh
          </p>
        </div>
      </div>
    </div>
  );
}
