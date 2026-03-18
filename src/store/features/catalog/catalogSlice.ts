import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type CatalogState = {
  searchQueryDraft: string
  activeFacetFilters: Record<string, string[]>
}

const initialState: CatalogState = {
  searchQueryDraft: '',
  activeFacetFilters: {},
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSearchQueryDraft(state, action: PayloadAction<string>) {
      state.searchQueryDraft = action.payload
    },
    setActiveFacetFilter(
      state,
      action: PayloadAction<{ facet: string; values: string[] }>,
    ) {
      state.activeFacetFilters[action.payload.facet] = action.payload.values
    },
    clearFacetFilter(state, action: PayloadAction<string>) {
      delete state.activeFacetFilters[action.payload]
    },
    clearAllFacetFilters(state) {
      state.activeFacetFilters = {}
    },
  },
})

export const {
  setSearchQueryDraft,
  setActiveFacetFilter,
  clearFacetFilter,
  clearAllFacetFilters,
} = catalogSlice.actions

export const catalogReducer = catalogSlice.reducer
