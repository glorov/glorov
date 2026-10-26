import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Clock, CheckCircle2, XCircle, Banknote } from 'lucide-react'
import type { CustomerReturnRequest } from '@/lib/customer'
import { formatINR } from '@/lib/utils'

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
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-800 border-rose-300 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Declined
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Under Review
          </Badge>
        )
    }
  }

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-botanical-700" />
          <CardTitle className="text-base font-bold text-foreground">
            Return & Claim Requests ({returnRequests.length})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        {returnRequests.map((req) => {
          const reqDate = new Date(req.created_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })

          const isRefunded = req.refund_status === 'refunded'
          const isRefundPending = req.refund_status === 'pending'

          return (
            <div
              key={req.id}
              className="p-4 rounded-xl border border-border bg-card space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-foreground">
                    Request reference: {req.id}
                  </span>
                  <p className="text-[11px] text-muted-foreground">Submitted on {reqDate}</p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {/* Items in Request */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Items Requested
                </span>
                <div className="divide-y divide-border text-xs">
                  {req.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-foreground">{it.title}</span>
                        {it.variant_title && (
                          <span className="text-muted-foreground ml-1">({it.variant_title})</span>
                        )}
                        <span className="text-muted-foreground ml-2">Qty: {it.quantity}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {it.reason.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer remarks */}
              {req.customer_notes && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">
                  <span className="font-semibold text-foreground">Your note: </span>
                  <span>{req.customer_notes}</span>
                </div>
              )}

              {/* Seller Decision & Notes */}
              {req.seller_decision && (
                <div className="text-xs bg-earth-50 border border-earth-200 p-3 rounded-lg space-y-1">
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    <span>Seller Resolution:</span>
                    <span className="capitalize text-botanical-800">
                      {req.seller_decision.decision}
                    </span>
                  </div>
                  {(req.seller_decision.customer_note || req.seller_decision.decision_notes) && (
                    <p className="text-muted-foreground">
                      {req.seller_decision.customer_note || req.seller_decision.decision_notes}
                    </p>
                  )}
                  {req.seller_decision.return_shipping_required && (
                    <p className="text-[11px] text-botanical-700 font-medium">
                      Reverse pickup instructions: A courier return label will be arranged by our logistics partner.
                    </p>
                  )}
                </div>
              )}

              {/* Refund Progress Card */}
              {(isRefunded || isRefundPending) && (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-700 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950">
                        {isRefunded
                          ? 'Refund Processed'
                          : 'Refund Approved — Processing'}
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        {isRefunded
                          ? 'The refunded amount has been released to your original payment account.'
                          : 'Payment provider is processing the credit back to your account.'}
                      </p>
                    </div>
                  </div>
                  {req.refund_amount_inr && (
                    <span className="font-extrabold text-emerald-900 text-sm">
                      {formatINR(req.refund_amount_inr * 100)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
