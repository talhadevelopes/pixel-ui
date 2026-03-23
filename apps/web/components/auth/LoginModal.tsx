"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Wand2, ArrowRight } from "lucide-react";
import { useLoginMutation } from "@/mutations/";
import { setAuthTokens } from "@/lib/auth-storage";
import { API, BASE_URL } from "@/services/api";
import { useAuthModal } from "@/components/global/AuthModalContext";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

export function LoginModal() {
  const { isLoginOpen, closeAll, switchToSignup } = useAuthModal();
  const [show, setShow]   = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const router            = useRouter();

  const loginMutation = useLoginMutation({
    onSuccess: (tokens) => {
      setAuthTokens(tokens);
      toast.success("Logged in successfully");
      closeAll();
      router.replace("/workspace");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async () => {
    if (!email.trim() || !pass.trim()) {
      toast.error("Email and password are required");
      return;
    }
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password: pass.trim() });
    } catch {
      // handled in onError
    }
  };

  if (!isLoginOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeAll}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>

        <div className="watermark watermark-br" style={{ fontSize: 120 }}>BUILDAI</div>
        <button className="modal-close" onClick={closeAll}>✕</button>

        <div className="logo-row" style={{ marginBottom: 28 }}>
          <div className="logo-icon logo-icon-md"><Wand2 size={14} /></div>
          <span className="logo-text logo-text-lg">BuildAI</span>
        </div>

        <h1 className="text-24 fw-700 c-heading tracking-tight" style={{ marginBottom: 4 }}>
          Welcome back
        </h1>
        <p className="text-14 c-muted" style={{ marginBottom: 28 }}>
          Sign in to your account to continue
        </p>

        <a href={`${BASE_URL}${API.auth.google}`} className="btn-google" style={{ marginBottom: 20 }}>
          <GoogleIcon /> Sign in with Google
        </a>

        <div className="divider-row">
          <div className="divider-line" />
          <span className="divider-label">or</span>
          <div className="divider-line" />
        </div>

        <div className="flex flex-col gap-12" style={{ marginBottom: 20 }}>
          <div className="input-wrapper">
            <span className="input-icon-left"><Mail size={15} /></span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="input-field has-icon-left"
              disabled={loginMutation.isPending}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="input-wrapper">
            <span className="input-icon-left"><Lock size={15} /></span>
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="Password"
              className="input-field has-icon-left has-icon-right"
              disabled={loginMutation.isPending}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button className="input-eye" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="forgot-link" style={{ marginBottom: 20 }}>
          <a href="#">Forgot password?</a>
        </div>

        <button
          className="btn-primary btn-primary-full"
          onClick={handleSubmit}
          disabled={loginMutation.isPending}
          style={{ opacity: loginMutation.isPending ? 0.7 : 1 }}
        >
          {loginMutation.isPending ? (
            <>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
              Signing in…
            </>
          ) : (
            <>Sign in <ArrowRight size={16} /></>
          )}
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); switchToSignup(); }}>Sign up</a>
        </p>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}