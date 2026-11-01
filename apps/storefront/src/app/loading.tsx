import React from 'react'
import { Sprout } from 'lucide-react'
import styles from './Loading.module.css'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper} aria-hidden="true">
        <Sprout size={28} />
      </div>
      <p className={styles.text}>
        Nurturing catalog data...
      </p>
    </div>
  )
}
