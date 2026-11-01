'use client'

import React from 'react'
import { calculateMilestoneProgress } from '@/lib/cart-promotions'
import styles from './CartMilestoneMeter.module.css'

interface CartMilestoneMeterProps {
  subtotalINR: number
}

export function CartMilestoneMeter({ subtotalINR }: CartMilestoneMeterProps) {
  const { message, targetRewardText, progressPercent, milestoneNodes, isMaxTier } =
    calculateMilestoneProgress(subtotalINR)

  // Split message to bold the target reward (e.g. "free delivery", "10% off", etc.)
  const renderMessage = () => {
    if (isMaxTier) {
      return (
        <span className={styles.messageText}>
          {message}
        </span>
      )
    }

    if (!targetRewardText) {
      return <span className={styles.messageText}>{message}</span>
    }

    const parts = message.split(targetRewardText)
    return (
      <span className={styles.messageText}>
        {parts[0]}
        <strong className={styles.rewardHighlight}>{targetRewardText}</strong>
        {parts[1] || ''}
      </span>
    )
  }

  return (
    <div className={styles.meterContainer}>
      <div className={styles.messageRow}>
        {renderMessage()}
      </div>

      <div
        className={styles.trackWrapper}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Milestone progress: ${progressPercent}%`}
      >
        {/* Continuous Track Bar */}
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Circular Milestone Nodes Along the Bar */}
        <div className={styles.nodesOverlay}>
          {milestoneNodes.map((node) => {
            const isUnlocked = node.isReached
            return (
              <div
                key={node.key}
                className={`${styles.nodeWrap} ${isUnlocked ? styles.nodeUnlocked : ''} ${
                  node.isCurrentTarget ? styles.nodeTarget : ''
                }`}
                style={{ left: `${node.positionPercent}%` }}
                title={`${node.label} off at ₹${node.targetSpendINR}`}
              >
                <div className={styles.nodeCircle}>
                  <span className={styles.nodeLabel}>{node.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
