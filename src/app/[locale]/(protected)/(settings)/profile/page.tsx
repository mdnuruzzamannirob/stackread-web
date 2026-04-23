'use client'

import InputField from '@/components/InputField'
import { Camera, ImagePlus, UploadCloud, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
  Modal,
  type ProfileFormState,
  SettingsCard,
  SettingsPageHeader,
} from '@/components/settings/SettingsShared'
import { Home, Mail, Phone } from 'lucide-react'
import Image from 'next/image'

const MAX_UPLOAD_IMAGE_BYTES = 512 * 1024
const MAX_IMAGE_DIMENSION = 1024
const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

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
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFileBase64, setPhotoFileBase64] = useState('')
  const [photoFileName, setPhotoFileName] = useState('')
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
      countryCode: (user.countryCode ?? 'BD').toUpperCase(),
      profilePicture: user.profilePicture ?? '',
      address: user.address ?? '',
    }

    setProfileState(nextState)
    setInitialProfileState(nextState)
  }, [meResponse?.data])

  const isFormDisabled = isLoadingProfile || isUpdatingProfile
  const isPhotoActionDisabled =
    isLoadingProfile || isUpdatingProfile || isUpdatingPicture

  const hasChanges =
    profileState.firstName !== initialProfileState.firstName ||
    profileState.lastName !== initialProfileState.lastName ||
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

  const resetPhotoSelection = () => {
    setPhotoPreview('')
    setPhotoFileBase64('')
    setPhotoFileName('')
    setIsPhotoDragOver(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
          return
        }

        reject(new Error('Unable to read image file.'))
      }
      reader.onerror = () => reject(new Error('Unable to read image file.'))
      reader.readAsDataURL(file)
    })

  const loadImageFromDataUrl = (dataUrl: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new window.Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Unable to load selected image.'))
      image.src = dataUrl
    })

  const estimateDataUrlBytes = (dataUrl: string): number => {
    const payload = dataUrl.split(',')[1] ?? ''
    return Math.floor((payload.length * 3) / 4)
  }

  const normalizeImageForUpload = async (
    file: File,
  ): Promise<{ dataUrl: string; fileName: string }> => {
    const originalDataUrl = await readFileAsDataUrl(file)
    const image = await loadImageFromDataUrl(originalDataUrl)

    const maxDimension = Math.max(image.width, image.height)
    const scale =
      maxDimension > MAX_IMAGE_DIMENSION
        ? MAX_IMAGE_DIMENSION / maxDimension
        : 1

    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Unable to prepare image upload.')
    }

    context.drawImage(image, 0, 0, width, height)

    let quality = 0.9
    let output = canvas.toDataURL('image/jpeg', quality)

    while (
      estimateDataUrlBytes(output) > MAX_UPLOAD_IMAGE_BYTES &&
      quality > 0.45
    ) {
      quality -= 0.1
      output = canvas.toDataURL('image/jpeg', quality)
    }

    if (estimateDataUrlBytes(output) > MAX_UPLOAD_IMAGE_BYTES) {
      throw new Error('Image is too large. Please choose a smaller image.')
    }

    const normalizedName =
      file.name.replace(/\.[a-zA-Z0-9]+$/, '') || 'profile-picture'

    return {
      dataUrl: output,
      fileName: `${normalizedName}.jpg`,
    }
  }

  const handleSelectPhotoFile = async (file: File) => {
    if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WEBP, or GIF image.')
      return
    }

    try {
      const normalized = await normalizeImageForUpload(file)
      setPhotoPreview(normalized.dataUrl)
      setPhotoFileBase64(normalized.dataUrl)
      setPhotoFileName(normalized.fileName)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to prepare image upload.'))
    }
  }

  const handleOpenPhotoDialog = () => {
    resetPhotoSelection()
    setShowPhotoDialog(true)
  }

  const handleClosePhotoDialog = () => {
    resetPhotoSelection()
    setShowPhotoDialog(false)
  }

  const handleSavePhoto = async () => {
    if (!photoFileBase64) {
      toast.error('Select an image from your device first.')
      return
    }

    try {
      const response = await updateMyProfilePicture({
        fileBase64: photoFileBase64,
        fileName: photoFileName || 'profile-picture.jpg',
      }).unwrap()

      const nextPicture = response.data.profilePicture ?? ''

      setProfileState((previous) => ({
        ...previous,
        profilePicture: nextPicture,
      }))
      setInitialProfileState((previous) => ({
        ...previous,
        profilePicture: nextPicture,
      }))
      handleClosePhotoDialog()
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
          <div className="space-y-4">
            <div className="h-28 w-28 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-11 animate-pulse rounded-md bg-gray-200" />
            <div className="h-11 animate-pulse rounded-md bg-gray-200" />
            <div className="h-11 animate-pulse rounded-md bg-gray-200" />
            <div className="h-11 animate-pulse rounded-md bg-gray-200" />
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[140px_minmax(0,1fr)]">
            <div className="space-y-3">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl bg-[#071b24] ring-1 ring-gray-200">
                {profileState.profilePicture ? (
                  <Image
                    src={profileState.profilePicture}
                    alt="Profile"
                    width={140}
                    height={140}
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
                onClick={handleOpenPhotoDialog}
                disabled={isPhotoActionDisabled}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 transition hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Camera className="size-3.5" />
                Update Photo
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  icon={<UserRound size={17} />}
                  type="text"
                  name="firstName"
                  label="First Name"
                  required
                  placeholder="John"
                  value={profileState.firstName}
                  onChange={(event) =>
                    handleFieldChange('firstName', event.target.value)
                  }
                  disabled={isFormDisabled}
                  autoComplete="given-name"
                />

                <InputField
                  icon={<UserRound size={17} />}
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={profileState.lastName}
                  onChange={(event) =>
                    handleFieldChange('lastName', event.target.value)
                  }
                  disabled={isFormDisabled}
                  autoComplete="family-name"
                />
              </div>

              <InputField
                icon={<Mail size={17} />}
                type="email"
                name="email"
                label="Email Address"
                placeholder="john@example.com"
                value={profileState.email}
                onChange={() => undefined}
                disabled
                autoComplete="email"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Country Code
                  </label>
                  <select
                    value={profileState.countryCode || 'BD'}
                    onChange={(event) =>
                      handleFieldChange('countryCode', event.target.value)
                    }
                    disabled={isFormDisabled}
                    className="h-11 w-full rounded-lg border border-gray-200 mt-1 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-[2.5px] focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.dial})
                      </option>
                    ))}
                  </select>
                </div>
                <InputField
                  icon={<Phone size={17} />}
                  type="tel"
                  name="phone"
                  label="Phone Number"
                  placeholder="+880 1XX-XXXXXXX"
                  value={profileState.phone}
                  onChange={(event) =>
                    handleFieldChange('phone', event.target.value)
                  }
                  disabled={isFormDisabled}
                  autoComplete="tel"
                />
              </div>
              <InputField
                icon={<Home size={17} />}
                type="text"
                name="address"
                label="Address"
                placeholder="123 Main Street"
                value={profileState.address}
                onChange={(event) =>
                  handleFieldChange('address', event.target.value)
                }
                disabled={isFormDisabled}
                autoComplete="street-address"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!hasChanges || isFormDisabled}
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
        subtitle="Drag and drop an image, or choose one from your computer."
        onClose={handleClosePhotoDialog}
      >
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_MIME_TYPES.join(',')}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                void handleSelectPhotoFile(file)
              }
            }}
          />

          <div
            onDragOver={(event) => {
              event.preventDefault()
              setIsPhotoDragOver(true)
            }}
            onDragLeave={(event) => {
              event.preventDefault()
              setIsPhotoDragOver(false)
            }}
            onDrop={(event) => {
              event.preventDefault()
              setIsPhotoDragOver(false)
              const file = event.dataTransfer.files?.[0]
              if (file) {
                void handleSelectPhotoFile(file)
              }
            }}
            className={`rounded-lg border border-dashed p-4 text-center transition ${
              isPhotoDragOver
                ? 'border-brand-500 bg-brand-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <UploadCloud className="mx-auto size-5 text-gray-500" />
            <p className="mt-2 text-sm font-semibold text-gray-700">
              Drop your profile photo here
            </p>
            <p className="text-xs text-gray-500">or choose one manually</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isPhotoActionDisabled}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              <ImagePlus className="size-3.5" />
              Choose Image
            </button>
            <p className="mt-2 text-[11px] text-gray-500">
              JPG, PNG, WEBP, or GIF. Images are auto-optimized up to 512KB.
            </p>
          </div>

          <div className="rounded-lg bg-gray-100 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {photoPreview || profileState.profilePicture ? (
                  <Image
                    src={photoPreview || profileState.profilePicture}
                    alt="Profile preview"
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="size-4 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  {photoFileName || 'No file selected'}
                </p>
                <p className="text-xs text-gray-500">
                  {photoFileBase64
                    ? 'Ready to upload.'
                    : 'Select an image to enable upload.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleClosePhotoDialog}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSavePhoto()}
            disabled={!photoFileBase64 || isUpdatingPicture}
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
