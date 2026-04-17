'use client'

import {
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  ImageUp,
  Pencil,
  Shield,
  SlidersHorizontal,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useMeQuery,
  useUpdateMyProfilePictureMutation,
} from '@/store/features/auth/authApi'
import {
  useGetMySubscriptionQuery,
  useGetPlansQuery,
} from '@/store/features/subscriptions/subscriptionsApi'
import { BusyIcon, Modal, isValidUrl } from '../settings/SettingsShared'

const resolveInitials = (
  firstName?: string,
  lastName?: string,
  email?: string,
) => {
  const first = firstName?.charAt(0) ?? ''
  const second = lastName?.charAt(0) ?? ''
  const combined = `${first}${second}`.trim().toUpperCase()

  if (combined) {
    return combined
  }

  if (email) {
    return email.charAt(0).toUpperCase()
  }

  return 'U'
}

const SettingsSidebar = ({ locale }: { locale: string }) => {
  const pathname = usePathname()
  const { data: meResponse } = useMeQuery()
  const [updateMyProfilePicture, { isLoading: isUpdatingPicture }] =
    useUpdateMyProfilePictureMutation()
  const { data: subscriptionResponse } = useGetMySubscriptionQuery()
  const { data: plansResponse } = useGetPlansQuery()
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [profilePictureInput, setProfilePictureInput] = useState('')

  const user = meResponse?.data
  const subscription = subscriptionResponse?.data
  const currentPlan = subscription?.planId
    ? plansResponse?.data?.find((plan) => plan.id === subscription.planId)
    : null

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Reader'
  const initials = resolveInitials(user?.firstName, user?.lastName, user?.email)
  const badgeLabel = currentPlan?.name ?? 'Standard'

  const settingsLinks = [
    {
      label: 'Security Protocols',
      href: 'security',
      icon: Shield,
      isDanger: false,
    },
    {
      label: 'Preferences',
      href: 'preferences',
      icon: SlidersHorizontal,
      isDanger: false,
    },
    {
      label: 'Subscription',
      href: 'subscription',
      icon: CreditCard,
      isDanger: false,
    },
    {
      label: 'Danger Zone',
      href: 'danger',
      icon: AlertTriangle,
      isDanger: true,
    },
  ]

  const openAvatarModal = () => {
    setProfilePictureInput(user?.profilePicture ?? '')
    setShowAvatarModal(true)
  }

  const handleSaveAvatar = async () => {
    const nextValue = profilePictureInput.trim()

    if (nextValue && !isValidUrl(nextValue)) {
      toast.error('Profile picture must be a valid URL.')
      return
    }

    try {
      await updateMyProfilePicture({
        profilePicture: nextValue,
      }).unwrap()
      toast.success('Profile picture updated successfully.')
      setShowAvatarModal(false)
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to update profile picture.'),
      )
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-[#f5f8fa] p-5">
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-[#111827]">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-white">{initials}</span>
          )}
          <button
            type="button"
            aria-label="Edit profile"
            onClick={() => void openAvatarModal()}
            className="absolute bottom-1 right-1 rounded-full bg-brand-700 p-1.5 text-white"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-2xl font-semibold text-slate-800">{fullName}</p>
          <p className="text-sm font-medium text-slate-500">
            {subscription?.status
              ? `${subscription.status.replace('_', ' ')} subscriber`
              : 'Free member'}
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f3d595] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7b5312]">
            <BadgeCheck className="size-3" />
            {badgeLabel}
          </span>
        </div>
      </div>
      <nav className="rounded-xl border border-slate-200 bg-[#f5f8fa] p-2">
        {settingsLinks.map((item) => {
          const Icon = item.icon
          const itemPath = `/${locale}/${item.href}`
          const isActive =
            pathname === itemPath || pathname.startsWith(`${itemPath}/`)

          return (
            <Link
              key={item.href}
              href={itemPath}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? item.isDanger
                    ? 'bg-[#ffecec] text-red-700'
                    : 'bg-white text-brand-700'
                  : item.isDanger
                    ? 'text-red-600 hover:bg-[#ffecec]'
                    : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <Modal
        open={showAvatarModal}
        title="Update Profile Picture"
        subtitle="Paste an image URL to update your profile photo."
        onClose={() => setShowAvatarModal(false)}
      >
        <div className="space-y-3">
          <label className="space-y-1.5 text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Profile Picture URL
            </span>
            <input
              value={profilePictureInput}
              onChange={(event) => setProfilePictureInput(event.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-brand-500"
            />
          </label>

          <div className="rounded-lg bg-slate-100 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                {profilePictureInput.trim() ? (
                  <img
                    src={profilePictureInput.trim()}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageUp className="size-4 text-slate-500" />
                )}
              </div>
              <p className="text-xs text-slate-500">
                Leave empty to remove your current picture.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowAvatarModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSaveAvatar()}
            disabled={isUpdatingPicture}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdatingPicture ? <BusyIcon /> : null}
            Save Picture
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsSidebar
