"use client";
import { useEffect } from "react";
import useAuthStore from "@/store/auth";

export default function Auth() {
  const { fetchUser, isLoggedIn } = useAuthStore();

  // biome-ignore lint/correctness/useExhaustiveDependencies: .
  useEffect(() => {
    if (isLoggedIn) return;

    fetchUser();
  }, []);

  return null;
}
