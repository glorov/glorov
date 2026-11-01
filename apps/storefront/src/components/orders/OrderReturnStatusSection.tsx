import React from 'react'
import { RotateCcw, Clock, CheckCircle2, XCircle, Banknote } from 'lucide-react'
import type { CustomerReturnRequest } from '@/lib/customer'
import { formatINR } from '@/lib/utils'
import styles from './OrderReturnStatusSection.module.css'

interface OrderReturnStatusSectionProps {
  returnRequests: CustomerReturnRequest[]
}

export function OrderReturnStatusSection({
  returnRequests,
}: OrderReturnStatusSectionProps) {
  if (!returnRequests || returnRequests.length === 0) {
    return null
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className={styles.badgeApproved}>
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>Approved</span>
          </span>
        )
      case 'rejected':
        return (
          <span className={styles.badgeDeclined}>
            <XCircle size={13} aria-hidden="true" />
            <span>Declined</span>
          </span>
        )
      default:
        return (
          <span className={styles.badgeReview}>
            <Clock size={13} aria-hidden="true" />
            <span>Under Review</span>
          </span>
        )
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <RotateCcw size={18} style={{ color: 'var(--ugaoo-green)' }} aria-hidden="true" />
          <h3 className={styles.title}>
            Return & Claim Requests ({returnRequests.length})
          </h3>
        </div>
      </div>

      <div className={styles.cardContent}>
        {returnRequests.map((req) => {
          const reqDate = new Date(req.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })

          const isRefunded = req.refund_status === 'refunded'
          const isRefundPending = req.refund_status === 'pending'

          return (
            <div key={req.id} className={styles.requestCard}>
              <div className={styles.requestHeader}>
                <div>
                  <span className={styles.refId}>
                    Request reference: {req.id}
                  </span>
                  <p className={styles.subDate}>Submitted on {reqDate}</p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {/* Items in Request */}
              <div className={styles.itemsSection}>
                <span className={styles.itemsSectionLabel}>
                  Items Requested
                </span>
                <div className={styles.itemsList}>
                  {req.items.map((it, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div>
                        <span className={styles.itemTitle}>{it.title}</span>
                        {it.variant_title && (
                          <span className={styles.itemVariant}>({it.variant_title})</span>
                        )}
                        <span className={styles.itemQty}>Qty: {it.quantity}</span>
                      </div>
                      <span className={styles.reasonBadge}>
                        {it.reason.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer remarks */}
              {req.customer_notes && (
                <div className={styles.customerNoteBox}>
                  <span className={styles.customerNoteLabel}>Your note: </span>
                  <span>{req.customer_notes}</span>
                </div>
              )}

              {/* Seller Decision & Notes */}
              {req.seller_decision && (
                <div className={styles.sellerBox}>
                  <div className={styles.sellerDecisionRow}>
                    <span>Seller Resolution:</span>
                    <span className={styles.decisionName}>
                      {req.seller_decision.decision}
                    </span>
                  </div>
                  {(req.seller_decision.customer_note || req.seller_decision.decision_notes) && (
                    <p className={styles.sellerText}>
                      {req.seller_decision.customer_note || req.seller_decision.decision_notes}
                    </p>
                  )}
                  {req.seller_decision.return_shipping_required && (
                    <p className={styles.pickupNotice}>
                      Reverse pickup instructions: A courier return label will be arranged by our logistics partner.
                    </p>
                  )}
                </div>
              )}

              {/* Refund Progress Card */}
              {(isRefunded || isRefundPending) && (
                <div className={styles.refundBox}>
                  <div className={styles.refundLeft}>
                    <Banknote size={16} color="#059669" aria-hidden="true" />
                    <div>
                      <p className={styles.refundTitle}>
                        {isRefunded
                          ? 'Refund Processed'
                          : 'Refund Approved — Processing'}
                      </p>
                      <p className={styles.refundDesc}>
                        {isRefunded
                          ? 'The refunded amount has been released to your original payment account.'
                          : 'Payment provider is processing the credit back to your account.'}
                      </p>
                    </div>
                  </div>
                  {req.refund_amount_inr && (
                    <span className={styles.refundAmount}>
                      {formatINR(req.refund_amount_inr * 100)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
