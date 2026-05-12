import { useState } from "react";
import { USERS, User, Role } from "../data/mockData";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import loginImage from "../../imports/WhatsApp_Image__2026-05-03_at_6.15.53_PM-1.jpeg";
import {
  LogIn, GraduationCap, User as UserIcon, Users, ShieldCheck, Award,
  LayoutDashboard, ArrowLeft, Eye, EyeOff,
} from "lucide-react";

interface RoleCard {
  role: Role;
  title: string;
  subtitle: string;
  icon: any;
  bg: string;
  border: string;
  hint: string;
}

const ROLE_CARDS: RoleCard[] = [
  {
    role: "Employee",
    title: "Employee",
    subtitle: "Submit & track your training requests",
    icon: UserIcon,
    bg: "bg-[#2D5A39]",
    border: "border-[#2D5A39]",
    hint: "e.g. E001, E002 …",
  },
  {
    role: "Manager",
    title: "Manager",
    subtitle: "Nominate team members for training",
    icon: Users,
    bg: "bg-[#3D7A4E]",
    border: "border-[#3D7A4E]",
    hint: "e.g. M001, M002",
  },
  {
    role: "TrainingUnitHead",
    title: "Training Unit Head",
    subtitle: "Technical review & approval",
    icon: ShieldCheck,
    bg: "bg-[#1F4128]",
    border: "border-[#1F4128]",
    hint: "e.g. UH01",
  },
  {
    role: "TalentDevManager",
    title: "Talent Development",
    subtitle: "Strategic final approval",
    icon: Award,
    bg: "bg-[#F6AD55]",
    border: "border-[#F6AD55]",
    hint: "e.g. TD01",
  },
  {
    role: "HRAdmin",
    title: "HR Administration",
    subtitle: "Global oversight & reporting",
    icon: LayoutDashboard,
    bg: "bg-slate-600",
    border: "border-slate-600",
    hint: "e.g. HR01",
  },
];

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null);
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!selectedRole) return;
    if (!empId.trim()) return setError("Please enter your Employee ID.");
    if (password.length < 3) return setError("Password must be at least 3 characters.");

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const existing = USERS.find(
        (u) => u.id.toLowerCase() === empId.trim().toLowerCase() && u.role === selectedRole.role
      );
      if (existing) {
        onLogin(existing);
      } else {
        // Accept any ID — create dynamic user
        onLogin({
          id: empId.trim().toUpperCase(),
          name: empId.trim().toUpperCase(),
          role: selectedRole.role,
          competency: "General",
          position: selectedRole.title,
          department: "General",
          grade: "—",
        });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex w-2/5 relative overflow-hidden bg-[#1F4128] flex-col items-center justify-center">
        {/* Background image */}
        <ImageWithFallback
          src={loginImage}
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Text on top */}
        <div className="relative z-10 text-center px-10">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl">
            <GraduationCap size={36} className="text-white" />
          </div>
          <h2 className="text-white mb-3" style={{ fontWeight: 800, fontSize: "1.9rem", lineHeight: 1.2 }}>
            Enterprise<br />Training WMS
          </h2>
          <p className="text-white/80" style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
            Streamline your organization's training workflow from nomination to final approval.
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F7FAFC] p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#2D5A39] rounded-xl flex items-center justify-center">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div className="text-[#2D5A39]" style={{ fontWeight: 800, fontSize: "1.2rem" }}>T-WMS</div>
        </div>

        <div className="w-full max-w-lg">
          {!selectedRole ? (
            /* Role selection */
            <>
              <div className="mb-8">
                <h1 className="text-[#2D5A39] mb-1" style={{ fontWeight: 700, fontSize: "1.4rem" }}>
                  Welcome Back
                </h1>
                <p className="text-slate-500" style={{ fontSize: "0.9rem" }}>
                  Select your portal to continue authentication
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLE_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.role}
                      onClick={() => { setSelectedRole(card); setError(""); setEmpId(""); setPassword(""); }}
                      className="group bg-white border-2 border-slate-200 rounded-2xl p-5 hover:border-[#2D5A39] hover:shadow-lg transition-all text-left"
                    >
                      <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="text-[#2D5A39] mb-1" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {card.title}
                      </div>
                      <div className="text-slate-500" style={{ fontSize: "0.75rem" }}>
                        {card.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Login form */
            <>
              <button
                onClick={() => { setSelectedRole(null); setError(""); }}
                className="flex items-center gap-2 text-[#2D5A39] hover:underline mb-6"
                style={{ fontSize: "0.85rem", fontWeight: 500 }}
              >
                <ArrowLeft size={15} /> Back to portal selection
              </button>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                {/* Form header */}
                <div className={`${selectedRole.bg} px-7 py-5`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <selectedRole.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white" style={{ fontWeight: 700, fontSize: "1rem" }}>
                        {selectedRole.title} Portal
                      </div>
                      <div className="text-white/70" style={{ fontSize: "0.75rem" }}>
                        {selectedRole.subtitle}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form body */}
                <div className="px-7 py-7 space-y-5">
                  {/* Employee ID */}
                  <div>
                    <label className="block text-[#374151] mb-2" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Employee ID
                    </label>
                    <input
                      value={empId}
                      onChange={(e) => setEmpId(e.target.value)}
                      placeholder={selectedRole.hint}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition-all"
                      style={{ fontSize: "0.9rem" }}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[#374151] mb-2" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition-all"
                        style={{ fontSize: "0.9rem" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 flex items-start gap-2" style={{ fontSize: "0.8rem" }}>
                      <span className="text-red-500 mt-0.5">⚠</span> {error}
                    </div>
                  )}

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`w-full py-3 ${selectedRole.bg} text-white rounded-xl hover:opacity-90 flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-70`}
                    style={{ fontWeight: 700, fontSize: "0.95rem" }}
                  >
                    {loading ? (
                      <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn size={18} /> Sign In
                      </>
                    )}
                  </button>

                  <p className="text-center text-slate-400" style={{ fontSize: "0.72rem" }}>
                    The system will automatically detect your role and redirect you to the appropriate dashboard.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
