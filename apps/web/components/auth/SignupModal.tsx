"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Eye, EyeOff, Wand2, ArrowRight, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { useRegisterStartMutation, useVerifyOtpMutation, useResendOtpMutation } from "@/mutations/";
import { setAuthTokens } from "@/lib/auth-storage";
import { API, BASE_URL } from "@/services/api";
import { useAuthModal } from "../../contexts/AuthModalContext";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

const STEPS = [
  { label: "Account details", sub: "Name, email & password" },
  { label: "Verify email",    sub: "6-digit OTP" },
  { label: "All done",        sub: "Start building" },
];

export function SignupModal() {
  const { isSignupOpen, closeAll, switchToLogin } = useAuthModal();
  const [step, setStep]   = useState(0);
  const [show, setShow]   = useState(false);
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [otp, setOtp]     = useState(["", "", "", "", "", ""]);
  const router            = useRouter();

  const registerMutation = useRegisterStartMutation({
    onError: (error) => toast.error(error.message),
  });

  const verifyMutation = useVerifyOtpMutation({
    onSuccess: (tokens) => {
      setAuthTokens(tokens);
      toast.success("Account created!");
      setStep(2);
    },
    onError: (error) => toast.error(error.message),
  });

  const resendMutation = useResendOtpMutation({
    onSuccess: () => toast.success("Code resent!"),
    onError: (error) => toast.error(error.message),
  });

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !pass.trim()) {
      toast.error("All fields are required");
      return;
    }
    try {
      await registerMutation.mutateAsync({ name: name.trim(), email: email.trim(), password: pass.trim() });
      setStep(1);
    } catch {
      // handled in onError
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Enter the full 6-digit code");
      return;
    }
    try {
      await verifyMutation.mutateAsync({ email: email.trim(), otp: code });
    } catch {
      // handled in onError
    }
  };

  const handleResend = () => {
    resendMutation.mutate({ email: email.trim() });
  };

  const handleOtp = (val: string, i: number) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) {
      (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
    }
  };

  // Reset state when closed
  const handleClose = () => {
    closeAll();
    setStep(0);
    setName(""); setEmail(""); setPass("");
    setOtp(["", "", "", "", "", ""]);
  };

  if (!isSignupOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="signup-modal-card" onClick={(e) => e.stopPropagation()}>

        {/* ── LEFT TRACKER ── */}
        <div className="signup-tracker">
          <div className="signup-tracker__logo">
            <div className="logo-icon logo-icon-sm"><Wand2 size={13} /></div>
            <span className="logo-text">BuildAI</span>
          </div>

          <p className="signup-tracker__title">Setup steps</p>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {STEPS.map((s, i) => {
              const done   = i < step;
              const active = i === step;
              return (
                <div key={i} className="step-item">
                  {i < STEPS.length - 1 && (
                    <div className={`step-connector ${done ? "done" : ""}`} />
                  )}
                  <div className={`step-circle ${active ? "active" : ""} ${done ? "done" : ""}`}>
                    {done ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <div className="step-text">
                    <div className={`step-label ${active ? "active" : ""} ${done ? "done" : ""}`}>{s.label}</div>
                    <div className={`step-sub ${active ? "active" : ""}`}>{s.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card-hint">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Clock size={14} color="var(--color-primary)" />
              <span className="text-12 fw-700 c-heading">2 min setup</span>
            </div>
            <p className="text-11 c-muted">Free forever on the starter plan.</p>
          </div>
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="signup-form">
          <div className="watermark watermark-br" style={{ fontSize: 120 }}>BUILDAI</div>
          <button className="modal-close" onClick={handleClose}>✕</button>

          <div className="signup-form__inner">

            {/* STEP 0 — Account details */}
            {step === 0 && (
              <>
                <h2 className="form-heading">Create account</h2>
                <p className="form-subheading">Join 50,000+ builders on BuildAI.</p>

                <a href={`${BASE_URL}${API.auth.google}`} className="btn-google" style={{ marginBottom: 20 }}>
                  <GoogleIcon /> Continue with Google
                </a>

                <div className="divider-row">
                  <div className="divider-line" /><span className="divider-label">or</span><div className="divider-line" />
                </div>

                <div className="flex flex-col gap-10" style={{ marginBottom: 20 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" disabled={registerMutation.isPending} />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className="input-field" disabled={registerMutation.isPending} />
                  <div className="input-wrapper">
                    <input value={pass} onChange={(e) => setPass(e.target.value)} type={show ? "text" : "password"} placeholder="Password" className="input-field has-icon-right" disabled={registerMutation.isPending} />
                    <button className="input-eye" onClick={() => setShow(!show)}>
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  className="btn-primary btn-primary-full"
                  onClick={handleRegister}
                  disabled={registerMutation.isPending}
                  style={{ opacity: registerMutation.isPending ? 0.7 : 1 }}
                >
                  {registerMutation.isPending ? (
                    <>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                      Creating account…
                    </>
                  ) : (
                    <>Continue <ArrowRight size={15} /></>
                  )}
                </button>

                <p className="auth-switch">
                  Have an account?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>Sign in</a>
                </p>
              </>
            )}

            {/* STEP 1 — OTP */}
            {step === 1 && (
              <>
                <button className="btn-back" onClick={() => setStep(0)}>
                  <ArrowLeft size={14} /> Back
                </button>

                <div className="icon-box icon-box-md">
                  <Mail size={24} color="var(--color-primary)" />
                </div>

                <h2 className="form-heading">Check your inbox</h2>
                <p className="form-subheading">
                  We emailed a 6-digit code to{" "}
                  <strong className="c-heading">{email}</strong>
                </p>

                <div className="otp-row">
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={v}
                      onChange={(e) => handleOtp(e.target.value, i)}
                      maxLength={1}
                      className={`otp-box ${v ? "otp-filled" : ""}`}
                      disabled={verifyMutation.isPending}
                    />
                  ))}
                </div>

                <button
                  className="btn-primary btn-primary-full"
                  style={{ marginBottom: 16, opacity: verifyMutation.isPending ? 0.7 : 1 }}
                  onClick={handleVerify}
                  disabled={verifyMutation.isPending}
                >
                  {verifyMutation.isPending ? (
                    <>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
                      Verifying…
                    </>
                  ) : (
                    <>Verify & Continue <ArrowRight size={15} /></>
                  )}
                </button>

                <p className="auth-switch">
                  Didn't receive it?{" "}
                  <button
                    className="btn-text"
                    onClick={handleResend}
                    disabled={resendMutation.isPending}
                  >
                    {resendMutation.isPending ? "Resending…" : "Resend code"}
                  </button>
                </p>
              </>
            )}

            {/* STEP 2 — Done */}
            {step === 2 && (
              <div className="text-center">
                <div className="icon-circle-success">
                  <CheckCircle2 size={36} color="var(--color-success)" />
                </div>
                <h2 className="form-heading">You're in!</h2>
                <p className="form-subheading">
                  Your account is ready.<br />Time to build something great.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => { handleClose(); router.replace("/workspace"); }}
                >
                  Open workspace <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}