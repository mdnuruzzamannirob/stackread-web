'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import { useDeleteMyAccountMutation } from '@/store/features/auth/authApi'
import { clearAuthState } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'

import {
  BusyIcon,
  Modal,
  SettingsPageHeader,
} from '@/components/settings/SettingsShared'

export default function DangerPage() {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const dispatch = useAppDispatch()

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [deleteMyAccount, { isLoading: isDeleting }] =
    useDeleteMyAccountMutation()

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Type DELETE exactly to continue.')
      return
    }

    try {
      await deleteMyAccount({
        confirmText: 'DELETE',
        currentPassword: currentPassword.trim() || undefined,
      }).unwrap()

      dispatch(clearAuthState())
      toast.success('Your account has been deleted successfully.')
      router.replace(`/${params.locale}/login`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete account.'))
    }
  }

  return (
    <section className="space-y-6">
      <SettingsPageHeader
        title="Danger Zone"
        description="Once you delete your account, there is no going back. All personal data, collections, and contributions will be permanently erased."
      />

      <div className="rounded-lg border border-red-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Delete Account
            </p>
            <p className="text-xs text-gray-500">
              Initiate permanent deletion of your profile.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-md bg-red-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Terminate Account Permanently
          </button>
        </div>
      </div>

      <Modal
        open={showDeleteModal}
        title="Confirm Account Deletion"
        subtitle="Type DELETE to confirm. Provide your current password if your account uses password login."
        onClose={() => setShowDeleteModal(false)}
      >
        <div className="space-y-3">
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            This operation is irreversible. Your account and related records
            will be removed from active access.
          </div>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-600">
              Confirmation Text
            </span>
            <input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="DELETE"
              className="h-11 w-full rounded-md border border-red-300 px-3 text-sm outline-none transition focus:border-red-500"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[1.5px] text-gray-600">
              Current Password (Optional for social accounts)
            </span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Enter current password"
              className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none transition focus:border-red-500"
            />
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmText !== 'DELETE' || isDeleting}
            onClick={() => void handleDeleteAccount()}
            className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? <BusyIcon /> : null}
            Delete Account
          </button>
        </div>
      </Modal>
    </section>
  )
}
