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
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.after",
});

export default OrderLogisticsWidget;
