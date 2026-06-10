import { describe, it, expect, beforeEach } from "vitest";
import reducer, { logout, clearError, setDeveloperRole } from "../authSlice";

// We need to extract the state type. Let's define it here.
interface User {
  id: string;
  email: string;
  fullName: string;
  role: "Admin" | "Approver" | "Submitter";
  createdAt: string;
  updatedAt: string;
}

interface State {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  users: User[];
}

const mockUser: User = {
  id: "1",
  email: "test@test.com",
  fullName: "Test User",
  role: "Admin",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const initialState: State = {
  user: null,
  token: null,
  loading: false,
  error: null,
  users: [],
};

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should return initial state", () => {
    const state = reducer(undefined, { type: "@@init" });
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.users).toEqual([]);
  });

  it("should handle logout", () => {
    const prevState: State = {
      ...initialState,
      user: mockUser,
      token: "abc123",
      users: [mockUser],
    };
    localStorage.setItem("token", "abc123");
    const state = reducer(prevState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.users).toEqual([]);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("should handle clearError", () => {
    const prevState: State = { ...initialState, error: "Something went wrong" };
    const state = reducer(prevState, clearError());
    expect(state.error).toBeNull();
  });

  it("should handle setDeveloperRole when user exists", () => {
    const prevState: State = { ...initialState, user: mockUser };
    const state = reducer(prevState, setDeveloperRole("Approver"));
    expect(state.user?.role).toBe("Approver");
  });

  it("should not modify user when setDeveloperRole is called with no user", () => {
    const state = reducer(initialState, setDeveloperRole("Approver"));
    expect(state.user).toBeNull();
  });

  it("should set loading on login.pending", () => {
    const state = reducer(initialState, { type: "auth/login/pending" });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("should set user and token on login.fulfilled", () => {
    const payload = { token: "abc", data: mockUser };
    const state = reducer(initialState, {
      type: "auth/login/fulfilled",
      payload,
    });
    expect(state.loading).toBe(false);
    expect(state.token).toBe("abc");
    expect(state.user).toEqual(mockUser);
  });

  it("should set error on login.rejected", () => {
    const state = reducer(initialState, {
      type: "auth/login/rejected",
      payload: "Invalid credentials",
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Invalid credentials");
  });
});
