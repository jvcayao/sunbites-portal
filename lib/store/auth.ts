import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthParent } from "@/types/auth";

interface AuthState {
  token: string | null;
  parent: AuthParent | null;
  login: (token: string, parent: AuthParent) => void;
  logout: () => void;
}

// Token lives in memory only — cleared on every page reload.
// Parent metadata is persisted in sessionStorage for display purposes only
// (UI decoration). The API always enforces auth via the in-memory token.
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
      // Persist parent metadata only — never persist the token
      partialize: (state) => ({ parent: state.parent }),
    }
  )
);
