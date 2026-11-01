import React from 'react'
import styles from './FarmToHome.module.css'

const STEPS = [
  {
    step: 'Step 01',
    title: 'Grown at our farm',
    description: 'Nurtured in our Pune botanical farm for 4–8 weeks in climate-controlled polyhouses before reaching you.',
    image: '/ugaoo-assets/farm-1.webp',
  },
  {
    step: 'Step 02',
    title: '3-step quality check',
    description: 'Every plant passes rigorous root vitality, foliage health, and zero-pest laboratory checks before packing.',
    image: '/ugaoo-assets/farm-2.webp',
  },
  {
    step: 'Step 03',
    title: 'Survival packaging',
    description: 'Moisture-locked, breathable coco-peat root wraps and sturdy ventilated outer cases tested at 42°C in transit.',
    image: '/ugaoo-assets/farm-3.webp',
  },
  {
    step: 'Step 04',
    title: 'Arrives alive',
    description: 'Guaranteed healthy delivery with 48-hour free replacement. No questions asked, just plant care.',
    image: '/ugaoo-assets/farm-4.webp',
  },
]

export function FarmToHome() {
  return (
    <section className={styles.section} aria-label="From Our Farm to Your Home">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>From Our Farm to Your Home</h2>
          <p className={styles.subtitle}>
            A carefully monitored botanical journey ensuring every living plant and seed reaches your doorstep vibrant and ready to flourish.
          </p>
        </div>

        <div className={styles.grid}>
          {STEPS.map((item) => (
            <article key={item.title} className={styles.card}>
              <div className={styles.imgWrap}>
                <span className={styles.badge}>{item.step}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.img}
                />
              </div>
              <div className={styles.content}>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepText}>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
