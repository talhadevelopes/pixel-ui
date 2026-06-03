"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthModalContextType {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  openLogin: () => void;
  openSignup: () => void;
  closeAll: () => void;
  switchToLogin: () => void;
  switchToSignup: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen]   = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  const openLogin   = () => { setIsSignupOpen(false); setIsLoginOpen(true); };
  const openSignup  = () => { setIsLoginOpen(false); setIsSignupOpen(true); };
  const closeAll    = () => { setIsLoginOpen(false); setIsSignupOpen(false); };

  return (
    <AuthModalContext.Provider value={{
      isLoginOpen,
      isSignupOpen,
      openLogin,
      openSignup,
      closeAll,
      switchToLogin:  openLogin,
      switchToSignup: openSignup,
    }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}