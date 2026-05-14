import { useState } from "react";
import { USERS, User } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import loginImage from "../../imports/WhatsApp_Image__2026-05-03_at_6.15.53_PM-1.jpeg";
import { Eye, EyeOff } from "lucide-react";

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!empId.trim()) return setError("Please enter your Employee ID.");
    if (password.length < 3) return setError("Password must be at least 3 characters.");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const existing = USERS.find(
        (u) => u.id.toLowerCase() === empId.trim().toLowerCase()
      );
      if (existing) {
        onLogin(existing);
      } else {
        setError("Employee ID not found. Please check and try again.");
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — login form ── */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-16">
        <div className="w-full max-w-md">
          <h1 className="text-[#1F4128] mb-3" style={{ fontWeight: 800, fontSize: "2.75rem", lineHeight: 1 }}>
            Login
          </h1>
          <p className="text-slate-500 mb-10" style={{ fontSize: "1rem" }}>
            Login to your account.
          </p>

          {/* Employee ID */}
          <div className="mb-5">
            <label className="block text-[#1F2937] mb-2" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              Employee ID
            </label>
            <input
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoComplete="username"
              className="w-full px-4 py-3 border border-[#E4B4BC] rounded-md focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition-all"
              style={{ fontSize: "0.95rem" }}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="block text-[#1F2937] mb-2" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 border border-[#E4B4BC] rounded-md focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition-all"
                style={{ fontSize: "0.95rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Reset Password */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => setError("Reset Password is not yet available. Please contact HR.")}
              className="text-[#1F2937] hover:text-[#2D5A39] hover:underline"
              style={{ fontSize: "0.85rem", fontWeight: 700 }}
            >
              Reset Password?
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-5 text-red-700 flex items-start gap-2" style={{ fontSize: "0.85rem" }}>
              <span className="text-red-500 mt-0.5">⚠</span> {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-[#2D5A39] text-white rounded-md hover:bg-[#1F4128] flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-70"
            style={{ fontWeight: 700, fontSize: "0.95rem" }}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </div>

      {/* ── Right panel — brand image ── */}
      <div className="hidden lg:block w-2/5 relative overflow-hidden bg-[#1F4128]">
        <ImageWithFallback
          src={loginImage}
          alt="Enterprise Training WMS"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
