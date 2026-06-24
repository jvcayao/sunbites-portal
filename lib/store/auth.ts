import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthParent } from "@/types/auth";

interface AuthState {
  token: string | null;
  parent: AuthParent | null;
  login: (token: string, parent: AuthParent) => void;
  logout: () => void;
  updateParent: (parent: AuthParent) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      parent: null,
      login: (token, parent) => set({ token, parent }),
      logout: () => set({ token: null, parent: null }),
      updateParent: (parent) => set({ parent }),
    }),
    {
      name: "portal-auth",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
