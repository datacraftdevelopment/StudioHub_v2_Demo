import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FilterState {
  view: 'mine' | 'department' | 'all'
  departments: string[]
  people: string[]
  statuses: string[]
  groupBy: 'status' | 'designer'
}

interface FilterStore extends FilterState {
  setView: (view: 'mine' | 'department' | 'all') => void
  setDepartments: (departments: string[]) => void
  setPeople: (people: string[]) => void
  setStatuses: (statuses: string[]) => void
  setGroupBy: (groupBy: 'status' | 'designer') => void
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
}

const defaultFilters: FilterState = {
  view: 'mine',
  departments: [],
  people: [],
  statuses: [],
  groupBy: 'status'
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...defaultFilters,
      
      setView: (view) => set({ view }),
      setDepartments: (departments) => set({ departments }),
      setPeople: (people) => set({ people }),
      setStatuses: (statuses) => set({ statuses }),
      setGroupBy: (groupBy) => set({ groupBy }),
      
      setFilters: (filters) => set((state) => ({ ...state, ...filters })),
      
      resetFilters: () => set(defaultFilters),
    }),
    {
      name: 'deliverable-filters', // unique name for localStorage
      partialize: (state) => ({ // Only persist these fields
        view: state.view,
        departments: state.departments,
        people: state.people,
        statuses: state.statuses,
        groupBy: state.groupBy
      })
    }
  )
)