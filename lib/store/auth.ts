import { create } from "zustand";

import type { AuthParent } from "@/types/auth";

interface AuthState {
  token: string | null;
  parent: AuthParent | null;
  login: (token: string, parent: AuthParent) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  parent: null,
  login: (token, parent) => set({ token, parent }),
  logout: () => set({ token: null, parent: null }),
}));
