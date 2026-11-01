import React from 'react'
import Link from 'next/link'
import { Sprout, ArrowLeft } from 'lucide-react'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper} aria-hidden="true">
        <Sprout size={36} />
      </div>
      <div className={styles.contentWrapper}>
        <span className={styles.eyebrow}>
          404 — Page Not Found
        </span>
        <h1 className={styles.title}>
          This Specimen Could Not Be Found
        </h1>
        <p className={styles.description}>
          The seed or plant variety you are looking for may have been transplanted or the URL may be incorrect.
        </p>
      </div>
      <div className={styles.actionWrapper}>
        <Link href="/" className={styles.homeButton}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  )
}
