import { create } from "zustand";
import type { IPopulatedUser } from "@/models/User";

type AuthState = {
  isLoggedIn: boolean;
  userData: IPopulatedUser | null;
  login: (username: string, password: string) => Promise<{ error: string }>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  userData: null,
  login: async (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return response.json();
    }

    set({ userData: await response.json() });
    set({ isLoggedIn: true });
  },
  logout: async () => {
    const response = await fetch("/api/auth/logout");

    if (!response.ok) {
      return;
    }

    set({ userData: null });
    set({ isLoggedIn: false });

    window.location.reload();
  },
  fetchUser: async () => {
    const response = await fetch("/api/protected/me");
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    console.log(data);

    if (data.user) {
      set({ userData: data.user });
      set({ isLoggedIn: true });
    } else {
      set({ userData: null });
      set({ isLoggedIn: false });
    }
  },
}));

export default useAuthStore;
