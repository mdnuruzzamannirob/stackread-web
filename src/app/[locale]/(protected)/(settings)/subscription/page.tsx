'use client'

import { AlertTriangle, CreditCard, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  type PlanSummary,
  useCancelMySubscriptionMutation,
  useDowngradeMySubscriptionMutation,
  useGetMySubscriptionQuery,
  useGetPlansQuery,
  useInitiateStripePaymentMutation,
  useRenewMySubscriptionMutation,
  useRetryMySubscriptionPaymentMutation,
  useUpgradeMySubscriptionMutation,
} from '@/store/features/subscriptions/subscriptionsApi'

import {
  asMoney,
  BusyIcon,
  bySortOrder,
  formatDateLabel,
  formatStateLabel,
  getStatusToneClass,
  Modal,
  SectionTitle,
} from '@/components/settings/SettingsShared'

export default function SubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelImmediately, setCancelImmediately] = useState(false)

  const { data: subscriptionResponse, isFetching: isSubscriptionLoading } =
    useGetMySubscriptionQuery()
  const { data: plansResponse, isFetching: isPlansLoading } = useGetPlansQuery()

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

  const subscription = subscriptionResponse?.data ?? null
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

  const isBusy =
    isCancelling ||
    isRenewing ||
    isUpgrading ||
    isDowngrading ||
    isInitiatingPayment ||
    isRetrying

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

  return (
    <section>
      <SectionTitle tone="brand" text="Subscription" />
      <article className="p-1 sm:p-2">
        {isSubscriptionLoading || isPlansLoading ? (
          <div className="space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        ) : (
          <div className="space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
            {!subscription ? (
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm font-medium text-slate-600">
                  No active or pending subscription found for your account.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Current Subscription
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-slate-800">
                      {currentPlan?.name ?? 'Unknown plan'}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {currentPlan?.description ?? 'Plan details unavailable.'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusToneClass(subscription.status)}`}
                  >
                    {formatStateLabel(subscription.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Renewal mode
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {subscription.autoRenew ? 'Automatic' : 'Manual'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Ends: {formatDateLabel(subscription.endsAt)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Current period end
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDateLabel(subscription.currentPeriodEnd)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Plan price:{' '}
                      {currentPlan
                        ? asMoney(currentPlan.price, currentPlan.currency)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {canRetryPayment ? (
                  <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-semibold">
                      Payment recovery in progress
                    </p>
                    {retrySummary.length ? (
                      <p>{retrySummary.join(' | ')}</p>
                    ) : null}
                    {subscription.retryLastError ? (
                      <p className="mt-1">
                        Last error: {subscription.retryLastError}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                type="button"
                disabled={isBusy || changeablePlans.length === 0}
                onClick={() => setShowPlanChangeModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="size-4" />
                Upgrade / Downgrade
              </button>

              <button
                type="button"
                disabled={isBusy || !subscription || isFreeCurrentPlan}
                onClick={() => void handleRenew()}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRenewing ? <BusyIcon /> : <RefreshCw className="size-4" />}
                Renew
              </button>

              <button
                type="button"
                disabled={isBusy || !canRetryPayment}
                onClick={() => void handleRetryPayment()}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRetrying ? <BusyIcon /> : <RefreshCw className="size-4" />}
                Retry Payment
              </button>

              <button
                type="button"
                disabled={isBusy || !subscription || isFreeCurrentPlan}
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AlertTriangle className="size-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </article>

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
