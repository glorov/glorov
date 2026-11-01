'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  PlusCircle,
  X,
  CheckCircle2,
  ShoppingBag,
  Camera,
  Heart,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './CommunityPage.module.css'

export interface CustomerStory {
  id: string
  name: string
  city: string
  state: string
  roomCategory: 'living_room' | 'balcony' | 'work_desk' | 'kitchen'
  plantName: string
  specimenPrice: number
  variantId: string
  thrivingDuration: string
  quote: string
  avatarInitials: string
  likes: number
}

export const COMMUNITY_STORIES: CustomerStory[] = [
  {
    id: 'story-1',
    name: 'Ananya Roy',
    city: 'Bengaluru',
    state: 'Karnataka',
    roomCategory: 'living_room',
    plantName: 'Monstera Deliciosa (Swiss Cheese Plant)',
    specimenPrice: 699,
    variantId: 'variant_monstera_std',
    thrivingDuration: 'Thriving for 2.5 Years',
    quote: 'My Monstera arrived from Pune via cold transit with pristine fenestrations. Over 30 months later, it has produced 14 new leaves and transformed our Koramangala apartment into a serene urban sanctuary!',
    avatarInitials: 'AR',
    likes: 142,
  },
  {
    id: 'story-2',
    name: 'Rohan & Preeti Deshmukh',
    city: 'Pune',
    state: 'Maharashtra',
    roomCategory: 'balcony',
    plantName: 'Bougainvillea & Krishna Tulsi Sowing Kit',
    specimenPrice: 349,
    variantId: 'variant_tulsi_seeds_kit',
    thrivingDuration: 'Thriving for 18 Months',
    quote: 'Our 4th-floor balcony in Baner catches strong afternoon sun. The heirloom Tulsi and climbing flowering vines we sowed in 100% organic potting mix are bursting with lush green vigour.',
    avatarInitials: 'RD',
    likes: 98,
  },
  {
    id: 'story-3',
    name: 'Dr. Vikram Singhania',
    city: 'Gurugram',
    state: 'NCR',
    roomCategory: 'work_desk',
    plantName: 'Sansevieria Trifasciata (Snake Plant)',
    specimenPrice: 449,
    variantId: 'variant_snake_plant_laurentii',
    thrivingDuration: 'Thriving for 3 Years',
    quote: 'As a doctor working extended teleconsultation shifts, this air-purifying Snake Plant sits right next to my workstation. It requires minimal watering and keeps the indoor air fresh and crisp.',
    avatarInitials: 'VS',
    likes: 215,
  },
  {
    id: 'story-4',
    name: 'Meera Nambiar',
    city: 'Kochi',
    state: 'Kerala',
    roomCategory: 'kitchen',
    plantName: 'Desi Coriander & Organic Chilli Seeds',
    specimenPrice: 199,
    variantId: 'variant_kitchen_seeds_pack',
    thrivingDuration: 'Thriving for 8 Months',
    quote: 'Harvesting fresh, fragrant coriander and piquant green chillies straight from our kitchen windowsill is unbeatable. Zero synthetic pesticides, 100% organic seed germination!',
    avatarInitials: 'MN',
    likes: 86,
  },
  {
    id: 'story-5',
    name: 'Tanvi Shah',
    city: 'Mumbai',
    state: 'Maharashtra',
    roomCategory: 'living_room',
    plantName: 'Peace Lily (White Spathe Air Purifier)',
    specimenPrice: 549,
    variantId: 'variant_peace_lily_std',
    thrivingDuration: 'Thriving for 14 Months',
    quote: 'Mumbai monsoons can be humid, but this Peace Lily has bloomed twice already! The gentle moisture retention soil mix from Ugaoo keeps it thriving without root rot.',
    avatarInitials: 'TS',
    likes: 119,
  },
  {
    id: 'story-6',
    name: 'Kartik & Shruti Iyer',
    city: 'Chennai',
    state: 'Tamil Nadu',
    roomCategory: 'balcony',
    plantName: 'Jade Plant (Crassula Ovata)',
    specimenPrice: 399,
    variantId: 'variant_jade_plant_std',
    thrivingDuration: 'Thriving for 2 Years',
    quote: 'Our east-facing Chennai balcony receives harsh coastal humidity. The thick succulent foliage of this Jade Plant has grown lush and robust under the morning sun rays.',
    avatarInitials: 'KI',
    likes: 164,
  },
]

const CATEGORY_TABS = [
  { id: 'all', label: 'All Stories' },
  { id: 'living_room', label: 'Living Room' },
  { id: 'balcony', label: 'Balcony Garden' },
  { id: 'work_desk', label: 'Work Desk' },
  { id: 'kitchen', label: 'Kitchen Garden' },
]

export function CommunityGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    cityState: '',
    setting: 'living_room',
    plantName: '',
    duration: '1 Year',
    storyText: '',
  })

  const { addToCart, openDrawer } = useCart()

  const filteredStories =
    selectedCategory === 'all'
      ? COMMUNITY_STORIES
      : COMMUNITY_STORIES.filter((story) => story.roomCategory === selectedCategory)

  const handleShopSpecimen = async (variantId: string) => {
    setAddingVariantId(variantId)
    try {
      if (addToCart) {
        await addToCart(variantId, 1)
        if (openDrawer) {
          openDrawer()
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setAddingVariantId(null)
    }
  }

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.plantName || !formData.storyText) {
      return
    }
    setIsSubmitted(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsSubmitted(false)
    setFormData({
      name: '',
      cityState: '',
      setting: 'living_room',
      plantName: '',
      duration: '1 Year',
      storyText: '',
    })
  }

  return (
    <div>
      {/* Gallery Header with Filter Tabs and Share Trigger */}
      <div className={styles.galleryHeader}>
        <div className={styles.galleryFilterTabs} role="tablist" aria-label="Filter Stories by Botanical Setting">
          {CATEGORY_TABS.map((tab) => {
            const isActive = selectedCategory === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
                onClick={() => setSelectedCategory(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          className={styles.shareStoryTriggerBtn}
          onClick={() => setIsModalOpen(true)}
          aria-label="Share Your Plant Story and get ₹100 seed voucher"
        >
          <Camera size={18} />
          <span>Share Your Plant Story</span>
        </button>
      </div>

      {/* Stories Grid */}
      <div className={styles.storiesGrid} role="region" aria-label="Community Stories Grid">
        {filteredStories.map((story) => {
          const isAdding = addingVariantId === story.variantId
          return (
            <article key={story.id} className={styles.storyCard}>
              <div className={styles.storyHeader}>
                <div className={styles.customerAvatar} aria-hidden="true">
                  {story.avatarInitials}
                </div>
                <div className={styles.customerMeta}>
                  <h3 className={styles.customerName}>{story.name}</h3>
                  <span className={styles.customerLocation}>
                    {story.city}, {story.state}
                  </span>
                  <span className={styles.thrivingDuration}>
                    <Sparkles size={11} />
                    {story.thrivingDuration}
                  </span>
                </div>
              </div>

              <div className={styles.storyBody}>
                <p className={styles.storyQuote}>&ldquo;{story.quote}&rdquo;</p>
              </div>

              <div className={styles.specimenBar}>
                <div className={styles.specimenInfo}>
                  <span className={styles.specimenLabel}>Living Specimen</span>
                  <span className={styles.specimenName}>{story.plantName}</span>
                </div>
                <button
                  type="button"
                  className={styles.shopSpecimenBtn}
                  onClick={() => handleShopSpecimen(story.variantId)}
                  disabled={isAdding}
                  aria-label={`Shop ${story.plantName} for ₹${story.specimenPrice}`}
                >
                  <ShoppingBag size={14} />
                  <span>{isAdding ? 'Adding...' : `Shop • ₹${story.specimenPrice}`}</span>
                </button>
              </div>
            </article>
          )
        })}
      </div>

      {/* Share Story Modal */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal()
            }
          }}
        >
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={handleCloseModal}
              aria-label="Close Story Submission Modal"
            >
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <form onSubmit={handleSubmitStory}>
                <h3 id="modal-title" className={styles.modalTitle}>
                  Share Your Botanical Journey
                </h3>
                <p className={styles.modalSubtitle}>
                  Inspire thousands of plant parents across India! Every verified story earns a ₹100 Heirloom Seed Voucher for your next green addition.
                </p>

                <div className={styles.formGroup}>
                  <label htmlFor="story-name" className={styles.formLabel}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    id="story-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="story-location" className={styles.formLabel}>
                    City &amp; State *
                  </label>
                  <input
                    type="text"
                    id="story-location"
                    required
                    value={formData.cityState}
                    onChange={(e) => setFormData({ ...formData, cityState: e.target.value })}
                    placeholder="e.g. Pune, Maharashtra"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="story-setting" className={styles.formLabel}>
                    Botanical Setting *
                  </label>
                  <select
                    id="story-setting"
                    value={formData.setting}
                    onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="living_room">Living Room Sanctuary</option>
                    <option value="balcony">Balcony Garden</option>
                    <option value="work_desk">Work Desk Greens</option>
                    <option value="kitchen">Kitchen Herb Windowsill</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="story-plant" className={styles.formLabel}>
                    Living Plant Specimen *
                  </label>
                  <input
                    type="text"
                    id="story-plant"
                    required
                    value={formData.plantName}
                    onChange={(e) => setFormData({ ...formData, plantName: e.target.value })}
                    placeholder="e.g. Fiddle Leaf Fig or Krishna Tulsi"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="story-duration" className={styles.formLabel}>
                    How long has it thrived? *
                  </label>
                  <select
                    id="story-duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="3-6 Months">3 – 6 Months</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2+ Years">2+ Years</option>
                    <option value="5+ Years">5+ Years (Family Heirloom)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="story-text" className={styles.formLabel}>
                    Your Plant Care Story *
                  </label>
                  <textarea
                    id="story-text"
                    required
                    rows={4}
                    value={formData.storyText}
                    onChange={(e) => setFormData({ ...formData, storyText: e.target.value })}
                    placeholder="Share how this plant has grown in your home, your light routine, or any special moments..."
                    className={styles.formTextarea}
                  />
                </div>

                <button type="submit" className={styles.modalSubmitBtn}>
                  <PlusCircle size={18} />
                  <span>Submit Story &amp; Claim ₹100 Voucher</span>
                </button>
              </form>
            ) : (
              <div className={styles.voucherCard}>
                <CheckCircle2 size={48} color="var(--ugaoo-green, #0a4c36)" />
                <h3 className={styles.modalTitle}>Story Submitted Successfully!</h3>
                <p className={styles.modalSubtitle}>
                  Thank you, <strong>{formData.name}</strong>! Your green story has been submitted for horticultural curation. Here is your promised gift voucher:
                </p>

                <div className={styles.voucherCode}>GREEN-PARENT-100</div>

                <p style={{ fontSize: '0.8125rem', color: 'rgba(4, 32, 24, 0.7)', margin: 0 }}>
                  Apply this code at checkout to get ₹100 off any organic seeds or living plants. Backed by our 100% germination guarantee!
                </p>

                <button
                  type="button"
                  className={styles.modalSubmitBtn}
                  onClick={handleCloseModal}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <Heart size={16} />
                  <span>Back to Community Gallery</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
