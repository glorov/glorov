import { MonitoringAlertThresholds } from '@glorov/types'

export interface OperationalAlert {
  name: string
  severity: 'warning' | 'critical'
  message: string
  currentValue: number
  threshold: number
  triggeredAt: string
}

export interface MetricsSnapshot {
  uptime_seconds: number
  requests_total: number
  errors_total: number
  error_rate_percent: number
  p95_latency_ms: number
  avg_latency_ms: number
  payment_failures_total: number
  shipment_failures_total: number
  webhook_failures_total: number
  notification_failures_total: number
  checkout_errors_total: number
  status_codes: Record<string, number>
  active_alerts: OperationalAlert[]
  thresholds: MonitoringAlertThresholds
}

export class MetricsCollector {
  private startTime = Date.now()
  private requestsTotal = 0
  private errorsTotal = 0
  private paymentFailuresTotal = 0
  private shipmentFailuresTotal = 0
  private webhookFailuresTotal = 0
  private notificationFailuresTotal = 0
  private checkoutErrorsTotal = 0
  private statusCodes: Record<string, number> = {}
  private latencies: number[] = []
  private maxLatencySamples = 500
  private customThresholds?: Partial<MonitoringAlertThresholds>

  constructor(customThresholds?: Partial<MonitoringAlertThresholds>) {
    this.customThresholds = customThresholds
  }

  private getThresholds(): MonitoringAlertThresholds {
    const defaults = {
      latencyP95Ms: Number(process.env.ALERT_LATENCY_P95_MS) || 2000,
      errorRatePercent: Number(process.env.ALERT_ERROR_RATE_PERCENT) || 5,
      paymentFailureThresholdHourly: Number(process.env.ALERT_PAYMENT_FAILURE_THRESHOLD_HOURLY) || 5,
      shipmentFailureThresholdHourly: Number(process.env.ALERT_SHIPMENT_FAILURE_THRESHOLD_HOURLY) || 3,
      webhookFailureThresholdHourly: Number(process.env.ALERT_WEBHOOK_FAILURE_THRESHOLD_HOURLY) || 5,
      notificationFailureThresholdHourly: Number(process.env.ALERT_NOTIFICATION_FAILURE_THRESHOLD_HOURLY) || 5,
      checkoutRetryThreshold: Number(process.env.ALERT_CHECKOUT_RETRY_THRESHOLD) || 3,
    }
    return {
      ...defaults,
      ...this.customThresholds,
    }
  }

  public recordRequest(statusCode: number, durationMs: number): void {
    this.requestsTotal++
    const codeKey = String(statusCode)
    this.statusCodes[codeKey] = (this.statusCodes[codeKey] || 0) + 1

    if (statusCode >= 400) {
      this.errorsTotal++
    }

    if (this.latencies.length >= this.maxLatencySamples) {
      this.latencies.shift()
    }
    this.latencies.push(durationMs)
  }

  public recordHttpError(statusCode: number, _code?: string): void {
    const codeKey = String(statusCode)
    this.statusCodes[codeKey] = (this.statusCodes[codeKey] || 0) + 1
    this.errorsTotal++
  }

  public recordPaymentFailure(_reason?: string): void {
    this.paymentFailuresTotal++
  }

  public recordShipmentFailure(_reason?: string): void {
    this.shipmentFailuresTotal++
  }

  public recordWebhookFailure(_source?: string, _reason?: string): void {
    this.webhookFailuresTotal++
  }

  public recordNotificationFailure(_template?: string, _reason?: string): void {
    this.notificationFailuresTotal++
  }

  public recordCheckoutError(_reason?: string): void {
    this.checkoutErrorsTotal++
  }

  public calculateP95Latency(): number {
    if (this.latencies.length === 0) return 0
    const sorted = [...this.latencies].sort((a, b) => a - b)
    const index = Math.ceil(0.95 * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  public calculateAvgLatency(): number {
    if (this.latencies.length === 0) return 0
    const sum = this.latencies.reduce((acc, v) => acc + v, 0)
    return Math.round(sum / this.latencies.length)
  }

  public evaluateAlerts(): OperationalAlert[] {
    const thresholds = this.getThresholds()
    const alerts: OperationalAlert[] = []
    const now = new Date().toISOString()

    const p95 = this.calculateP95Latency()
    if (p95 > thresholds.latencyP95Ms && this.latencies.length >= 10) {
      alerts.push({
        name: 'HighResponseLatency',
        severity: 'warning',
        message: `P95 response latency (${p95}ms) exceeds configured alert threshold (${thresholds.latencyP95Ms}ms)`,
        currentValue: p95,
        threshold: thresholds.latencyP95Ms,
        triggeredAt: now,
      })
    }

    const errorRate = this.requestsTotal > 0 ? (this.errorsTotal / this.requestsTotal) * 100 : 0
    if (errorRate > thresholds.errorRatePercent && this.requestsTotal >= 20) {
      alerts.push({
        name: 'HighErrorRate',
        severity: 'critical',
        message: `Application error rate (${errorRate.toFixed(1)}%) exceeds threshold (${thresholds.errorRatePercent}%)`,
        currentValue: Number(errorRate.toFixed(1)),
        threshold: thresholds.errorRatePercent,
        triggeredAt: now,
      })
    }

    if (this.paymentFailuresTotal >= thresholds.paymentFailureThresholdHourly) {
      alerts.push({
        name: 'ElevatedPaymentFailures',
        severity: 'critical',
        message: `Payment failures count (${this.paymentFailuresTotal}) exceeded alert threshold (${thresholds.paymentFailureThresholdHourly})`,
        currentValue: this.paymentFailuresTotal,
        threshold: thresholds.paymentFailureThresholdHourly,
        triggeredAt: now,
      })
    }

    if (this.shipmentFailuresTotal >= thresholds.shipmentFailureThresholdHourly) {
      alerts.push({
        name: 'ElevatedShipmentFailures',
        severity: 'warning',
        message: `Shipment dispatch failures count (${this.shipmentFailuresTotal}) exceeded threshold (${thresholds.shipmentFailureThresholdHourly})`,
        currentValue: this.shipmentFailuresTotal,
        threshold: thresholds.shipmentFailureThresholdHourly,
        triggeredAt: now,
      })
    }

    if (this.webhookFailuresTotal >= thresholds.webhookFailureThresholdHourly) {
      alerts.push({
        name: 'ElevatedWebhookFailures',
        severity: 'warning',
        message: `Inbound webhook failures (${this.webhookFailuresTotal}) exceeded threshold (${thresholds.webhookFailureThresholdHourly})`,
        currentValue: this.webhookFailuresTotal,
        threshold: thresholds.webhookFailureThresholdHourly,
        triggeredAt: now,
      })
    }

    if (this.notificationFailuresTotal >= thresholds.notificationFailureThresholdHourly) {
      alerts.push({
        name: 'ElevatedNotificationFailures',
        severity: 'warning',
        message: `Email notification delivery failures (${this.notificationFailuresTotal}) exceeded threshold (${thresholds.notificationFailureThresholdHourly})`,
        currentValue: this.notificationFailuresTotal,
        threshold: thresholds.notificationFailureThresholdHourly,
        triggeredAt: now,
      })
    }

    if (this.checkoutErrorsTotal >= thresholds.checkoutRetryThreshold * 3) {
      alerts.push({
        name: 'RepeatedCheckoutFailures',
        severity: 'critical',
        message: `Checkout errors count (${this.checkoutErrorsTotal}) indicates systemic checkout failure`,
        currentValue: this.checkoutErrorsTotal,
        threshold: thresholds.checkoutRetryThreshold * 3,
        triggeredAt: now,
      })
    }

    return alerts
  }

  public getSnapshot(): MetricsSnapshot {
    const errorRate = this.requestsTotal > 0 ? (this.errorsTotal / this.requestsTotal) * 100 : 0
    return {
      uptime_seconds: Math.floor((Date.now() - this.startTime) / 1000),
      requests_total: this.requestsTotal,
      errors_total: this.errorsTotal,
      error_rate_percent: Number(errorRate.toFixed(2)),
      p95_latency_ms: this.calculateP95Latency(),
      avg_latency_ms: this.calculateAvgLatency(),
      payment_failures_total: this.paymentFailuresTotal,
      shipment_failures_total: this.shipmentFailuresTotal,
      webhook_failures_total: this.webhookFailuresTotal,
      notification_failures_total: this.notificationFailuresTotal,
      checkout_errors_total: this.checkoutErrorsTotal,
      status_codes: { ...this.statusCodes },
      active_alerts: this.evaluateAlerts(),
      thresholds: this.getThresholds(),
    }
  }

  public reset(): void {
    this.requestsTotal = 0
    this.errorsTotal = 0
    this.paymentFailuresTotal = 0
    this.shipmentFailuresTotal = 0
    this.webhookFailuresTotal = 0
    this.notificationFailuresTotal = 0
    this.checkoutErrorsTotal = 0
    this.statusCodes = {}
    this.latencies = []
    this.startTime = Date.now()
  }
}

export const metricsCollector = new MetricsCollector()
export { MetricsCollector as OperationalMetrics }
