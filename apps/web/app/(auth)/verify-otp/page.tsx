"use client";

import { Suspense } from "react";
import VerifyOtpContent from "@/components/auth/VerifyOtpContent";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}