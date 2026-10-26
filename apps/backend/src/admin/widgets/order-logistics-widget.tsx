import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types";
import { Container, Heading, Text, Badge } from "@medusajs/ui";

const OrderLogisticsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const order = data;
  const shippingAddress = order?.shipping_address;
  const fulfillments = (order?.fulfillments || []) as any[];
  const shippingMethods = (order?.shipping_methods || []) as any[];
  const paymentCollections = (order?.payment_collections || []) as any[];

  // Determine payment provider (Razorpay vs COD vs System)
  let paymentProviderId = "pp_system_default";
  let isCod = false;
  let isRazorpay = false;

  for (const pc of paymentCollections) {
    for (const p of pc.payments || []) {
      if (p.provider_id) {
        paymentProviderId = p.provider_id;
        if (p.provider_id.includes("cod")) isCod = true;
        if (p.provider_id.includes("razorpay")) isRazorpay = true;
      }
    }
  }

  // Check shipping methods for COD hints if payment collection is pending
  if (!isCod && shippingMethods.some((sm) => sm.name?.toLowerCase().includes("cod"))) {
    isCod = true;
  }

  // Retrieve latest fulfillment & tracking info
  const activeFulfillment = fulfillments.length > 0 ? fulfillments[fulfillments.length - 1] : null;
  const fulfillmentData = (activeFulfillment?.data || {}) as Record<string, any>;
  const awbCode =
    activeFulfillment?.labels?.[0]?.tracking_number ||
    fulfillmentData?.awb_code ||
    fulfillmentData?.tracking_number;
  const courierName =
    fulfillmentData?.courier_name ||
    (activeFulfillment ? "Delhivery Botanical Express (Shiprocket)" : "Awaiting Dispatch");
  const trackingUrl =
    activeFulfillment?.labels?.[0]?.tracking_url ||
    fulfillmentData?.tracking_url ||
    (awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null);

  const formatCurrency = (amountPaise?: number) => {
    if (typeof amountPaise !== "number") return "₹0.00";
    return `₹${(amountPaise / 100).toFixed(2)}`;
  };

  const getFulfillmentBadgeColor = (status?: string) => {
    switch (status) {
      case "fulfilled":
      case "delivered":
        return "green";
      case "partially_fulfilled":
      case "shipped":
        return "blue";
      case "canceled":
        return "red";
      default:
        return "orange";
    }
  };

  const getPaymentBadgeColor = (status?: string) => {
    switch (status) {
      case "captured":
        return "green";
      case "authorized":
        return "blue";
      case "refunded":
      case "canceled":
        return "red";
      default:
        return "orange";
    }
  };

  return (
    <Container className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Heading level="h2" className="text-base font-semibold text-ui-fg-base flex items-center gap-2">
            <span>🚚</span> Indian Logistics & Seed Dispatch Hub
          </Heading>
          <Text className="text-sm text-ui-fg-subtle mt-1">
            Shiprocket AWB tracking, Indian payment verification, and seed packet packing checklist.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          {isCod ? (
            <Badge color="orange">Cash on Delivery (COD)</Badge>
          ) : isRazorpay ? (
            <Badge color="green">Prepaid (Razorpay)</Badge>
          ) : (
            <Badge color="grey">Prepaid Online</Badge>
          )}
          <Badge color={getPaymentBadgeColor(order?.payment_status)}>
            Payment: {(order?.payment_status || "Pending").toUpperCase()}
          </Badge>
          <Badge color={getFulfillmentBadgeColor(order?.fulfillment_status)}>
            Fulfillment: {(order?.fulfillment_status || "Not Fulfilled").replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Logistics Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t border-b border-ui-border-base text-sm">
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Courier / Aggregator
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {activeFulfillment ? courierName : "Shiprocket India"}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            AWB Tracking Number
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {awbCode ? (
              <span className="font-mono text-ui-fg-interactive">{awbCode}</span>
            ) : (
              <span className="text-ui-fg-muted italic">Pending Fulfillment</span>
            )}
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Destination PIN Code
          </Text>
          <Text className="font-semibold text-ui-fg-base mt-1">
            {shippingAddress?.postal_code || "—"} ({shippingAddress?.city || "—"},{" "}
            {shippingAddress?.province || "—"})
          </Text>
        </div>
        <div>
          <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
            Live Tracking
          </Text>
          <div className="mt-1">
            {trackingUrl ? (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-ui-fg-interactive hover:underline inline-flex items-center gap-1"
              >
                Track on Shiprocket ↗
              </a>
            ) : (
              <Text className="text-xs text-ui-fg-muted italic">Available upon fulfillment</Text>
            )}
          </div>
        </div>
      </div>

      {/* Financial & Payment Reconciliation Advisory */}
      <div className="mt-4 p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle text-sm">
        {isCod ? (
          <div className="flex items-start gap-2">
            <span className="text-amber-500 text-lg leading-none">⚠️</span>
            <div>
              <Text className="font-semibold text-ui-fg-base">
                Cash on Delivery Collection Required: {formatCurrency(order?.total)}
              </Text>
              <Text className="text-xs text-ui-fg-subtle mt-0.5">
                Instruct the courier delivery partner to collect the exact invoice amount in cash prior to
                handing over the packet. Ensure COD remittance is reconciled once Shiprocket reports delivery.
              </Text>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span className="text-emerald-500 text-lg leading-none">✅</span>
            <div>
              <Text className="font-semibold text-ui-fg-base">
                Prepaid Order Verified: {formatCurrency(order?.total)}
              </Text>
              <Text className="text-xs text-ui-fg-subtle mt-0.5">
                Full order value captured online via Razorpay. No cash collection required from customer at
                delivery.
              </Text>
            </div>
          </div>
        )}
      </div>

      {/* Seed Quality & Packing Checklist */}
      <div className="mt-4 pt-3 border-t border-ui-border-base">
        <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider mb-2">
          Seed Dispatch & Viability Quality Checklist
        </Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-ui-fg-subtle">
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Airtight aluminium foil moisture pouch heat-sealed with desiccant.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Botanical cultivation guide & sowing instructions sheet inserted.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Seed lot number, test date, and 18-month viability date stamped.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>Cushioned bubble envelope used to prevent seed crushing in courier transit.</span>
          </div>
        </div>
      </div>

      {/* Cancellation Audit Information */}
      {order?.status === "canceled" && (
        <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg leading-none">🛑</span>
            <div className="w-full">
              <div className="flex items-center justify-between">
                <Text className="font-semibold text-red-900">
                  Order Canceled & Stock Released
                </Text>
                <Badge color="red">Canceled</Badge>
              </div>
              <Text className="text-xs text-red-800 mt-1">
                Reason: {(order.metadata?.cancellation as any)?.reason || "Order canceled per customer request."}
              </Text>
              {(order.metadata?.cancellation as any)?.customer_note && (
                <Text className="text-xs text-red-700 italic mt-0.5">
                  Customer note: "{(order.metadata?.cancellation as any).customer_note}"
                </Text>
              )}
              <Text className="text-[11px] text-red-600 mt-1">
                Canceled at: {(order.metadata?.cancellation as any)?.canceled_at || "—"} | Handled by: {(order.metadata?.cancellation as any)?.canceled_by || "system"}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Customer Return Requests Section */}
      {Array.isArray((order?.metadata as any)?.return_requests) &&
        ((order?.metadata as any).return_requests.length > 0) && (
          <div className="mt-4 pt-3 border-t border-ui-border-base">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider">
                Customer Return Requests ({((order?.metadata as any).return_requests).length})
              </Text>
              <Badge color="orange">Review Required</Badge>
            </div>
            <div className="space-y-3">
              {((order?.metadata as any).return_requests as any[]).map((req, idx) => (
                <div
                  key={req.id || idx}
                  className="p-3 rounded-lg border border-ui-border-base bg-ui-bg-subtle text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-ui-fg-base">
                      Request ID: {req.id}
                    </span>
                    <Badge
                      color={
                        req.status === "approved"
                          ? "green"
                          : req.status === "rejected"
                          ? "red"
                          : "orange"
                      }
                    >
                      {String(req.status || "pending_review").replace(/_/g, " ").toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-ui-fg-muted">Requested Items: </span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-ui-fg-base">
                      {(req.items || []).map((it: any, iIdx: number) => (
                        <li key={iIdx}>
                          <span className="font-semibold">{it.title}</span> (Qty: {it.quantity}) — Reason:{" "}
                          <span className="text-ui-fg-interactive">{it.reason?.replace(/_/g, " ")}</span>
                          {it.customer_note && <span className="italic"> ("{it.customer_note}")</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {req.customer_notes && (
                    <Text className="text-ui-fg-subtle italic">
                      Customer remarks: "{req.customer_notes}"
                    </Text>
                  )}
                  {req.seller_decision && (
                    <div className="p-2 rounded bg-ui-bg-base border border-ui-border-base">
                      <span className="font-semibold text-ui-fg-base">
                        Seller Decision ({req.seller_decision.decision}):
                      </span>{" "}
                      <span className="text-ui-fg-subtle">{req.seller_decision.decision_notes}</span>
                      {req.seller_decision.return_action && (
                        <span className="block text-[11px] text-ui-fg-muted mt-0.5">
                          Action: {req.seller_decision.return_action} | Reverse shipping:{" "}
                          {req.seller_decision.return_shipping_required ? "Yes" : "No"}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-ui-fg-muted pt-1">
                    <span>Requested: {new Date(req.created_at).toLocaleString("en-IN")}</span>
                    <span>
                      Refund Status:{" "}
                      <strong className="text-ui-fg-base">
                        {String(req.refund_status || "not_applicable").toUpperCase()}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* COD Bank Transfer Refund Settlements */}
      {Array.isArray((order?.metadata as any)?.cod_refunds) &&
        ((order?.metadata as any).cod_refunds.length > 0) && (
          <div className="mt-4 pt-3 border-t border-ui-border-base">
            <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider mb-2">
              COD Direct Bank Payout Settlements
            </Text>
            <div className="space-y-2">
              {((order?.metadata as any).cod_refunds as any[]).map((payout, pIdx) => (
                <div
                  key={payout.payout_id || pIdx}
                  className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs text-emerald-950 space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>Bank Payout Ref: {payout.payout_id}</span>
                    <Badge color="green">Settled: ₹{Number(payout.amount_inr || 0).toFixed(2)}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-emerald-800">Bank UTR:</span>{" "}
                      <span className="font-mono font-bold">{payout.bank_utr}</span>
                    </div>
                    <div>
                      <span className="text-emerald-800">Account:</span>{" "}
                      <span className="font-mono">{payout.bank_account_masked}</span>
                    </div>
                    <div>
                      <span className="text-emerald-800">IFSC:</span>{" "}
                      <span className="font-mono">{payout.bank_ifsc}</span>
                    </div>
                    <div>
                      <span className="text-emerald-800">Beneficiary:</span> {payout.account_holder_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Physical Inventory Triage Audit Log */}
      {Array.isArray((order?.metadata as any)?.inventory_triage) &&
        ((order?.metadata as any).inventory_triage.length > 0) && (
          <div className="mt-4 pt-3 border-t border-ui-border-base">
            <Text className="text-xs font-medium text-ui-fg-muted uppercase tracking-wider mb-2">
              Botanical Return Inspection & Inventory Triage Log
            </Text>
            <div className="space-y-2">
              {((order?.metadata as any).inventory_triage as any[]).map((triage, tIdx) => (
                <div
                  key={triage.triage_id || tIdx}
                  className="p-2.5 rounded-lg border border-ui-border-base bg-ui-bg-subtle text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ui-fg-base">
                      Triage #{triage.triage_id} ({new Date(triage.triaged_at).toLocaleString("en-IN")})
                    </span>
                    <span className="text-[11px] text-ui-fg-muted">
                      Inspector: {triage.triaged_by}
                    </span>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    {(triage.items || []).map((it: any, iIdx: number) => (
                      <div key={iIdx} className="text-[11px] flex items-center justify-between text-ui-fg-subtle">
                        <span>
                          {it.title} (Qty: {it.quantity}) — Condition:{" "}
                          <strong className="text-ui-fg-base">{it.condition?.replace(/_/g, " ")}</strong>
                        </span>
                        <span>
                          {it.restocked ? (
                            <span className="text-green-700 font-semibold">✓ Restocked (+{it.adjustment_quantity})</span>
                          ) : (
                            <span className="text-amber-700 font-medium">⚠️ Quarantined / Scrapped</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.after",
});

export default OrderLogisticsWidget;

