'use client'

import { Camera, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useMeQuery,
  useUpdateMeMutation,
  useUpdateMyProfilePictureMutation,
} from '@/store/features/auth/authApi'

import {
  BusyIcon,
  COUNTRY_OPTIONS,
  createInitialProfileState,
  isValidUrl,
  Modal,
  type ProfileFormState,
  SettingsCard,
  SettingsPageHeader,
} from '@/components/settings/SettingsShared'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const resolveInitials = (
  firstName: string,
  lastName: string,
  email: string,
) => {
  const first = firstName.trim().charAt(0)
  const second = lastName.trim().charAt(0)
  const combined = `${first}${second}`.trim().toUpperCase()

  if (combined) {
    return combined
  }

  return email.trim().charAt(0).toUpperCase() || 'U'
}

export default function ProfilePage() {
  const { data: meResponse, isFetching: isLoadingProfile } = useMeQuery()
  const [updateMe, { isLoading: isUpdatingProfile }] = useUpdateMeMutation()
  const [updateMyProfilePicture, { isLoading: isUpdatingPicture }] =
    useUpdateMyProfilePictureMutation()

  const [profileState, setProfileState] = useState<ProfileFormState>(
    createInitialProfileState(),
  )
  const [initialProfileState, setInitialProfileState] =
    useState<ProfileFormState>(createInitialProfileState())

  const [showPhotoDialog, setShowPhotoDialog] = useState(false)
  const [profilePictureInput, setProfilePictureInput] = useState('')

  useEffect(() => {
    const user = meResponse?.data
    if (!user) {
      return
    }

    const nextState: ProfileFormState = {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      countryCode: user.countryCode ?? 'BD',
      profilePicture: user.profilePicture ?? '',
      address: user.address ?? '',
    }

    setProfileState(nextState)
    setInitialProfileState(nextState)
    setProfilePictureInput(user.profilePicture ?? '')
  }, [meResponse?.data])

  const selectedCountry = useMemo(() => {
    return (
      COUNTRY_OPTIONS.find(
        (country) => country.code === profileState.countryCode,
      ) ?? COUNTRY_OPTIONS[0]
    )
  }, [profileState.countryCode])

  const hasChanges =
    profileState.firstName !== initialProfileState.firstName ||
    profileState.lastName !== initialProfileState.lastName ||
    profileState.email !== initialProfileState.email ||
    profileState.phone !== initialProfileState.phone ||
    profileState.countryCode !== initialProfileState.countryCode ||
    profileState.address !== initialProfileState.address

  const handleFieldChange = (field: keyof ProfileFormState, value: string) => {
    setProfileState((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    if (!hasChanges) {
      toast.error('No profile changes to save.')
      return
    }

    if (!profileState.firstName.trim()) {
      toast.error('First name is required.')
      return
    }

    if (!EMAIL_REGEX.test(profileState.email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (profileState.phone.trim() && profileState.phone.trim().length < 6) {
      toast.error('Phone number must be at least 6 characters.')
      return
    }

    if (profileState.address.trim() && profileState.address.trim().length < 2) {
      toast.error('Address must be at least 2 characters.')
      return
    }

    try {
      await updateMe({
        firstName: profileState.firstName.trim(),
        lastName: profileState.lastName.trim() || undefined,
        email: profileState.email.trim().toLowerCase(),
        phone: profileState.phone.trim() || undefined,
        countryCode: profileState.countryCode.trim().toUpperCase(),
        address: profileState.address.trim() || undefined,
      }).unwrap()

      setInitialProfileState(profileState)
      toast.success('Profile updated successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update profile.'))
    }
  }

  const handleSavePhoto = async () => {
    const nextPicture = profilePictureInput.trim()

    if (nextPicture && !isValidUrl(nextPicture)) {
      toast.error('Profile picture must be a valid URL.')
      return
    }

    try {
      await updateMyProfilePicture({
        profilePicture: nextPicture,
      }).unwrap()

      setProfileState((previous) => ({
        ...previous,
        profilePicture: nextPicture,
      }))
      setInitialProfileState((previous) => ({
        ...previous,
        profilePicture: nextPicture,
      }))
      setShowPhotoDialog(false)
      toast.success('Profile picture updated successfully.')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to update profile picture.'),
      )
    }
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        title="Profile Identity"
        description="Customize how you represent yourself within the universal library. This information is visible to collaborators and community members."
      />

      <SettingsCard className="p-0">
        {isLoadingProfile ? (
          <div className="space-y-4 p-6">
            <div className="h-28 w-28 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-11 animate-pulse rounded-md bg-slate-200" />
            <div className="h-11 animate-pulse rounded-md bg-slate-200" />
            <div className="h-11 animate-pulse rounded-md bg-slate-200" />
            <div className="h-11 animate-pulse rounded-md bg-slate-200" />
          </div>
        ) : (
          <div className="grid gap-8 p-6 lg:grid-cols-[140px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-[#071b24] ring-1 ring-slate-200">
                {profileState.profilePicture ? (
                  <img
                    src={profileState.profilePicture}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-semibold text-white">
                    {resolveInitials(
                      profileState.firstName,
                      profileState.lastName,
                      profileState.email,
                    )}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowPhotoDialog(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition hover:text-brand-800"
              >
                <Camera className="size-3.5" />
                Update Photo
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#0a5b71]">
                    First Name
                  </span>
                  <input
                    value={profileState.firstName}
                    onChange={(event) =>
                      handleFieldChange('firstName', event.target.value)
                    }
                    className="h-12 w-full rounded-md border border-slate-200 bg-[#edf1f3] px-4 text-slate-800 outline-none transition focus:border-[#0a5b71]"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#0a5b71]">
                    Last Name
                  </span>
                  <input
                    value={profileState.lastName}
                    onChange={(event) =>
                      handleFieldChange('lastName', event.target.value)
                    }
                    className="h-12 w-full rounded-md border border-slate-200 bg-[#edf1f3] px-4 text-slate-800 outline-none transition focus:border-[#0a5b71]"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#0a5b71]">
                  Email Address
                </span>
                <input
                  type="email"
                  value={profileState.email}
                  onChange={(event) =>
                    handleFieldChange('email', event.target.value)
                  }
                  className="h-12 w-full rounded-md border border-slate-200 bg-[#edf1f3] px-4 text-slate-800 outline-none transition focus:border-[#0a5b71]"
                />
              </label>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#0a5b71]">
                  Phone Number
                </span>
                <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                  <select
                    value={profileState.countryCode || 'BD'}
                    onChange={(event) =>
                      handleFieldChange('countryCode', event.target.value)
                    }
                    className="h-12 w-full rounded-md border border-slate-200 bg-[#edf1f3] px-3 text-sm text-slate-700 outline-none transition focus:border-[#0a5b71]"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.dial}
                      </option>
                    ))}
                  </select>

                  <input
                    value={profileState.phone}
                    onChange={(event) =>
                      handleFieldChange('phone', event.target.value)
                    }
                    placeholder="(555) 019-2834"
                    className="h-12 w-full rounded-md border border-slate-200 bg-[#edf1f3] px-4 text-slate-800 outline-none transition focus:border-[#0a5b71]"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Selected country: {selectedCountry?.name}
                </p>
              </div>

              <label className="block space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-[1.8px] text-[#0a5b71]">
                  Address
                </span>
                <input
                  value={profileState.address}
                  onChange={(event) =>
                    handleFieldChange('address', event.target.value)
                  }
                  placeholder="Your full address"
                  className="h-12 w-full rounded-md border border-slate-200 bg-[#edf1f3] px-4 text-slate-800 outline-none transition focus:border-[#0a5b71]"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!hasChanges || isUpdatingProfile}
                  className="inline-flex min-w-40 items-center justify-center gap-2 rounded-md bg-[#066e7f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#055f6d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingProfile ? <BusyIcon /> : null}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </SettingsCard>

      <Modal
        open={showPhotoDialog}
        title="Update Photo"
        subtitle="Paste a profile image URL to update your profile picture."
        onClose={() => setShowPhotoDialog(false)}
      >
        <div className="space-y-3">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[1.8px] text-slate-500">
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
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-slate-200">
              {profilePictureInput.trim() ? (
                <img
                  src={profilePictureInput.trim()}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="size-4 text-slate-500" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowPhotoDialog(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSavePhoto()}
            disabled={isUpdatingPicture}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUpdatingPicture ? <BusyIcon /> : null}
            Save Photo
          </button>
        </div>
      </Modal>
    </section>
  )
}
