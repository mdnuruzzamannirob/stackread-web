import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type FileFormat = 'pdf' | 'epub' | null

export type ReaderProgressDraft = {
  bookId: string
  progress: number
  cfi?: string
  page?: number
  timestamp: number
}

export type ReaderState = {
  activeBookId: string | null
  activeFileFormat: FileFormat
  localCursor: {
    page: number | null
    cfi: string | null
  }
  unsyncedProgressQueue: ReaderProgressDraft[]
  currentSelection: string | null
}

const initialState: ReaderState = {
  activeBookId: null,
  activeFileFormat: null,
  localCursor: {
    page: null,
    cfi: null,
  },
  unsyncedProgressQueue: [],
  currentSelection: null,
}

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    setActiveBookId(state, action: PayloadAction<string | null>) {
      state.activeBookId = action.payload
    },
    setActiveFileFormat(state, action: PayloadAction<FileFormat>) {
      state.activeFileFormat = action.payload
    },
    setLocalCursor(
      state,
      action: PayloadAction<{ page: number | null; cfi: string | null }>,
    ) {
      state.localCursor = action.payload
    },
    enqueueUnsyncedProgress(state, action: PayloadAction<ReaderProgressDraft>) {
      state.unsyncedProgressQueue.push(action.payload)
    },
    dequeueUnsyncedProgress(state) {
      state.unsyncedProgressQueue.shift()
    },
    clearUnsyncedProgress(state) {
      state.unsyncedProgressQueue = []
    },
    setCurrentSelection(state, action: PayloadAction<string | null>) {
      state.currentSelection = action.payload
    },
  },
})

export const {
  setActiveBookId,
  setActiveFileFormat,
  setLocalCursor,
  enqueueUnsyncedProgress,
  dequeueUnsyncedProgress,
  clearUnsyncedProgress,
  setCurrentSelection,
} = readerSlice.actions

export const readerReducer = readerSlice.reducer
