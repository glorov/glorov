export interface BlogArticle {
  slug: string
  title: string
  category: string
  categorySlug: 'indoor-care' | 'seeds-sowing' | 'diagnostics'
  excerpt: string
  coverImage: string
  readTime: string
  publishedAt: string
  author: {
    name: string
    title: string
    avatar: string
  }
  companionProductHandle?: string
  content: {
    lead: string
    sections: {
      heading: string
      body: string[]
      callout?: {
        title: string
        text: string
      }
    }[]
  }
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'top-air-purifying-plants-indian-homes',
    title: 'Top 7 Air-Purifying Indoor Plants Recommended by NASA for Indian Apartments',
    category: 'Indoor Plant Care',
    categorySlug: 'indoor-care',
    excerpt:
      'Discover resilient living botanicals that actively absorb indoor formaldehyde, benzene, and carbon monoxide while thriving in warm Indian apartments.',
    coverImage: '/ugaoo-assets/cat-plants.webp',
    readTime: '6 min read',
    publishedAt: 'October 15, 2026',
    author: {
      name: 'Dr. Arvind Kulkarni',
      title: 'Chief Agronomist, Pune Propagation Nursery',
      avatar: '/ugaoo-assets/farm-1.webp',
    },
    companionProductHandle: 'peace-lily-plant',
    content: {
      lead:
        'Indoor air in urban Indian metropolitan apartments often contains three to five times more volatile organic compounds (VOCs) than outdoor air. NASA’s landmark Clean Air Study proved that certain living botanical specimens filter airborne toxins naturally through their foliage and root microbiomes.',
      sections: [
        {
          heading: '1. Peace Lily (Spathiphyllum wallisii)',
          body: [
            'The Peace Lily is celebrated by horticulturists worldwide for its ability to filter five major indoor air toxins: benzene, formaldehyde, trichloroethylene, xylene, and ammonia. Its broad, glossy emerald leaves transpire moisture back into air-conditioned dry rooms.',
            'In Indian homes, place your Peace Lily 4 to 6 feet away from an east- or north-facing window where it receives bright, diffused sunlight. Avoid placing it directly beneath harsh AC draft vents.',
          ],
          callout: {
            title: 'Horticulturist Tip from Pune Hub',
            text:
              'Peace Lilies are dramatic communicators. When they need water, their foliage droops gently. Hydrate them thoroughly, and they will perk up within 2 hours.',
          },
        },
        {
          heading: '2. Sansevieria Golden Hahnii (Snake Plant)',
          body: [
            'Unlike most plants that consume oxygen at night, the Snake Plant performs Crassulacean Acid Metabolism (CAM), absorbing carbon dioxide and emitting fresh oxygen throughout the night. This makes it the undisputed gold standard for bedroom nightstands.',
            'Its architectural upright leaves store substantial moisture, meaning it requires hydration only once every 10 to 14 days in typical Indian household climates.',
          ],
        },
        {
          heading: '3. Golden Pothos (Money Plant)',
          body: [
            'Beloved across Indian households for prosperity and good fortune, the Golden Pothos is also a vigorous pollutant sponge. It rapidly neutralizes carbon monoxide emitted from gas stoves and urban vehicular traffic.',
            'Train its cascading vines along living room bookshelf ledges or let it drape from hanging jute baskets in indirect light.',
          ],
        },
      ],
    },
  },
  {
    slug: 'kharif-sowing-desi-vegetable-seeds',
    title: 'The Complete Kharif Monsoon Sowing Guide: From Desi Seeds to Bountiful Harvest',
    category: 'Desi Seeds & Sowing',
    categorySlug: 'seeds-sowing',
    excerpt:
      'Learn how to sow indigenous heirloom seeds, master the 40-30-20-10 potting mix ratio, and protect young seedlings during heavy Indian rains.',
    coverImage: '/ugaoo-assets/cat-seeds.webp',
    readTime: '7 min read',
    publishedAt: 'October 10, 2026',
    author: {
      name: 'Sunita Joshi',
      title: 'Senior Seed Viability Specialist',
      avatar: '/ugaoo-assets/farm-2.webp',
    },
    companionProductHandle: 'desi-krishna-tulsi-seeds',
    content: {
      lead:
        'The onset of the Indian monsoon signals nature’s most fertile window. Sowing certified non-GMO heirloom desi seeds allows urban gardeners to cultivate fresh, pesticide-free greens and vegetables right from their balcony planters.',
      sections: [
        {
          heading: 'The Foundation: The 40-30-20-10 Potting Mix Formula',
          body: [
            'Do not use plain garden dirt, which compacts into cement during monsoon downpours and suffocates delicate root hairs. Instead, blend the ideal Indian container potting mix:',
            '• 40% Washed Coco-Peat (for lightweight moisture aeration and root expansion)',
            '• 30% Aged Cow-Dung Manure or Earthworm Vermicompost (natural microbial nutrition)',
            '• 20% Native Garden Loam (for essential mineral structure)',
            '• 10% Coarse River Sand or Perlite (guarantees surplus water drainage)',
          ],
          callout: {
            title: 'Statutory 0% GST Note',
            text:
              'All GLOROV vegetable, flower, and herb seeds for sowing are legally exempt from GST (0% under Indian statutory HSN Code 1209).',
          },
        },
        {
          heading: 'Top Kharif Crops to Sow Now',
          body: [
            'Desi Palak (Spinach): Germinates in 4 to 6 days. Ready for continuous leaf harvesting in 28 days.',
            'Desi Krishna Tulsi: Sacred holy basil. Sow shallowly at 0.5 cm depth and keep the topsoil misted until cotyledons emerge.',
            'Heirloom Desi Tomato: Strong resistance against common leaf curl viruses. Requires sturdy bamboo staking as vines grow.',
          ],
        },
      ],
    },
  },
  {
    slug: 'why-are-my-plant-leaves-yellow',
    title: 'Why Are My Indoor Plant Leaves Turning Yellow? Diagnosis & Recovery Protocol',
    category: 'Plant Doctor Diagnostics',
    categorySlug: 'diagnostics',
    excerpt:
      'Decode what your plant is trying to tell you. Identify overwatering root rot, transit acclimatization shock, and mineral deficiencies with our diagnostic checklist.',
    coverImage: '/ugaoo-assets/space-living.webp',
    readTime: '5 min read',
    publishedAt: 'September 28, 2026',
    author: {
      name: 'Dr. Arvind Kulkarni',
      title: 'Chief Agronomist, Pune Propagation Nursery',
      avatar: '/ugaoo-assets/farm-1.webp',
    },
    companionProductHandle: 'peace-lily-plant',
    content: {
      lead:
        'Seeing yellow foliage on your cherished botanical specimen can be alarming. However, yellowing (chlorosis) is simply an early signal. By observing the texture, location, and soil moisture, you can accurately diagnose the issue before permanent damage occurs.',
      sections: [
        {
          heading: 'Scenario 1: Soft, Mushy Yellow Leaves at the Base',
          body: [
            'Diagnosis: Overwatering and insufficient root oxygenation.',
            'Action Protocol: Immediately cease watering. Check if the pot drainage holes are clogged. Allow the potting soil to dry out completely for 5 to 7 days until the top 2 inches pass the finger test. Never leave pots sitting in stagnant water trays.',
          ],
          callout: {
            title: 'The Golden Finger Test Rule',
            text:
              'Insert your index finger 1.5 inches into the soil. If cool damp particles stick to your skin, do not water today. Only water when dry and crumbly.',
          },
        },
        {
          heading: 'Scenario 2: Crispy, Dry Yellow or Brown Leaf Tips',
          body: [
            'Diagnosis: Low ambient humidity, harsh air conditioning drafts, or underwatering.',
            'Action Protocol: Trim off scorched tips with sanitized shears. Move the specimen away from direct air conditioner louvers. Mist the foliage in the morning or place the pot on a tray of wet pebbles to boost local ambient humidity.',
          ],
        },
        {
          heading: 'Scenario 3: Single Older Leaf Shedding After Unboxing',
          body: [
            'Diagnosis: Natural post-transit acclimatization.',
            'Action Protocol: Completely normal. During parcel transit, plants conserve energy by dropping 1 or 2 older, outer leaves. As long as the central crown is firm and green, the plant will establish vigorous root systems in its new home within two weeks.',
          ],
        },
      ],
    },
  },
]
