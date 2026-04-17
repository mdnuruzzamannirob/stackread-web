'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Modal, SectionTitle } from '@/components/settings/SettingsShared'

export default function DangerPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  return (
    <section>
      <SectionTitle tone="danger" text="Danger Zone" />
      <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-red-100 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-2xl font-semibold text-red-700">
              Delete account
            </p>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
              Permanently delete your profile, library history, and all
              editorial notes. This action is irreversible.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="rounded-md bg-red-700 px-6 py-2.5 text-sm font-semibold text-white"
          >
            Deactivate My Account
          </button>
        </div>
      </article>

      <Modal
        open={showDeleteModal}
        title="Confirm account deletion"
        subtitle="Type DELETE to confirm this irreversible action."
        onClose={() => setShowDeleteModal(false)}
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <p>
            Self account deletion endpoint is not available in current backend
            user auth routes. UI confirmation is ready and will connect once API
            is exposed.
          </p>
        </div>
        <div className="mt-3">
          <input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="DELETE"
            className="h-11 w-full rounded-md border border-red-300 px-3 text-sm outline-none transition focus:border-red-500"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteModal(false)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmText !== 'DELETE'}
            onClick={() => {
              toast.error(
                'Delete API is not yet available on backend for user self-service.',
              )
            }}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
      </Modal>
    </section>
  )
}
