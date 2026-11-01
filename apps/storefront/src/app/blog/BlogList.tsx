'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { BLOG_ARTICLES } from '@/data/blog-articles'
import styles from './BlogIndex.module.css'

const CATEGORIES = [
  { id: 'all', label: 'All Guides' },
  { id: 'indoor-care', label: 'Indoor Plant Care' },
  { id: 'seeds-sowing', label: 'Desi Seeds & Sowing' },
  { id: 'diagnostics', label: 'Plant Doctor Diagnostics' },
]

export function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return BLOG_ARTICLES
    return BLOG_ARTICLES.filter((a) => a.categorySlug === selectedCategory)
  }, [selectedCategory])

  const featuredArticle = filteredArticles[0]
  const otherArticles = filteredArticles.slice(1)

  return (
    <div>
      {/* Category Tabs */}
      <div className={styles.categoryTabs} role="tablist" aria-label="Blog categories">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Featured Article Card */}
      {featuredArticle && (
        <article className={styles.featuredCard} aria-labelledby={`article-title-${featuredArticle.slug}`}>
          <div className={styles.featuredImageWrap}>
            <Image
              src={featuredArticle.coverImage}
              alt={featuredArticle.title}
              fill
              priority
              sizes="(max-width: 960px) 100vw, 55vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={styles.featuredContent}>
            <div className={styles.metaRow}>
              <span className={styles.categoryTag}>{featuredArticle.category}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={13} aria-hidden="true" />
                <span>{featuredArticle.publishedAt}</span>
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} aria-hidden="true" />
                <span>{featuredArticle.readTime}</span>
              </span>
            </div>

            <h2 id={`article-title-${featuredArticle.slug}`} className={styles.featuredTitle}>
              <Link href={`/blog/${featuredArticle.slug}`} className={styles.featuredTitle}>
                {featuredArticle.title}
              </Link>
            </h2>

            <p className={styles.featuredExcerpt}>{featuredArticle.excerpt}</p>

            <div className={styles.authorRow}>
              <div className={styles.authorAvatar}>
                <Image
                  src={featuredArticle.author.avatar}
                  alt={featuredArticle.author.name}
                  fill
                  sizes="40px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div>
                <p className={styles.authorName}>{featuredArticle.author.name}</p>
                <p className={styles.authorTitle}>{featuredArticle.author.title}</p>
              </div>
              <Link href={`/blog/${featuredArticle.slug}`} className={styles.readMoreLink}>
                <span>Read Full Guide</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      )}

      {/* Other Articles Grid */}
      {otherArticles.length > 0 && (
        <div className={styles.articlesGrid} role="region" aria-label="Other horticultural guides">
          {otherArticles.map((article) => (
            <article key={article.slug} className={styles.articleCard}>
              <div className={styles.articleImageWrap}>
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.articleBody}>
                <div className={styles.metaRow} style={{ marginBottom: '0.65rem' }}>
                  <span className={styles.categoryTag}>{article.category}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className={styles.articleTitle}>
                  <Link href={`/blog/${article.slug}`} className={styles.articleTitle}>
                    {article.title}
                  </Link>
                </h3>

                <p className={styles.articleExcerpt}>{article.excerpt}</p>

                <div className={styles.authorRow}>
                  <div>
                    <p className={styles.authorName}>{article.author.name}</p>
                    <p className={styles.authorTitle}>{article.publishedAt}</p>
                  </div>
                  <Link href={`/blog/${article.slug}`} className={styles.readMoreLink}>
                    <span>Read</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
