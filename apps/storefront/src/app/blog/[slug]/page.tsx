import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronRight, Calendar, Clock, Phone } from 'lucide-react'
import { BLOG_ARTICLES } from '@/data/blog-articles'
import { BlogProductEmbed } from './BlogProductEmbed'
import styles from './BlogPost.module.css'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = BLOG_ARTICLES.find((a) => a.slug === slug)

  if (!article) {
    return {
      title: 'Article Not Found | GLOROV Botanicals',
    }
  }

  return {
    title: `${article.title} | GLOROV Botanical Chronicles`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author.name],
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const article = BLOG_ARTICLES.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  // Determine embedded companion product details
  const isSeedArticle = article.categorySlug === 'seeds-sowing'

  return (
    <article className={styles.container}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link href="/blog" className={styles.breadcrumbLink}>
          Botanical Chronicles
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>{article.title}</span>
      </nav>

      {/* 2. Article Header */}
      <header className={styles.articleHeader}>
        <span className={styles.categoryTag}>{article.category}</span>
        <h1 className={styles.title}>{article.title}</h1>

        <div className={styles.metaRow}>
          <div className={styles.authorGroup}>
            <div className={styles.authorAvatar}>
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                sizes="44px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div>
              <p className={styles.authorName}>{article.author.name}</p>
              <p className={styles.authorTitle}>{article.author.title}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <Calendar size={14} aria-hidden="true" />
            <span>{article.publishedAt}</span>
            <span>•</span>
            <Clock size={14} aria-hidden="true" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </header>

      {/* 3. Cover Image */}
      <div className={styles.coverImageWrap}>
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 860px) 100vw, 860px"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* 4. Lead Content */}
      <p className={styles.leadText}>{article.content.lead}</p>

      {/* 5. Embedded Specimen Card */}
      {isSeedArticle ? (
        <BlogProductEmbed
          title="Desi Krishna Tulsi Organic Seeds"
          handle="desi-krishna-tulsi-seeds"
          price="₹149"
          variantId="var_tulsi_01"
          thumbnail="/ugaoo-assets/cat-seeds.webp"
          categoryName="0% GST Heirloom Seeds"
        />
      ) : (
        <BlogProductEmbed
          title="Peace Lily Indoor Plant"
          handle="peace-lily-plant"
          price="₹499"
          variantId="var_lily_01"
          thumbnail="/ugaoo-assets/cat-plants.webp"
          categoryName="Living NASA Air-Purifier"
        />
      )}

      {/* 6. Main Content Sections */}
      <div className={styles.contentSections}>
        {article.content.sections.map((section, idx) => (
          <section key={idx} className={styles.contentSection}>
            <h2 className={styles.sectionHeading}>{section.heading}</h2>

            {section.body.map((p, pIdx) => (
              <p key={pIdx} className={styles.paragraph}>
                {p}
              </p>
            ))}

            {section.callout && (
              <div className={styles.calloutBox} role="note">
                <p className={styles.calloutTitle}>{section.callout.title}</p>
                <p className={styles.calloutText}>{section.callout.text}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 7. WhatsApp Plant Doctor Consultation Banner */}
      <aside className={styles.consultationBanner} aria-label="Botanical Consultation">
        <div>
          <h3 className={styles.consultationTitle}>Have a Question About This Guide?</h3>
          <p className={styles.consultationDesc}>
            Our Pune nursery horticulturists are available on WhatsApp to answer your specific potting, lighting, or watering queries.
          </p>
        </div>
        <a
          href="https://wa.me/918087087224?text=Hi%20GLOROV%20Plant%20Doctor%2C%20I%20have%20a%20question%20about%20a%20gardening%20guide"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.consultationBtn}
        >
          <Phone size={15} aria-hidden="true" />
          <span>Ask Plant Specialist</span>
        </a>
      </aside>
    </article>
  )
}
