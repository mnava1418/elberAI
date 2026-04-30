import { create } from 'zustand'

interface UserProfile {
  name: string
  email: string
}

interface UserStore {
  profile: UserProfile | null
  isLoggedIn: boolean
  logIn: (profile: UserProfile) => void
  logOut: () => void
}

const useUserStore = create<UserStore>((set) => ({
  profile: null,
  isLoggedIn: false,
  logIn: (profile) => set({ profile, isLoggedIn: true }),
  logOut: () => set({ profile: null, isLoggedIn: false }),
}))

export default useUserStore
