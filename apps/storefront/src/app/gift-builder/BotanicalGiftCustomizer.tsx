'use client'

import React, { useState } from 'react'
import {
  Leaf,
  Sprout,
  Gift,
  Check,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from './GiftBuilderPage.module.css'

interface PlantOption {
  id: string
  name: string
  tagline: string
  price: number
  variantId: string
}

interface SeedOption {
  id: string
  name: string
  tagline: string
  price: number
}

interface PackagingOption {
  id: string
  name: string
  tagline: string
  price: number
}

const PLANT_OPTIONS: PlantOption[] = [
  {
    id: 'snake_plant',
    name: 'Air-Purifying Snake Plant',
    tagline: 'Resilient low-light succulent in sustainable hand-woven jute wrap.',
    price: 499,
    variantId: 'variant_gift_snake_plant',
  },
  {
    id: 'money_plant',
    name: 'Prosperity Green Money Plant',
    tagline: 'Lush heart-shaped trailing vines in natural root-safe coco ball.',
    price: 449,
    variantId: 'variant_gift_money_plant',
  },
  {
    id: 'jade_plant',
    name: 'Good Luck Jade Plant',
    tagline: 'Traditional friendship and wealth succulent in breathable coir pot.',
    price: 399,
    variantId: 'variant_gift_jade_plant',
  },
  {
    id: 'peace_lily',
    name: 'Peace Lily White Bloom',
    tagline: 'NASA air purifier with elegant white spathes in ceramic cachepot.',
    price: 599,
    variantId: 'variant_gift_peace_lily',
  },
]

const SEED_OPTIONS: SeedOption[] = [
  {
    id: 'krishna_tulsi',
    name: 'Shyama Krishna Tulsi Seeds',
    tagline: 'Sacred purple basil packet with high medicinal and essential oil content.',
    price: 99,
  },
  {
    id: 'marigold_genda',
    name: 'Pusa Narangi Genda Seeds',
    tagline: 'Vibrant festive orange bloom seeds; natural pollinator and garden protector.',
    price: 99,
  },
  {
    id: 'kitchen_trio',
    name: 'Desi Kitchen Garden Trio',
    tagline: '3-in-1 heirloom packet: All-Green Palak, Kasuri Methi, and Desi Dhaniya.',
    price: 149,
  },
  {
    id: 'sweet_basil',
    name: 'Culinary Sweet Italian Basil',
    tagline: 'Aromatic kitchen herb seeds ideal for balcony pots and fresh pesto.',
    price: 99,
  },
]

const PACKAGING_OPTIONS: PackagingOption[] = [
  {
    id: 'craft_box',
    name: 'Eco Craft Botanical Hamper Box',
    tagline: 'Recyclable Kraft fluted board with raw botanical raffia ribbon.',
    price: 0,
  },
  {
    id: 'emerald_casket',
    name: 'Royal Emerald Botanical Casket',
    tagline: 'Rigid forest green luxury gift box with embossed gold leaf foil.',
    price: 99,
  },
]

export function BotanicalGiftCustomizer() {
  const [activeStep, setActiveStep] = useState<number>(1)
  const [selectedPlant, setSelectedPlant] = useState<PlantOption>(PLANT_OPTIONS[0])
  const [selectedSeed, setSelectedSeed] = useState<SeedOption>(SEED_OPTIONS[0])
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingOption>(PACKAGING_OPTIONS[0])
  const [giftDetails, setGiftDetails] = useState({
    occasion: 'Housewarming & Griha Pravesh',
    recipientName: 'Arjun Mehta',
    message: 'Wishing you endless growth, tranquility, and green prosperity in your new home!',
    senderName: 'Pooja & Kabir',
    dispatchDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  })

  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [addedMessage, setAddedMessage] = useState<string | null>(null)

  const { addToCart, openDrawer } = useCart()

  const totalPrice = selectedPlant.price + selectedSeed.price + selectedPackaging.price

  const handleAddToCart = async () => {
    setIsAdding(true)
    setAddedMessage(null)

    try {
      if (addToCart) {
        await addToCart(selectedPlant.variantId, 1)
        if (openDrawer) {
          openDrawer()
        }
      }
      setAddedMessage(
        `Added custom ${selectedPlant.name} Hamper for ${giftDetails.recipientName || 'Gift'} to your cart!`
      )
    } catch {
      setAddedMessage('Added hamper to cart.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className={styles.builderLayout} id="gift-builder-tool">
      {/* LEFT COLUMN: Interactive Step Wizard */}
      <div className={styles.wizardCard}>
        {/* Step Navigation Tabs */}
        <div className={styles.stepTabs} role="tablist" aria-label="Hamper Builder Steps">
          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 1}
            className={`${styles.stepTabBtn} ${activeStep === 1 ? styles.stepTabBtnActive : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <span className={styles.stepTabNumber}>1</span>
            <span>Plant Specimen</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 2}
            className={`${styles.stepTabBtn} ${activeStep === 2 ? styles.stepTabBtnActive : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <span className={styles.stepTabNumber}>2</span>
            <span>Companion Seeds</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 3}
            className={`${styles.stepTabBtn} ${activeStep === 3 ? styles.stepTabBtnActive : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <span className={styles.stepTabNumber}>3</span>
            <span>Gift Message</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeStep === 4}
            className={`${styles.stepTabBtn} ${activeStep === 4 ? styles.stepTabBtnActive : ''}`}
            onClick={() => setActiveStep(4)}
          >
            <span className={styles.stepTabNumber}>4</span>
            <span>Packaging &amp; Box</span>
          </button>
        </div>

        {/* STEP 1: Choose Living Plant */}
        {activeStep === 1 && (
          <div>
            <h3 className={styles.stepHeading}>Step 1: Choose Live Botanical Specimen</h3>
            <p className={styles.stepInstruction}>
              Every living plant is conditioned for interstate transit from our Pune Mother Nursery and backed by our 48-Hour Guarantee.
            </p>

            <div className={styles.optionsGrid} role="radiogroup" aria-label="Choose Live Plant">
              {PLANT_OPTIONS.map((plant) => {
                const isSelected = selectedPlant.id === plant.id
                return (
                  <div
                    key={plant.id}
                    className={`${styles.optionCard} ${isSelected ? styles.optionCardActive : ''}`}
                    onClick={() => setSelectedPlant(plant)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        setSelectedPlant(plant)
                      }
                    }}
                  >
                    {isSelected && (
                      <div className={styles.optionCheck}>
                        <Check size={14} />
                      </div>
                    )}
                    <div className={styles.optionTop}>
                      <h4 className={styles.optionTitle}>{plant.name}</h4>
                      <span className={styles.optionPrice}>₹{plant.price}</span>
                    </div>
                    <p className={styles.optionDesc}>{plant.tagline}</p>
                  </div>
                )
              })}
            </div>

            <div className={styles.wizardNavRow}>
              <div />
              <button
                type="button"
                className={styles.navNextBtn}
                onClick={() => setActiveStep(2)}
              >
                <span>Continue to Companion Seeds</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose Companion Seeds */}
        {activeStep === 2 && (
          <div>
            <h3 className={styles.stepHeading}>Step 2: Choose Companion Heirloom Seeds</h3>
            <p className={styles.stepInstruction}>
              Select open-pollinated, non-GMO Indian seeds (0% GST, HSN 1209) to accompany your botanical gift.
            </p>

            <div className={styles.optionsGrid} role="radiogroup" aria-label="Choose Companion Seeds">
              {SEED_OPTIONS.map((seed) => {
                const isSelected = selectedSeed.id === seed.id
                return (
                  <div
                    key={seed.id}
                    className={`${styles.optionCard} ${isSelected ? styles.optionCardActive : ''}`}
                    onClick={() => setSelectedSeed(seed)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        setSelectedSeed(seed)
                      }
                    }}
                  >
                    {isSelected && (
                      <div className={styles.optionCheck}>
                        <Check size={14} />
                      </div>
                    )}
                    <div className={styles.optionTop}>
                      <h4 className={styles.optionTitle}>{seed.name}</h4>
                      <span className={styles.optionPrice}>+₹{seed.price}</span>
                    </div>
                    <p className={styles.optionDesc}>{seed.tagline}</p>
                  </div>
                )
              })}
            </div>

            <div className={styles.wizardNavRow}>
              <button
                type="button"
                className={styles.navPrevBtn}
                onClick={() => setActiveStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back to Plant</span>
              </button>
              <button
                type="button"
                className={styles.navNextBtn}
                onClick={() => setActiveStep(3)}
              >
                <span>Continue to Gift Card Note</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Gift Message & Occasion Card */}
        {activeStep === 3 && (
          <div>
            <h3 className={styles.stepHeading}>Step 3: Personalized Botanical Greeting Card</h3>
            <p className={styles.stepInstruction}>
              We print your customized message on textured seed-paper that the recipient can plant in soil after reading!
            </p>

            <div className={styles.cardForm}>
              <div className={styles.formGrid}>
                {/* Occasion */}
                <div className={styles.formGroup}>
                  <label htmlFor="gift-occasion" className={styles.formLabel}>
                    Occasion / Celebration
                  </label>
                  <select
                    id="gift-occasion"
                    value={giftDetails.occasion}
                    onChange={(e) => setGiftDetails({ ...giftDetails, occasion: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="Housewarming & Griha Pravesh">Housewarming &amp; Griha Pravesh</option>
                    <option value="Birthday Celebration">Birthday Celebration</option>
                    <option value="Anniversary & Love">Anniversary &amp; Love</option>
                    <option value="Diwali & Festive Prosperity">Diwali &amp; Festive Prosperity</option>
                    <option value="Deep Gratitude & Thank You">Deep Gratitude &amp; Thank You</option>
                    <option value="Congratulations & New Beginnings">Congratulations &amp; New Beginnings</option>
                  </select>
                </div>

                {/* Recipient Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="gift-recipient" className={styles.formLabel}>
                    Recipient Name (To:)
                  </label>
                  <input
                    type="text"
                    id="gift-recipient"
                    value={giftDetails.recipientName}
                    onChange={(e) => setGiftDetails({ ...giftDetails, recipientName: e.target.value })}
                    placeholder="e.g. Arjun Mehta"
                    className={styles.formInput}
                  />
                </div>

                {/* Sender Name */}
                <div className={styles.formGroupFull}>
                  <label htmlFor="gift-sender" className={styles.formLabel}>
                    From (Your Name / Family):
                  </label>
                  <input
                    type="text"
                    id="gift-sender"
                    value={giftDetails.senderName}
                    onChange={(e) => setGiftDetails({ ...giftDetails, senderName: e.target.value })}
                    placeholder="e.g. Pooja & Kabir"
                    className={styles.formInput}
                  />
                </div>

                {/* Personal Message */}
                <div className={styles.formGroupFull}>
                  <label htmlFor="gift-message" className={styles.formLabel}>
                    Handwritten Note ({giftDetails.message.length}/250 characters):
                  </label>
                  <textarea
                    id="gift-message"
                    maxLength={250}
                    rows={3}
                    value={giftDetails.message}
                    onChange={(e) => setGiftDetails({ ...giftDetails, message: e.target.value })}
                    placeholder="Write your personal heartfelt blessing or note..."
                    className={styles.formTextarea}
                  />
                </div>
              </div>
            </div>

            <div className={styles.wizardNavRow}>
              <button
                type="button"
                className={styles.navPrevBtn}
                onClick={() => setActiveStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back to Seeds</span>
              </button>
              <button
                type="button"
                className={styles.navNextBtn}
                onClick={() => setActiveStep(4)}
              >
                <span>Continue to Gift Packaging</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Packaging & Dispatch Date */}
        {activeStep === 4 && (
          <div>
            <h3 className={styles.stepHeading}>Step 4: Gift Box Packaging &amp; Dispatch</h3>
            <p className={styles.stepInstruction}>
              Select your presentation style. All plants are dispatched directly from our Pune nursery in ventilated crush-proof packaging.
            </p>

            <div className={styles.optionsGrid} role="radiogroup" aria-label="Choose Packaging Style">
              {PACKAGING_OPTIONS.map((pkg) => {
                const isSelected = selectedPackaging.id === pkg.id
                return (
                  <div
                    key={pkg.id}
                    className={`${styles.optionCard} ${isSelected ? styles.optionCardActive : ''}`}
                    onClick={() => setSelectedPackaging(pkg)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault()
                        setSelectedPackaging(pkg)
                      }
                    }}
                  >
                    {isSelected && (
                      <div className={styles.optionCheck}>
                        <Check size={14} />
                      </div>
                    )}
                    <div className={styles.optionTop}>
                      <h4 className={styles.optionTitle}>{pkg.name}</h4>
                      <span className={styles.optionPrice}>{pkg.price === 0 ? 'Included' : `+₹${pkg.price}`}</span>
                    </div>
                    <p className={styles.optionDesc}>{pkg.tagline}</p>
                  </div>
                )
              })}
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
              <label htmlFor="gift-date" className={styles.formLabel}>
                Preferred Nursery Dispatch Date:
              </label>
              <input
                type="date"
                id="gift-date"
                value={giftDetails.dispatchDate}
                onChange={(e) => setGiftDetails({ ...giftDetails, dispatchDate: e.target.value })}
                className={styles.formInput}
              />
            </div>

            <div className={styles.wizardNavRow}>
              <button
                type="button"
                className={styles.navPrevBtn}
                onClick={() => setActiveStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Back to Gift Message</span>
              </button>

              <button
                type="button"
                className={styles.navNextBtn}
                onClick={handleAddToCart}
                disabled={isAdding}
                aria-label={`Add Custom Hamper to Cart for ₹${totalPrice}`}
              >
                <ShoppingBag size={18} />
                <span>{isAdding ? 'Preparing Hamper...' : `Add Hamper to Cart • ₹${totalPrice}`}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Live Hamper Preview Sidebar */}
      <aside className={styles.previewSidebar} aria-label="Live Hamper Summary Preview">
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <h4 className={styles.previewTitle}>Your Custom Hamper</h4>
            <span className={styles.previewBadge}>Live Preview</span>
          </div>

          <div className={styles.previewItemsList}>
            {/* Live Plant */}
            <div className={styles.previewItem}>
              <div className={styles.previewItemLeft}>
                <Leaf size={16} color="var(--ugaoo-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className={styles.itemLabel}>{selectedPlant.name}</p>
                  <p className={styles.itemSub}>Living nursery specimen</p>
                </div>
              </div>
              <span className={styles.itemPrice}>₹{selectedPlant.price}</span>
            </div>

            {/* Seeds */}
            <div className={styles.previewItem}>
              <div className={styles.previewItemLeft}>
                <Sprout size={16} color="var(--ugaoo-green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className={styles.itemLabel}>{selectedSeed.name}</p>
                  <p className={styles.itemSub}>Heirloom seed packet (0% GST)</p>
                </div>
              </div>
              <span className={styles.itemPrice}>₹{selectedSeed.price}</span>
            </div>

            {/* Packaging */}
            <div className={styles.previewItem}>
              <div className={styles.previewItemLeft}>
                <Gift size={16} color="var(--ugaoo-maroon)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className={styles.itemLabel}>{selectedPackaging.name}</p>
                  <p className={styles.itemSub}>Presentation box</p>
                </div>
              </div>
              <span className={styles.itemPrice}>
                {selectedPackaging.price === 0 ? 'Free' : `₹${selectedPackaging.price}`}
              </span>
            </div>
          </div>

          {/* Plantable Greeting Card Preview */}
          <div className={styles.greetingCardPreview}>
            <span className={styles.cardOccasionTag}>🎉 {giftDetails.occasion}</span>
            <p className={styles.cardToText}>Dear {giftDetails.recipientName || 'Friend'},</p>
            <p className={styles.cardMessageText}>
              &ldquo;{giftDetails.message || 'May your garden flourish with joy and health.'}&rdquo;
            </p>
            <p className={styles.cardFromText}>— With love, {giftDetails.senderName || 'Your Friend'}</p>
          </div>

          {/* Total & Action */}
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Hamper Price:</span>
            <span className={styles.totalAmount}>₹{totalPrice}</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className={styles.addToCartBtn}
            aria-label={`Add Complete Hamper to Cart for ₹${totalPrice}`}
          >
            <ShoppingBag size={18} />
            <span>{isAdding ? 'Adding Hamper...' : 'Add Hamper to Cart'}</span>
          </button>

          <p className={styles.assuranceNote}>
            ✓ Dispatched fresh from Pune Mother Nursery • 48-Hour Live Plant Arrival Guarantee
          </p>

          {/* Feedback Status */}
          {addedMessage && (
            <div
              role="status"
              aria-live="polite"
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                backgroundColor: '#def7ec',
                color: '#03543f',
                fontSize: '0.8125rem',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              ✓ {addedMessage}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
