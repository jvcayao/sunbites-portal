import { act, renderHook } from "@testing-library/react";
import { useAuthStore } from "./auth";

import type { AuthParent } from "@/types/auth";

const mockParent: AuthParent = {
  id: 1,
  first_name: "Maria",
  last_name: "Santos",
  email: "parent@sunbites.test",
  phone: null,
  address: null,
  profile_photo_url: null,
  created_at: "2026-01-01T00:00:00.000000Z",
  has_subscription_student: false,
};

beforeEach(() => {
  act(() => {
    useAuthStore.getState().logout();
  });
});

describe("useAuthStore (portal)", () => {
  it("starts with null state", () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.token).toBeNull();
    expect(result.current.parent).toBeNull();
  });

  it("login() sets token and parent", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login("test-token", mockParent);
    });

    expect(result.current.token).toBe("test-token");
    expect(result.current.parent).toEqual(mockParent);
  });

  it("updateParent() replaces parent while keeping token", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login("test-token", mockParent);
    });

    const updated: AuthParent = {
      ...mockParent,
      has_subscription_student: true,
    };

    act(() => {
      result.current.updateParent(updated);
    });

    expect(result.current.token).toBe("test-token");
    expect(result.current.parent?.has_subscription_student).toBe(true);
  });

  it("logout() clears all state", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.login("test-token", mockParent);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.parent).toBeNull();
  });
});
