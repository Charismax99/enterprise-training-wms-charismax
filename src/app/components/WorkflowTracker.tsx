import { Check, Loader2, X, User, Bot, ShieldCheck, Award, UserPlus } from "lucide-react";
import { RequestStatus } from "../data/mockData";

const STAGES = [
  { key: "Initiator", label: "Manager",    sub: "Nomination created",  icon: UserPlus },
  { key: "Employee",  label: "Employee",   sub: "Details submitted",   icon: User },
  { key: "AI",        label: "AI Auditor", sub: "Automated review",    icon: Bot },
  { key: "UnitHead",  label: "Unit Head",  sub: "Technical approval",  icon: ShieldCheck },
  { key: "TalentDev", label: "Talent Dev", sub: "Final sign-off",      icon: Award },
];

const STATUS_ORDER: Record<RequestStatus, number> = {
  DraftByManager: 0, PendingEmployee: 1, PendingAI: 2, AIRejected: 2,
  PendingUnitHead: 3, PendingTalentDev: 4, Approved: 5, Rejected: -1,
};
const STAGE_INDEX: Record<string, number> = {
  Initiator: 0, Employee: 1, AI: 2, UnitHead: 3, TalentDev: 4,
};

type StageState = "done" | "active" | "pending" | "rejected";

function getState(status: RequestStatus, key: string): StageState {
  const cur = STATUS_ORDER[status];
  const idx = STAGE_INDEX[key];
  if (status === "AIRejected" && key === "AI") return "rejected";
  if (status === "AIRejected" && idx > 2) return "pending";
  if (status === "Rejected") return idx === 0 ? "done" : "rejected";
  if (cur > idx) return "done";
  if (cur === idx) return "active";
  return "pending";
}

const STYLES: Record<StageState, { circle: string; label: string }> = {
  done:     { circle: "bg-[#2D5A39] border-[#2D5A39] text-white shadow-md",                               label: "text-[#2D5A39]" },
  active:   { circle: "bg-[#F6AD55] border-[#F6AD55] text-white shadow-lg ring-4 ring-[#F6AD55]/25",       label: "text-[#F6AD55]" },
  pending:  { circle: "bg-white border-slate-300 text-slate-400",                                          label: "text-slate-400" },
  rejected: { circle: "bg-red-500 border-red-500 text-white shadow-md",                                    label: "text-red-500" },
};

const STATUS_BADGE: Record<RequestStatus, { label: string; color: string }> = {
  DraftByManager:    { label: "Draft",               color: "bg-slate-100 text-slate-700 border-slate-200" },
  PendingEmployee:   { label: "Awaiting Employee",   color: "bg-sky-100 text-sky-800 border-sky-200" },
  PendingAI:         { label: "AI Auditing…",        color: "bg-purple-100 text-purple-800 border-purple-200" },
  AIRejected:        { label: "AI Returned",         color: "bg-orange-100 text-orange-800 border-orange-200" },
  PendingUnitHead:   { label: "Awaiting Unit Head",  color: "bg-amber-100 text-amber-800 border-amber-200" },
  PendingTalentDev:  { label: "Awaiting Talent Dev", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  Approved:          { label: "Approved ✓",          color: "bg-green-100 text-green-800 border-green-200" },
  Rejected:          { label: "Rejected",            color: "bg-red-100 text-red-800 border-red-200" },
};

export function WorkflowTracker({ status }: { status: RequestStatus }) {
  const badge = STATUS_BADGE[status];
  return (
    <div className="w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[#2D5A39]" style={{ fontWeight: 700 }}>Workflow Progress</h3>
        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${badge.color}`}>
          {badge.label}
        </span>
      </div>
      <div className="flex items-start">
        {STAGES.map((stage, i) => {
          const state = getState(status, stage.key);
          const s = STYLES[state];
          const Icon = stage.icon;
          const isLast = i === STAGES.length - 1;
          return (
            <div key={stage.key} className="flex items-start flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${s.circle}`}>
                  {state === "done"     ? <Check size={18} /> :
                   state === "rejected" ? <X size={18} /> :
                   state === "active"   ? <Loader2 size={18} className="animate-spin" /> :
                   <Icon size={18} />}
                </div>
                <div className="mt-2 text-center px-1">
                  <div className={s.label} style={{ fontSize: "0.78rem", fontWeight: 600 }}>{stage.label}</div>
                  <div className="text-slate-400 hidden sm:block" style={{ fontSize: "0.63rem" }}>{stage.sub}</div>
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 mt-5 mx-1">
                  <div className={`h-0.5 w-full ${state === "done" ? "bg-[#2D5A39]" : "bg-slate-200"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
