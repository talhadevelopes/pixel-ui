"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuthTokens } from "@/lib/auth-storage";

export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  useEffect(() => {
    try {
      clearAuthTokens();
      queryClient.clear();
      toast.success("Logged out successfully");
    } catch (e) {
      // ignore
    } finally {
      router.replace("/workspace");
    }
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Signing you out...</p>
    </div>
  );
}
