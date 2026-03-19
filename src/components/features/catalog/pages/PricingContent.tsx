'use client'

import { Button } from '@/components/ui/button'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useGetPlansQuery } from '@/store/features/plans/plansApi'
import { useValidateCouponMutation } from '@/store/features/promotions/promotionsApi'
import { useAppSelector } from '@/store/hooks'
import { useMemo, useState } from 'react'

export function PricingContent() {
  const actorType = useAppSelector((state) => state.auth.actorType)
  const { data, isLoading } = useGetPlansQuery()
  const [validateCoupon, { isLoading: isValidating }] =
    useValidateCouponMutation()

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly',
  )
  const [coupon, setCoupon] = useState('')
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)

  const plans = useMemo(
    () =>
      (data?.data ?? []).filter(
        (plan) => !plan.billingCycle || plan.billingCycle === billingCycle,
      ),
    [billingCycle, data?.data],
  )

  const handleCouponCheck = async () => {
    if (!coupon.trim()) {
      setCouponError('Enter a coupon code to validate.')
      setCouponMessage(null)
      return
    }

    setCouponError(null)
    setCouponMessage(null)

    try {
      const response = await validateCoupon({ code: coupon.trim() }).unwrap()
      const result = response.data

      if (result.valid) {
        setCouponMessage(result.message || `${result.code} is valid.`)
      } else {
        setCouponError(result.message || `${result.code} is not valid.`)
      }
    } catch (submitError) {
      setCouponError(formatApiErrorMessage(submitError))
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-3xl font-semibold">
          Simple plans for every reader
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a billing cycle and start your reading journey with premium
          access.
        </p>

        <div className="mt-4 inline-flex rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`rounded px-3 py-1 text-sm ${billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : ''}`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`rounded px-3 py-1 text-sm ${billingCycle === 'yearly' ? 'bg-primary text-primary-foreground' : ''}`}
          >
            Yearly
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-xl border border-border bg-muted/40"
              />
            ))
          : plans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h2 className="text-xl font-semibold">{plan.name}</h2>
                <p className="mt-2 text-3xl font-semibold">${plan.price}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.billingCycle || billingCycle}
                </p>
                <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                  {(plan.features || []).map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <Button className="mt-4 w-full">
                  {actorType ? 'Go to checkout' : 'Register to continue'}
                </Button>
              </article>
            ))}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Have a coupon?</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
            className="h-10 flex-1 rounded-md border border-input bg-background px-3"
            placeholder="Enter coupon code"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleCouponCheck}
            disabled={isValidating}
          >
            {isValidating ? 'Checking...' : 'Validate'}
          </Button>
        </div>
        {couponMessage ? (
          <p className="mt-2 text-sm text-primary">{couponMessage}</p>
        ) : null}
        {couponError ? (
          <p className="mt-2 text-sm text-destructive">{couponError}</p>
        ) : null}
      </section>
    </div>
  )
}
