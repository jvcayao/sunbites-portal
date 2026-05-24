import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthParent } from "@/types/auth";

interface AuthState {
  token: string | null;
  parent: AuthParent | null;
  login: (token: string, parent: AuthParent) => void;
  logout: () => void;
}

// Token and parent are persisted in sessionStorage so page refreshes don't
// force re-login. sessionStorage is cleared when the tab closes, which
// limits the exposure window compared to localStorage.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      parent: null,
      login: (token, parent) => set({ token, parent }),
      logout: () => set({ token: null, parent: null }),
    }),
    {
      name: "sunbites-portal-auth",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
