'use client'

import {
  AlertTriangle,
  CreditCard,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useCreateMyPaymentMethodPortalSessionMutation,
  useGetMyPaymentMethodQuery,
  useGetMyPaymentsQuery,
  type MyPaymentSummary,
} from '@/store/features/payments/paymentsApi'
import {
  useCancelMySubscriptionMutation,
  useDowngradeMySubscriptionMutation,
  useGetMySubscriptionQuery,
  useGetPlansQuery,
  useInitiateStripePaymentMutation,
  useRenewMySubscriptionMutation,
  useRetryMySubscriptionPaymentMutation,
  useUpgradeMySubscriptionMutation,
  type PlanSummary,
} from '@/store/features/subscriptions/subscriptionsApi'

import {
  asMoney,
  BusyIcon,
  bySortOrder,
  formatDateLabel,
  formatStateLabel,
  getStatusToneClass,
  Modal,
  SettingsCard,
  SettingsPageHeader,
} from '@/components/settings/SettingsShared'

const formatPaymentDate = (value: string) => {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleDateString()
}

const statusToneClass = (status: MyPaymentSummary['status']) => {
  switch (status) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    case 'pending':
    case 'initiated':
      return 'bg-amber-100 text-amber-700'
    case 'refunded':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const createReceiptFile = (payment: MyPaymentSummary, planName?: string) => {
  const receiptContent = [
    'STACKREAD RECEIPT',
    '-------------------------',
    `Receipt ID: ${payment.reference}`,
    `Plan: ${planName ?? 'Subscription'}`,
    `Date: ${new Date(payment.createdAt).toLocaleString()}`,
    `Status: ${formatStateLabel(payment.status)}`,
    `Gateway: ${payment.gateway}`,
    `Amount: ${asMoney(payment.payableAmount, payment.currency)}`,
    payment.discountAmount > 0
      ? `Discount: ${asMoney(payment.discountAmount, payment.currency)}`
      : null,
    payment.providerPaymentId
      ? `Provider Reference: ${payment.providerPaymentId}`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `receipt-${payment.reference}.txt`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function SubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelImmediately, setCancelImmediately] = useState(false)

  const { data: subscriptionResponse, isFetching: isSubscriptionLoading } =
    useGetMySubscriptionQuery(undefined, {
      pollingInterval: 15_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    })
  const { data: plansResponse, isFetching: isPlansLoading } = useGetPlansQuery()
  const { data: paymentMethodResponse, isFetching: isPaymentMethodLoading } =
    useGetMyPaymentMethodQuery(undefined, {
      pollingInterval: 15_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    })
  const { data: paymentsResponse, isFetching: isPaymentHistoryLoading } =
    useGetMyPaymentsQuery(undefined, {
      pollingInterval: 20_000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    })

  const [cancelMySubscription, { isLoading: isCancelling }] =
    useCancelMySubscriptionMutation()
  const [renewMySubscription, { isLoading: isRenewing }] =
    useRenewMySubscriptionMutation()
  const [upgradeMySubscription, { isLoading: isUpgrading }] =
    useUpgradeMySubscriptionMutation()
  const [downgradeMySubscription, { isLoading: isDowngrading }] =
    useDowngradeMySubscriptionMutation()
  const [retryMySubscriptionPayment, { isLoading: isRetrying }] =
    useRetryMySubscriptionPaymentMutation()
  const [initiateStripePayment, { isLoading: isInitiatingPayment }] =
    useInitiateStripePaymentMutation()
  const [openPaymentMethodPortal, { isLoading: isOpeningPortal }] =
    useCreateMyPaymentMethodPortalSessionMutation()

  const subscription = subscriptionResponse?.data ?? null
  const paymentMethod = paymentMethodResponse?.data
  const paymentHistory = paymentsResponse?.data ?? []

  const plans = useMemo(
    () => [...(plansResponse?.data ?? [])].sort(bySortOrder),
    [plansResponse?.data],
  )

  const currentPlan = subscription?.planId
    ? plans.find((plan) => plan.id === subscription.planId)
    : undefined

  const changeablePlans = plans.filter(
    (plan) => !subscription || plan.id !== subscription.planId,
  )

  const selectedPlan = changeablePlans.find(
    (plan) => plan.id === selectedPlanId,
  )

  const upgradePlan = currentPlan
    ? changeablePlans.find((plan) => plan.price > currentPlan.price)
    : changeablePlans.find((plan) => !plan.isFree)

  const downgradePlan = currentPlan
    ? changeablePlans
        .filter((plan) => plan.price < currentPlan.price)
        .sort((a, b) => b.price - a.price)[0]
    : changeablePlans.find((plan) => plan.isFree)

  const latestFailedPayment = paymentHistory.find(
    (payment) => payment.status === 'failed',
  )
  const paymentMethodShortLabel =
    paymentMethod?.brand && paymentMethod?.last4
      ? `${paymentMethod.brand} | **** ${paymentMethod.last4}`
      : (paymentMethod?.label ?? 'No payment method on file')
  const paymentMethodExpiryLabel =
    typeof paymentMethod?.expMonth === 'number' &&
    typeof paymentMethod?.expYear === 'number'
      ? `Expires ${String(paymentMethod.expMonth).padStart(2, '0')}/${paymentMethod.expYear}`
      : null

  const isBusy =
    isCancelling ||
    isRenewing ||
    isUpgrading ||
    isDowngrading ||
    isInitiatingPayment ||
    isRetrying ||
    isOpeningPortal

  const isActiveSubscription = subscription?.status === 'active'
  const isFreeCurrentPlan = Boolean(currentPlan?.isFree)
  const canRetryPayment = Boolean(
    subscription?.pendingInvoiceId && subscription.retryStatus !== 'processing',
  )

  const retrySummary = subscription
    ? [
        subscription.retryStatus
          ? formatStateLabel(subscription.retryStatus)
          : null,
        typeof subscription.retryAttemptCount === 'number'
          ? `Attempts: ${subscription.retryAttemptCount}`
          : null,
      ].filter(Boolean)
    : []

  const handleRenew = async () => {
    if (!isActiveSubscription) {
      toast.error('Renewal is only available for active subscriptions.')
      return
    }

    if (isFreeCurrentPlan) {
      toast.error('Free plans do not support renewal.')
      return
    }

    try {
      await renewMySubscription().unwrap()
      toast.success('Subscription renewed successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to renew subscription.'))
    }
  }

  const handleRetryPayment = async () => {
    if (!canRetryPayment) {
      toast.error('Retry is currently unavailable.')
      return
    }

    try {
      await retryMySubscriptionPayment().unwrap()
      toast.success('Payment retry started successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to retry payment.'))
    }
  }

  const handlePlanChange = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan first.')
      return
    }

    try {
      if (selectedPlan.isFree) {
        if (!subscription) {
          toast.error('You are already on free access.')
          return
        }

        await downgradeMySubscription({ newPlanId: selectedPlan.id }).unwrap()
        toast.success('Downgrade request submitted successfully.')
      } else if (subscription?.status === 'active' && currentPlan) {
        const shouldUpgrade = selectedPlan.price >= currentPlan.price

        if (shouldUpgrade) {
          await upgradeMySubscription({ newPlanId: selectedPlan.id }).unwrap()
          toast.success('Upgrade request submitted successfully.')
        } else {
          await downgradeMySubscription({ newPlanId: selectedPlan.id }).unwrap()
          toast.success('Downgrade request submitted successfully.')
        }
      } else {
        const paymentResponse = await initiateStripePayment({
          planId: selectedPlan.id,
          gateway: 'stripe',
          autoRenew: true,
        }).unwrap()

        const redirectUrl =
          paymentResponse.data.url ??
          paymentResponse.data.redirectUrl ??
          paymentResponse.data.checkout_url

        if (!redirectUrl) {
          toast.error('Payment URL is missing. Please try again.')
          return
        }

        toast.success('Redirecting to Stripe checkout...')
        window.location.assign(redirectUrl)
        return
      }

      setShowPlanChangeModal(false)
      setSelectedPlanId('')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to change subscription plan.'),
      )
    }
  }

  const handleCancel = async () => {
    if (!isActiveSubscription) {
      toast.error('Cancellation is only available for active subscriptions.')
      return
    }

    if (isFreeCurrentPlan) {
      toast.error('Free plans do not support cancellation.')
      return
    }

    const reason = cancelReason.trim()
    if (reason.length < 3) {
      toast.error('Please provide a cancellation reason (min 3 characters).')
      return
    }

    try {
      const response = await cancelMySubscription({
        reason,
        immediate: cancelImmediately,
      }).unwrap()

      if (cancelImmediately) {
        toast.success('Subscription cancelled immediately.')
      } else if (
        response.data.stripeSubscriptionId &&
        response.data.status === 'active'
      ) {
        toast.success('Cancellation scheduled for next billing cycle.')
      } else {
        toast.success('Subscription cancelled.')
      }

      setCancelReason('')
      setCancelImmediately(false)
      setShowCancelModal(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to cancel subscription.'))
    }
  }

  const handleOpenPaymentMethodPortal = async () => {
    try {
      const response = await openPaymentMethodPortal({
        returnUrl: window.location.href,
      }).unwrap()

      if (!response.data.url) {
        toast.error('Billing portal link is not available right now.')
        return
      }

      toast.success('Redirecting to payment method manager...')
      window.location.assign(response.data.url)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Unable to open payment method manager for this account.',
        ),
      )
    }
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        title="Subscription Management"
        description="Manage your subscription plan, billing cycle, and payment methods to ensure uninterrupted access."
      />

      <SettingsCard className="border-l-4 border-l-[#0b7b8b]">
        {isSubscriptionLoading || isPlansLoading ? (
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-md bg-slate-100" />
            <div className="h-16 animate-pulse rounded-md bg-slate-100" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[1.6px] text-slate-500">
                  Current Plan
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">
                    {currentPlan?.name ?? 'Free Plan'}
                  </h3>
                  {subscription ? (
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusToneClass(subscription.status)}`}
                    >
                      {formatStateLabel(subscription.status)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {currentPlan?.description ??
                    'You are currently on free access.'}
                </p>
                {subscription ? (
                  <p className="mt-1 text-sm text-slate-600">
                    Next payment due on{' '}
                    {formatDateLabel(subscription.currentPeriodEnd)}.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isBusy || !subscription || isFreeCurrentPlan}
                  onClick={() => void handleRenew()}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#066e7f] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRenewing ? <BusyIcon /> : <RefreshCw className="size-4" />}
                  Renew Now
                </button>

                <button
                  type="button"
                  disabled={isBusy || !canRetryPayment}
                  onClick={() => void handleRetryPayment()}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRetrying ? (
                    <BusyIcon />
                  ) : (
                    <AlertTriangle className="size-4" />
                  )}
                  Retry Payment
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-[#f8fafb] p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Need more features?
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Upgrade to our Enterprise plan for unlimited collaborators and
                  AI access.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!upgradePlan) {
                      toast.error('No upgrade plan available right now.')
                      return
                    }

                    setSelectedPlanId(upgradePlan.id)
                    setShowPlanChangeModal(true)
                  }}
                  className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  + Upgrade Plan
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 bg-[#f8fafb] p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Looking for less?
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Switch to a lighter plan if you do not need advanced access.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (!downgradePlan) {
                      toast.error('No downgrade plan available right now.')
                      return
                    }

                    setSelectedPlanId(downgradePlan.id)
                    setShowPlanChangeModal(true)
                  }}
                  className="mt-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  + Downgrade Plan
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={isBusy || !subscription || isFreeCurrentPlan}
                onClick={() => setShowCancelModal(true)}
                className="text-sm text-slate-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>

            {canRetryPayment && retrySummary.length ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {retrySummary.join(' | ')}
              </div>
            ) : null}
          </div>
        )}
      </SettingsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard>
          <div className="flex items-center gap-2 text-brand-700">
            <CreditCard className="size-4" />
            <h3 className="text-base font-semibold">Payment Method</h3>
          </div>

          {isPaymentMethodLoading ? (
            <div className="mt-4 h-16 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <>
              <div
                className={`mt-4 rounded-md border px-3 py-3 ${
                  paymentMethod?.status === 'expired'
                    ? 'border-red-300 bg-red-50'
                    : paymentMethod?.status === 'ok'
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">
                  {paymentMethodShortLabel}
                </p>
                {paymentMethodExpiryLabel ? (
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {paymentMethodExpiryLabel}
                  </p>
                ) : null}
                {paymentMethod?.holderName ? (
                  <p className="text-xs text-slate-500">
                    Card holder: {paymentMethod.holderName}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">
                  {paymentMethod?.status === 'expired'
                    ? 'Card is expired. Update now to avoid failed renewals.'
                    : latestFailedPayment
                      ? `Payment failed on ${formatPaymentDate(latestFailedPayment.createdAt)}.`
                      : paymentMethod?.status === 'ok'
                        ? 'Payment method active.'
                        : 'Add a payment method to start paid plans.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleOpenPaymentMethodPortal()}
                disabled={isOpeningPortal}
                className="mt-3 inline-flex items-center gap-2 rounded-md bg-linear-to-r from-[#0b7b8b] via-[#0f8596] to-[#13a6b8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isOpeningPortal ? <BusyIcon /> : null}
                Update Payment Method
              </button>
            </>
          )}
        </SettingsCard>

        <SettingsCard>
          <div className="flex items-center gap-2 text-brand-700">
            <Sparkles className="size-4" />
            <h3 className="text-base font-semibold">Plan Benefits</h3>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {(currentPlan?.features?.length
              ? currentPlan.features
              : [
                  'Unlimited collections and items',
                  'Advanced search and filtering',
                  'Collaborative editing with up to 10 users',
                  'Priority customer support',
                ]
            ).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-brand-700" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </SettingsCard>
      </div>

      <SettingsCard>
        <div className="mb-3 flex items-center gap-2 text-brand-700">
          <CreditCard className="size-4" />
          <h3 className="text-base font-semibold">Payment History</h3>
        </div>

        {isPaymentHistoryLoading ? (
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-md bg-slate-100" />
            <div className="h-10 animate-pulse rounded-md bg-slate-100" />
            <div className="h-10 animate-pulse rounded-md bg-slate-100" />
          </div>
        ) : paymentHistory.length === 0 ? (
          <p className="text-sm text-slate-500">
            No payment history found yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[1.4px] text-slate-600">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paymentHistory.slice(0, 10).map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-2 text-slate-700">
                      {formatPaymentDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {asMoney(payment.payableAmount, payment.currency)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusToneClass(payment.status)}`}
                      >
                        {formatStateLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          createReceiptFile(payment, currentPlan?.name)
                        }
                        className="inline-flex items-center gap-1 text-brand-700 transition hover:text-brand-800"
                      >
                        <Download className="size-4" />
                        <span className="sr-only">Download receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>

      <Modal
        open={showPlanChangeModal}
        title="Change Subscription Plan"
        subtitle="Select a plan to upgrade or downgrade your subscription."
        onClose={() => setShowPlanChangeModal(false)}
      >
        {changeablePlans.length === 0 ? (
          <p className="text-sm text-slate-500">
            No alternative plans available.
          </p>
        ) : (
          <div className="space-y-2">
            {changeablePlans.map((plan: PlanSummary) => {
              const isSelected = selectedPlanId === plan.id
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold text-slate-800">
                    {plan.name}
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    {asMoney(plan.price, plan.currency)} |{' '}
                    {plan.isFree ? 'Free' : 'Paid'}
                  </div>
                </button>
              )
            })}
          </div>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowPlanChangeModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selectedPlanId || isBusy}
            onClick={() => void handlePlanChange()}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isInitiatingPayment || isUpgrading || isDowngrading ? (
              <BusyIcon />
            ) : null}
            Confirm Plan Change
          </button>
        </div>
      </Modal>

      <Modal
        open={showCancelModal}
        title="Cancel Subscription"
        subtitle="Tell us why you want to cancel your current subscription."
        onClose={() => setShowCancelModal(false)}
      >
        <div className="space-y-3">
          <textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500"
            placeholder="Reason for cancellation"
          />

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={cancelImmediately}
              onChange={(event) => setCancelImmediately(event.target.checked)}
              className="mt-1"
            />
            <span>Cancel immediately instead of waiting for period end.</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowCancelModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => void handleCancel()}
            disabled={isCancelling}
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCancelling ? <BusyIcon /> : null}
            Confirm Cancellation
          </button>
        </div>
      </Modal>
    </section>
  )
}
