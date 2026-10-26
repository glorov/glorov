import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  MapPin,
  User,
  ArrowRight,
  Sprout,
  Calendar,
  PlusCircle,
} from 'lucide-react'
import { getCurrentCustomerAction, getCustomerOrdersAction } from '@/lib/customer-actions'
import { AccountNav } from '@/components/account/AccountNav'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AccountDashboardPage() {
  const customerRes = await getCurrentCustomerAction()
  if (!customerRes.success || !customerRes.customer) {
    redirect('/account/login')
  }

  const customer = customerRes.customer
  const ordersRes = await getCustomerOrdersAction()
  const orders = ordersRes.orders || []
  const recentOrders = orders.slice(0, 3)

  const defaultShippingAddress =
    customer.addresses.find((a) => a.is_default_shipping) || customer.addresses[0]

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-6xl">
      {/* Header Greeting */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-botanical-700 uppercase tracking-wider mb-1">
          <Sprout className="h-4 w-4" />
          <span>Verified Customer Account</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Welcome back, {customer.first_name || 'Gardener'}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your botanical orders, delivery destinations, and profile settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Navigation Sidebar */}
        <AccountNav />

        {/* Main Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Total Orders</span>
                  <Package className="h-4 w-4 text-botanical-700" />
                </div>
                <CardTitle className="text-2xl font-bold">{orders.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-1 text-botanical-700 hover:underline font-medium"
                >
                  View order history <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Saved Addresses</span>
                  <MapPin className="h-4 w-4 text-botanical-700" />
                </div>
                <CardTitle className="text-2xl font-bold">{customer.addresses.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <Link
                  href="/account/addresses"
                  className="inline-flex items-center gap-1 text-botanical-700 hover:underline font-medium"
                >
                  Manage addresses <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Contact Profile</span>
                  <User className="h-4 w-4 text-botanical-700" />
                </div>
                <div className="truncate text-sm font-semibold mt-1">{customer.email}</div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {customer.phone || 'No phone set'} •{' '}
                <Link
                  href="/account/profile"
                  className="text-botanical-700 hover:underline font-medium"
                >
                  Edit profile
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Default Shipping Address Banner */}
          <Card className="border-earth-200 bg-earth-50/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-botanical-900">
                  <MapPin className="h-4 w-4 text-botanical-700" />
                  Primary Delivery Address
                </CardTitle>
                <Link
                  href="/account/addresses"
                  className="text-xs text-botanical-700 hover:underline font-medium"
                >
                  {defaultShippingAddress ? 'Change default' : 'Add address'}
                </Link>
              </div>
            </CardHeader>
            <CardContent className="text-sm">
              {defaultShippingAddress ? (
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">
                    {defaultShippingAddress.first_name} {defaultShippingAddress.last_name}
                    {defaultShippingAddress.phone && (
                      <span className="font-normal text-muted-foreground ml-2">
                        ({defaultShippingAddress.phone})
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    {defaultShippingAddress.address_1}
                    {defaultShippingAddress.address_2 && `, ${defaultShippingAddress.address_2}`}
                  </p>
                  <p className="text-muted-foreground">
                    {defaultShippingAddress.city}, {defaultShippingAddress.province} -{' '}
                    <span className="font-medium text-foreground">
                      {defaultShippingAddress.postal_code}
                    </span>
                    , India
                  </p>
                </div>
              ) : (
                <div className="py-2 text-muted-foreground flex items-center justify-between">
                  <span>No delivery addresses saved yet.</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/account/addresses">
                      <PlusCircle className="mr-1 h-3.5 w-3.5" />
                      Add Address
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-botanical-700" />
                Recent Orders
              </h2>
              {orders.length > 0 && (
                <Link
                  href="/account/orders"
                  className="text-xs font-semibold text-botanical-700 hover:underline flex items-center gap-1"
                >
                  View all ({orders.length}) <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <Card className="text-center py-12 px-4">
                <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">
                  No orders placed yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  Explore our collection of high-germination Desi seeds, potted indoor air-purifying
                  plants, and organic gardening supplies.
                </p>
                <Button asChild className="bg-botanical-700 hover:bg-botanical-800 text-white">
                  <Link href="/categories/seeds">Start Shopping</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const formattedDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'

                  return (
                    <Card
                      key={order.id}
                      className="hover:border-botanical-300 transition-colors shadow-sm"
                    >
                      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-bold text-sm text-foreground">
                              Order #{order.display_id || order.id.slice(-6)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formattedDate}
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                order.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }
                            >
                              {order.status || 'Processing'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.items?.length || 0} item
                            {(order.items?.length || 0) !== 1 ? 's' : ''}:{' '}
                            {order.items?.map((i) => i.title).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground block">Total</span>
                            <span className="text-sm font-bold text-foreground">
                              {formatINR(order.total || 0)}
                            </span>
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/account/orders/${order.id}`}>
                              Details
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
