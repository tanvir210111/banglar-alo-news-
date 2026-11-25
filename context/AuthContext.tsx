"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuthToken, setAuthToken, removeAuthToken } from "@/services/apiClient";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "PUBLISHER" | "READER";
  avatar?: string;
  designation?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  loginModalMessage: string;
  openLoginModal: (message?: string) => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  isLoginModalOpen: false,
  loginModalMessage: "",
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

const READER_USER_KEY = "banglaralo_reader_user";
const READER_TOKEN_KEY = "banglaralo_reader_token";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "PUBLISHER", "REPORTER"];

function isStaffRole(role?: string | null): boolean {
  if (!role) return false;
  return STAFF_ROLES.includes(role.toUpperCase().trim());
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");

  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem(READER_TOKEN_KEY) ||
        localStorage.getItem("reader_token");
      const storedUser =
        localStorage.getItem(READER_USER_KEY) ||
        localStorage.getItem("reader_user");

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (!isStaffRole(parsed?.role)) {
          setToken(storedToken);
          setUser(parsed);
        } else {
          // Purge accidental staff credentials from reader context
          localStorage.removeItem(READER_TOKEN_KEY);
          localStorage.removeItem(READER_USER_KEY);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    // If logging in as staff/super admin, keep reader frontend untouched
    if (isStaffRole(newUser?.role)) {
      setIsLoginModalOpen(false);
      return;
    }

    setToken(newToken);
    setUser(newUser);
    try {
      localStorage.setItem(READER_TOKEN_KEY, newToken);
      localStorage.setItem(READER_USER_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore
    }
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(READER_TOKEN_KEY);
      localStorage.removeItem(READER_USER_KEY);
      localStorage.removeItem("reader_token");
      localStorage.removeItem("reader_user");
    } catch {
      // Ignore
    }
  };

  const openLoginModal = (message?: string) => {
    setLoginModalMessage(message || "");
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalMessage("");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        isLoginModalOpen,
        loginModalMessage,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

