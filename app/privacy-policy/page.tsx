'use client';

import styles from './page.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.policyContainer}>
      <h1 className={styles.pageTitle}>Privacy Policy</h1>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Introduction</h2>
          <p className={styles.paragraph}>
            Welcome to Doctor Finder's Privacy Policy. We respect your privacy and are committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information when you use our service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Information We Collect</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>Basic contact information (name, email, phone number)</li>
            <li className={styles.listItem}>Search preferences and history</li>
            <li className={styles.listItem}>Device and browser information</li>
            <li className={styles.listItem}>Location data (with your consent)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>How We Use Your Information</h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>To provide and improve our doctor finding service</li>
            <li className={styles.listItem}>To personalize your search experience</li>
            <li className={styles.listItem}>To communicate important updates and information</li>
            <li className={styles.listItem}>To ensure the security of our platform</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Protection</h2>
          <p className={styles.paragraph}>
            We implement robust security measures to protect your data from unauthorized access, alteration, or disclosure. Our security practices include encryption, secure data storage, and regular security audits.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Rights</h2>
          <p className={styles.paragraph}>
            You have the right to:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Access your personal data</li>
            <li className={styles.listItem}>Request correction of your data</li>
            <li className={styles.listItem}>Request deletion of your data</li>
            <li className={styles.listItem}>Object to data processing</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <p className={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@doctorfinder.com" className={styles.email}>
              privacy@doctorfinder.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}