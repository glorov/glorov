import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { returnInventoryTriageSchema } from '@glorov/types'

interface TriageResultItem {
  line_item_id: string
  title: string
  sku?: string
  quantity: number
  condition: string
  restocked: boolean
  adjustment_quantity: number
  inventory_item_id?: string
  location_id?: string
  notes?: string
}

/**
 * POST /admin/orders/:id/return-inventory-triage
 * Handles physical inventory triage for returned packages, RTO shipments, and customer returns.
 *
 * Botanical Invariants:
 * 1. Seeds: Only unopened, undamaged hermetically sealed packets may be restocked to sellable inventory.
 * 2. Damaged Packets: Written off as packaging loss, never restocked.
 * 3. Live Plants: NEVER auto-restocked to sellable inventory. Quarantined for rehabilitation or written off as botanical spoilage.
 * 4. Duplicate Adjustments: Tracked and prevented per line item.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> => {
  const orderId = req.params.id
  if (!orderId) {
    res.status(400).json({ message: 'Order ID is required' })
    return
  }

  const parseResult = returnInventoryTriageSchema.safeParse(req.body)
  if (!parseResult.success) {
    const firstError = parseResult.error.errors[0]?.message || 'Invalid inventory triage data'
    res.status(400).json({ message: firstError })
    return
  }

  const { items: triageItems, triage_notes } = parseResult.data

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: [
        'id',
        'display_id',
        'status',
        'items.id',
        'items.title',
        'items.quantity',
        'items.variant_id',
        'items.variant_sku',
        'items.variant.inventory_items.inventory.id',
        'items.variant.product.metadata',
        'fulfillments.location_id',
        'metadata',
      ],
      filters: { id: orderId },
    })

    const order = orders?.[0]
    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    const orderItemsMap = new Map<string, any>()
    for (const item of (order.items || []) as any[]) {
      if (item && item.id) {
        orderItemsMap.set(item.id, item)
      }
    }

    // Default stock location from fulfillment or query
    const defaultLocationId =
      order.fulfillments?.[0]?.location_id || undefined

    const existingMeta = (order.metadata || {}) as Record<string, unknown>
    const existingTriage = ((existingMeta.inventory_triage || []) as any[])

    // Resolve Inventory Service if any restock is required
    let inventoryService: any
    try {
      inventoryService = req.scope.resolve(Modules.INVENTORY)
    } catch {
      logger.warn('Inventory module not registered in container')
    }

    // Calculate previously restocked quantities per line item
    const previouslyRestockedMap = new Map<string, number>()
    for (const record of existingTriage) {
      const recItems = Array.isArray(record.items) ? record.items : [record]
      for (const it of recItems) {
        if (it.restocked) {
          const prev = previouslyRestockedMap.get(it.line_item_id) || 0
          previouslyRestockedMap.set(
            it.line_item_id,
            prev + (Number(it.adjustment_quantity) || Number(it.quantity) || 0)
          )
        }
      }
    }

    const triageResults: TriageResultItem[] = []
    const stockAdjustments: Array<{
      inventoryItemId: string
      locationId: string
      adjustment: number
    }> = []

    for (const triageItem of triageItems) {
      const orderItem = orderItemsMap.get(triageItem.line_item_id)
      if (!orderItem) {
        res.status(400).json({
          message: `Line item ${triageItem.line_item_id} does not belong to Order #${order.display_id || order.id}`,
        })
        return
      }

      const orderedQty = Number(orderItem.quantity) || 1
      if (triageItem.quantity > orderedQty) {
        res.status(400).json({
          message: `Triage quantity (${triageItem.quantity}) for "${orderItem.title}" exceeds ordered quantity (${orderedQty}).`,
        })
        return
      }

      // Check botanical live plant / perishable invariant: live plants can NEVER be restocked to sellable inventory
      const isPerishable =
        Boolean(orderItem.variant?.product?.metadata?.is_perishable) ||
        String(orderItem.title || '').toLowerCase().includes('plant') ||
        triageItem.condition === 'perishable_spoilage' ||
        triageItem.condition === 'quarantine_salvage'

      if (isPerishable && triageItem.restock) {
        res.status(400).json({
          message: `Botanical invariant violation: Live plants and perishable items ("${orderItem.title}") can NEVER be restocked to sellable inventory. They must be quarantined or written off.`,
        })
        return
      }

      const prevRestocked = previouslyRestockedMap.get(triageItem.line_item_id) || 0
      if (triageItem.restock && prevRestocked >= orderedQty) {
        res.status(409).json({
          message: `Line item ${triageItem.line_item_id} (${orderItem.title}) was already restocked previously (${prevRestocked}/${orderedQty} units). Duplicate inventory adjustment rejected.`,
        })
        return
      }

      if (triageItem.restock && prevRestocked + triageItem.quantity > orderedQty) {
        res.status(400).json({
          message: `Restocking ${triageItem.quantity} units would exceed ordered quantity (${orderedQty}) with ${prevRestocked} already restocked.`,
        })
        return
      }

      const invItemId =
        orderItem.variant?.inventory_items?.[0]?.inventory?.id

      let actuallyRestocked = false
      let adjustmentQty = 0
      let targetLocationId = defaultLocationId

      // Only unopened sealed seeds can be restocked to sellable inventory
      if (
        triageItem.condition === 'unopened_sealed_seeds' &&
        triageItem.restock === true &&
        !isPerishable &&
        invItemId &&
        inventoryService
      ) {
        actuallyRestocked = true
        adjustmentQty = triageItem.quantity

        if (!targetLocationId && inventoryService && invItemId) {
          try {
            const levels = await inventoryService.listInventoryLevels({
              inventory_item_id: invItemId,
            })
            if (levels && levels.length > 0) {
              // Prefer Pune hub if multiple levels exist
              const puneLevel = levels.find((l: any) =>
                String(l.location_id).includes('sloc_01M5TBWRM7FY3DHCYFA8ER21F1')
              )
              targetLocationId = puneLevel?.location_id || levels[0].location_id
            }
          } catch {
            // fallback
          }
        }

        if (!targetLocationId) {
          try {
            const { data: locations } = await query.graph({
              entity: 'stock_location',
              fields: ['id', 'name'],
            })
            const puneLocation = (locations || []).find((l: any) =>
              l.name?.toLowerCase().includes('pune')
            )
            targetLocationId = puneLocation?.id || locations?.[0]?.id
          } catch {
            // fallback
          }
        }

        if (targetLocationId) {
          stockAdjustments.push({
            inventoryItemId: invItemId,
            locationId: targetLocationId,
            adjustment: adjustmentQty,
          })
          previouslyRestockedMap.set(triageItem.line_item_id, prevRestocked + adjustmentQty)
        }
      }

      triageResults.push({
        line_item_id: orderItem.id,
        title: orderItem.title,
        sku: orderItem.variant_sku,
        quantity: triageItem.quantity,
        condition: triageItem.condition,
        restocked: actuallyRestocked,
        adjustment_quantity: adjustmentQty,
        inventory_item_id: invItemId,
        location_id: targetLocationId || defaultLocationId,
        notes: triageItem.notes,
      })
    }

    // Execute batch stock adjustments if any eligible unopened seeds
    if (stockAdjustments.length > 0 && inventoryService) {
      try {
        await inventoryService.adjustInventory(stockAdjustments)
        logger.info(
          `Adjusted inventory for ${stockAdjustments.length} restocked items for Order #${order.display_id || order.id}`
        )
      } catch (adjErr: unknown) {
        const errMsg = adjErr instanceof Error ? adjErr.message : String(adjErr)
        logger.error(`Failed to adjust inventory: ${errMsg}`)
        res.status(502).json({
          message: `Failed to adjust inventory with Medusa inventory service: ${errMsg}`,
        })
        return
      }
    }

    // Record immutable triage record in order metadata
    const actorId =
      (req as unknown as { auth_context?: { actor_id?: string } }).auth_context
        ?.actor_id || 'admin'

    const triageRecord = {
      triage_id: `triage_${Date.now()}`,
      triaged_at: new Date().toISOString(),
      triaged_by: actorId,
      triage_notes: triage_notes || null,
      items: triageResults,
    }

    const orderModule = req.scope.resolve(Modules.ORDER)
    await orderModule.updateOrders([
      {
        id: order.id,
        metadata: {
          ...existingMeta,
          inventory_triage: [...existingTriage, triageRecord],
        },
      },
    ])

    logger.info(
      `Completed inventory triage for Order #${order.display_id || order.id} (${triageResults.length} items evaluated, ${stockAdjustments.length} restocked).`
    )

    res.status(200).json({
      success: true,
      message: 'Physical inventory triage completed and audit record stored.',
      order_id: order.id,
      triage_record: triageRecord,
      restocked_items_count: stockAdjustments.length,
      quarantined_or_loss_items_count: triageResults.length - stockAdjustments.length,
    })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Inventory triage failed'
    logger.error(`Error during return inventory triage for Order ${orderId}: ${errMsg}`)
    res.status(500).json({ message: errMsg })
  }
}
