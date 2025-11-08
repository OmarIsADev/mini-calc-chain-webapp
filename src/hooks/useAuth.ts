import { useState } from "react";

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (username: string, password: string): Promise<boolean | { error: string }> => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return response.json();

    setIsLoggedIn(true);
    return true;
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await fetch("/api/auth/logout", {
      method: "POST",
    });
  };

  return { isLoggedIn, login, logout };
};
