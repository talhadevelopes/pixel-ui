"use client";

import { LoginModal } from "@/components/auth/LoginModal";
import { SignupModal } from "@/components/auth/SignupModal";

export function AuthModals() {
  return (
    <>
      <LoginModal />
      <SignupModal />
    </>
  );
}