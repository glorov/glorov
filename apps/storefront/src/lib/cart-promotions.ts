/**
 * Botanical Cart Promotions & Milestone Progress Library
 * Dynamically computes tiered threshold progress, unlock targets, and reward incentives.
 */

export interface MilestoneTier {
  key: 'free_delivery' | '10_percent' | '15_percent' | '20_percent';
  label: string;
  badgeLabel: string;
  targetSpendINR: number;
  discountPercent?: number;
  defaultCode?: string;
  description: string;
}

export const CART_MILESTONE_TIERS: MilestoneTier[] = [
  {
    key: 'free_delivery',
    label: 'Free Delivery',
    badgeLabel: 'FREE',
    targetSpendINR: 499,
    defaultCode: 'FREESHIP',
    description: 'Free express botanical shipping across India',
  },
  {
    key: '10_percent',
    label: '10% off',
    badgeLabel: '10%',
    targetSpendINR: 999,
    discountPercent: 10,
    defaultCode: 'DIWALI10',
    description: '10% OFF on botanical orders above ₹999',
  },
  {
    key: '15_percent',
    label: '15% off',
    badgeLabel: '15%',
    targetSpendINR: 1599,
    discountPercent: 15,
    defaultCode: 'DIWALI15',
    description: '15% OFF on botanical orders above ₹1,599',
  },
  {
    key: '20_percent',
    label: '20% off',
    badgeLabel: '20%',
    targetSpendINR: 2299,
    discountPercent: 20,
    defaultCode: 'DIWALI20',
    description: '20% OFF on botanical orders above ₹2,299',
  },
];

export interface MilestoneProgressResult {
  subtotalINR: number;
  message: string;
  targetRewardText: string;
  neededForNext: number;
  isUnlocked: boolean;
  isMaxTier: boolean;
  progressPercent: number; // 0 to 100 for continuous bar
  milestoneNodes: Array<{
    key: string;
    label: string;
    targetSpendINR: number;
    isReached: boolean;
    isCurrentTarget: boolean;
    positionPercent: number; // Position along the bar (0 to 100%)
  }>;
}

/**
 * Calculates real-time progress toward the next unlock tier based on cart subtotal in INR.
 */
export function calculateMilestoneProgress(subtotalINR: number): MilestoneProgressResult {
  const roundedSubtotal = Math.max(0, Math.round(subtotalINR));

  // Visual positions of discount nodes along the bar: 10% at ~35%, 15% at ~65%, 20% at ~95%
  const nodes = [
    {
      key: '10_percent',
      label: '10%',
      targetSpendINR: 999,
      isReached: roundedSubtotal >= 999,
      isCurrentTarget: roundedSubtotal < 999,
      positionPercent: 35,
    },
    {
      key: '15_percent',
      label: '15%',
      targetSpendINR: 1599,
      isReached: roundedSubtotal >= 1599,
      isCurrentTarget: roundedSubtotal >= 999 && roundedSubtotal < 1599,
      positionPercent: 65,
    },
    {
      key: '20_percent',
      label: '20%',
      targetSpendINR: 2299,
      isReached: roundedSubtotal >= 2299,
      isCurrentTarget: roundedSubtotal >= 1599 && roundedSubtotal < 2299,
      positionPercent: 95,
    },
  ];

  // Calculate overall progress percent (clamped 0 to 100)
  // Mapping subtotal to a smooth visual progress bar:
  // 0 -> 0%
  // 499 (free delivery) -> ~18%
  // 999 (10%) -> ~35%
  // 1599 (15%) -> ~65%
  // 2299 (20%) -> 100%
  let progressPercent = 0;
  if (roundedSubtotal <= 0) {
    progressPercent = 0;
  } else if (roundedSubtotal < 499) {
    progressPercent = (roundedSubtotal / 499) * 18;
  } else if (roundedSubtotal < 999) {
    progressPercent = 18 + ((roundedSubtotal - 499) / (999 - 499)) * (35 - 18);
  } else if (roundedSubtotal < 1599) {
    progressPercent = 35 + ((roundedSubtotal - 999) / (1599 - 999)) * (65 - 35);
  } else if (roundedSubtotal < 2299) {
    progressPercent = 65 + ((roundedSubtotal - 1599) / (2299 - 1599)) * (95 - 65);
  } else {
    progressPercent = 100;
  }

  // Determine current active target & message
  let message = '';
  let targetRewardText = '';
  let neededForNext = 0;
  let isUnlocked = false;
  let isMaxTier = false;

  if (roundedSubtotal < 499) {
    neededForNext = 499 - roundedSubtotal;
    targetRewardText = 'free delivery';
    message = `Add ₹${neededForNext} more to unlock free delivery`;
  } else if (roundedSubtotal < 999) {
    neededForNext = 999 - roundedSubtotal;
    targetRewardText = '10% off';
    message = `Add ₹${neededForNext} more to unlock 10% off`;
  } else if (roundedSubtotal < 1599) {
    neededForNext = 1599 - roundedSubtotal;
    targetRewardText = '15% off';
    message = `Add ₹${neededForNext} more to unlock 15% off`;
    isUnlocked = true;
  } else if (roundedSubtotal < 2299) {
    neededForNext = 2299 - roundedSubtotal;
    targetRewardText = '20% off';
    message = `Add ₹${neededForNext} more to unlock 20% off`;
    isUnlocked = true;
  } else {
    isUnlocked = true;
    isMaxTier = true;
    targetRewardText = '20% off';
    message = '🎉 Unlocked 20% off! Maximum discount reached!';
  }

  return {
    subtotalINR: roundedSubtotal,
    message,
    targetRewardText,
    neededForNext,
    isUnlocked,
    isMaxTier,
    progressPercent: Math.min(100, Math.max(0, Math.round(progressPercent))),
    milestoneNodes: nodes,
  };
}
