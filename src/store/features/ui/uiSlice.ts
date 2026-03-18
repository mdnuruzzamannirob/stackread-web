import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ThemeMode = 'light' | 'dark' | 'system'
type TableDensity = 'compact' | 'comfortable' | 'spacious'

export type UiState = {
  isSidebarCollapsed: boolean
  themeMode: ThemeMode
  isReaderPanelVisible: boolean
  globalModalStack: string[]
  tableDensity: TableDensity
  persistedFilters: Record<string, unknown>
}

const initialState: UiState = {
  isSidebarCollapsed: false,
  themeMode: 'system',
  isReaderPanelVisible: true,
  globalModalStack: [],
  tableDensity: 'comfortable',
  persistedFilters: {},
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.isSidebarCollapsed = action.payload
    },
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload
    },
    setReaderPanelVisible(state, action: PayloadAction<boolean>) {
      state.isReaderPanelVisible = action.payload
    },
    pushGlobalModal(state, action: PayloadAction<string>) {
      state.globalModalStack.push(action.payload)
    },
    popGlobalModal(state) {
      state.globalModalStack.pop()
    },
    setTableDensity(state, action: PayloadAction<TableDensity>) {
      state.tableDensity = action.payload
    },
    setPersistedFilter(
      state,
      action: PayloadAction<{ key: string; value: unknown }>,
    ) {
      state.persistedFilters[action.payload.key] = action.payload.value
    },
    clearPersistedFilter(state, action: PayloadAction<string>) {
      delete state.persistedFilters[action.payload]
    },
  },
})

export const {
  setSidebarCollapsed,
  setThemeMode,
  setReaderPanelVisible,
  pushGlobalModal,
  popGlobalModal,
  setTableDensity,
  setPersistedFilter,
  clearPersistedFilter,
} = uiSlice.actions

export const uiReducer = uiSlice.reducer
