import { useState, useRef, useEffect } from "react";
import { LogOut, Search, X, ChevronRight } from "lucide-react";
import { User, TrainingRequest, RequestStatus } from "../data/mockData";

const STATUS_COLOR: Record<RequestStatus, string> = {
  DraftByManager:   "bg-slate-100 text-slate-700",
  PendingEmployee:  "bg-sky-100 text-sky-800",
  PendingAI:        "bg-purple-100 text-purple-800",
  AIRejected:       "bg-orange-100 text-orange-800",
  PendingUnitHead:  "bg-amber-100 text-amber-800",
  PendingTalentDev: "bg-indigo-100 text-indigo-800",
  Approved:         "bg-green-100 text-green-800",
  Rejected:         "bg-red-100 text-red-800",
};
const STATUS_LABEL: Record<RequestStatus, string> = {
  DraftByManager: "Draft", PendingEmployee: "Awaiting Employee",
  PendingAI: "AI Auditing", AIRejected: "AI Returned",
  PendingUnitHead: "Pending Unit Head", PendingTalentDev: "Pending Talent Dev",
  Approved: "Approved", Rejected: "Rejected",
};

interface ShellProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  requests?: TrainingRequest[];
  onViewRequest?: (id: string) => void;
}

export function Shell({ user, onLogout, children, requests = [], onViewRequest }: ShellProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const searchResults =
    searchQuery.trim().length >= 2
      ? requests
          .filter(
            (r) =>
              r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6)
      : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (id: string) => {
    onViewRequest?.(id);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* ── Top accent stripe ── */}
      <div className="h-1 w-full bg-[#F6AD55]" />

      {/* ── Main header ── */}
      <header style={{ background: "linear-gradient(90deg, #1F4128 0%, #2D5A39 60%, #3D7A4E 100%)" }}>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Global Search */}
          <div className="flex-1 max-w-sm relative" ref={searchRef}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                placeholder="Search by Request ID or name…"
                className="w-full pl-9 pr-9 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                style={{ fontSize: "0.8rem" }}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setShowResults(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                <div className="px-3 py-2 bg-[#F7FAFC] border-b border-slate-100">
                  <span className="text-[#4A5568]" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                  </span>
                </div>
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.id)}
                    className="w-full px-4 py-3 hover:bg-[#F7FAFC] transition-colors text-left flex items-center justify-between border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.82rem" }}>
                          {r.id}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${STATUS_COLOR[r.status]}`}
                          style={{ fontSize: "0.65rem", fontWeight: 600 }}
                        >
                          {STATUS_LABEL[r.status]}
                        </span>
                      </div>
                      <div className="text-slate-500" style={{ fontSize: "0.75rem" }}>
                        {r.employeeName} · {r.courseTitle || "No course selected"}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-200 px-4 py-3 z-50">
                <p className="text-slate-500 text-center" style={{ fontSize: "0.8rem" }}>
                  No requests found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* ── Profile Bar ── */}
        <div className="border-t border-white/10" style={{ background: "rgba(0,0,0,0.15)" }}>
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-6 overflow-x-auto">
            <ProfileItem label="Name" value={user.name} />
            <Divider />
            <ProfileItem label="Position" value={user.position} />
            <Divider />
            <ProfileItem label="Department" value={user.department} />
            <Divider />
            <ProfileItem label="Grade" value={user.grade} />
            <Divider />
            <ProfileItem label="Employee ID" value={user.id} highlight />
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}

function ProfileItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-green-300" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}:
      </span>
      <span
        className={highlight ? "text-[#F6AD55]" : "text-white"}
        style={{ fontSize: "0.75rem", fontWeight: highlight ? 700 : 500 }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-4 w-px bg-white/20 flex-shrink-0" />;
}
