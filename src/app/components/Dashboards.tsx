import { useMemo, useState } from "react";
import { TrainingRequest, User, USERS, RequestStatus } from "../data/mockData";
import { RequestsTable } from "./RequestsTable";
import {
  Plus, FileText, CheckCircle2, Clock, DollarSign, Users as UsersIcon,
  Filter, Download, X, MessageSquare, AlertTriangle,
  ShieldCheck, BarChart2, Eye, GitBranch, UserPlus,
  Search, TrendingUp, Building2, BookOpen,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   SHARED — Functional Icon Card
═══════════════════════════════════════════════════════ */
function FuncCard({
  icon: Icon, label, value, sub, color, onClick, clickLabel,
}: {
  icon: any; label: string; value?: string | number; sub?: string;
  color: string; onClick?: () => void; clickLabel?: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow ${onClick ? "cursor-pointer hover:border-[#2D5A39]" : ""}`}
      onClick={onClick}
    >
      <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
        <Icon size={21} className="text-white" />
      </div>
      {value !== undefined ? (
        <div>
          <div className="text-[#2D5A39]" style={{ fontWeight: 800, fontSize: "1.8rem", lineHeight: 1 }}>
            {value}
          </div>
          <div className="text-[#4A5568] mt-1" style={{ fontSize: "0.78rem" }}>{label}</div>
          {sub && <div className="text-slate-400 mt-0.5" style={{ fontSize: "0.7rem" }}>{sub}</div>}
        </div>
      ) : (
        <div>
          <div className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>{label}</div>
          {clickLabel && <div className="text-[#4A5568] mt-0.5" style={{ fontSize: "0.75rem" }}>{clickLabel}</div>}
        </div>
      )}
    </div>
  );
}

/* Quick Confirm Modal */
interface QuickActionModalProps {
  request: TrainingRequest;
  action: "approve" | "reject";
  onConfirm: (req: TrainingRequest, comment: string) => void;
  onClose: () => void;
}
function QuickActionModal({ request, action, onConfirm, onClose }: QuickActionModalProps) {
  const [comment, setComment] = useState("");
  const isApprove = action === "approve";
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className={`px-6 py-4 ${isApprove ? "bg-green-600" : "bg-red-600"} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {isApprove ? <CheckCircle2 size={18} className="text-white" /> : <X size={18} className="text-white" />}
            </div>
            <div>
              <div className="text-white" style={{ fontWeight: 700 }}>
                {isApprove ? "Confirm Approval" : "Confirm Rejection"}
              </div>
              <div className="text-white/70" style={{ fontSize: "0.72rem" }}>
                {request.id} · {request.employeeName}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-md">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#F7FAFC] rounded-xl p-4 border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#4A5568]">Employee</span>
              <span className="text-[#2D3748] font-medium">{request.employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4A5568]">Course</span>
              <span className="text-[#2D3748] font-medium">{request.courseTitle || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4A5568]">Budget</span>
              <span className={`font-semibold ${request.usdCost > 10000 ? "text-red-600" : "text-green-700"}`}>
                ${request.usdCost.toLocaleString()}
              </span>
            </div>
          </div>
          {!isApprove && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700" style={{ fontSize: "0.77rem" }}>
                Rejection is permanent and logged in the audit trail.
              </p>
            </div>
          )}
          <div>
            <label className="block text-[#4A5568] mb-1.5" style={{ fontSize: "0.82rem", fontWeight: 500 }}>
              <MessageSquare size={12} className="inline mr-1" />
              Comment {isApprove ? "(optional)" : "(recommended)"}
            </label>
            <textarea
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#2D5A39] resize-none"
              rows={3}
              placeholder={isApprove ? "Add a note for the record…" : "Provide a reason for rejection…"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ fontSize: "0.88rem" }}
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-300 rounded-lg text-[#4A5568] hover:bg-slate-50"
            style={{ fontSize: "0.88rem" }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(request, comment); onClose(); }}
            className={`flex-1 py-2.5 rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
            style={{ fontSize: "0.88rem" }}
          >
            {isApprove ? <CheckCircle2 size={15} /> : <X size={15} />}
            {isApprove ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Pending Request Card */
function PendingCard({
  request, onView, onApprove, onReject,
}: {
  request: TrainingRequest; onView: (r: TrainingRequest) => void;
  onApprove: () => void; onReject: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-1 bg-[#2D5A39]" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-[#2D5A39]" style={{ fontWeight: 700 }}>{request.id}</div>
            <div className="text-[#4A5568]" style={{ fontSize: "0.78rem" }}>{request.employeeName}</div>
          </div>
          <span className="px-2 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
            Awaiting Review
          </span>
        </div>
        <div className="space-y-1.5 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-[#4A5568]" style={{ fontSize: "0.77rem" }}>Course</span>
            <span className="text-[#2D3748]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{request.courseTitle || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4A5568]" style={{ fontSize: "0.77rem" }}>Quarter</span>
            <span className="text-[#2D3748]" style={{ fontSize: "0.8rem" }}>{request.quarter}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4A5568]" style={{ fontSize: "0.77rem" }}>Budget</span>
            <span className={`font-semibold ${request.usdCost > 10000 ? "text-red-600" : "text-green-700"}`} style={{ fontSize: "0.8rem" }}>
              ${request.usdCost.toLocaleString()} USD
            </span>
          </div>
        </div>
        {request.comments.some((c) => c.startsWith("AI Auditor")) && (
          <div className="mb-4 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2">
            <span>🤖</span>
            <span className="text-purple-700" style={{ fontSize: "0.72rem" }}>AI Auditor: Passed all checks ✓</span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => onView(request)}
            className="flex-1 py-2 border border-slate-200 text-[#4A5568] rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5"
            style={{ fontSize: "0.8rem" }}
          >
            <Eye size={13} /> View
          </button>
          <button
            onClick={onApprove}
            className="flex-1 py-2 bg-[#2D5A39] text-white rounded-lg hover:bg-[#1F4128] flex items-center justify-center gap-1.5"
            style={{ fontSize: "0.8rem", fontWeight: 600 }}
          >
            <CheckCircle2 size={13} /> Approve
          </button>
          <button
            onClick={onReject}
            className="py-2 px-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* Section Title */
function SectionTitle({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "1rem" }}>{children}</h2>
      {count !== undefined && (
        <span className="px-2 py-0.5 bg-[#2D5A39]/10 text-[#2D5A39] rounded-full text-sm font-semibold">{count}</span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   1. EMPLOYEE DASHBOARD
═══════════════════════════════════════════════════════ */
export function EmployeeDashboard({
  user, requests, onView, onNavigateToAssessment,
}: { user: User; requests: TrainingRequest[]; onView: (r: TrainingRequest) => void; onNavigateToAssessment?: () => void }) {
  const mine = requests.filter((r) => r.employeeId === user.id);
  const approved = mine.filter((r) => r.status === "Approved");
  const workflow = mine.filter((r) => !["Approved", "Rejected"].includes(r.status));
  const actionRequired = mine.filter((r) => r.status === "PendingEmployee" || r.status === "AIRejected");

  return (
    <div className="space-y-6">
      {/* 3 Functional Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FuncCard icon={FileText}     label="My Request"   value={mine.length}     color="bg-[#2D5A39]" />
        <FuncCard icon={CheckCircle2} label="Approved"     value={approved.length} color="bg-green-600" />
        <FuncCard icon={GitBranch}    label="Workflow"     value={workflow.length} color="bg-[#F6AD55]"
          sub="Requests in progress" />
      </div>

      {/* Action banner */}
      {actionRequired.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-white" />
          </div>
          <div>
            <div className="text-amber-900" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              {actionRequired.length} request{actionRequired.length > 1 ? "s" : ""} need your attention
            </div>
            <p className="text-amber-700" style={{ fontSize: "0.8rem" }}>
              Click <strong>View</strong> on the request below to complete your training details and submit.
            </p>
          </div>
        </div>
      )}

      <div>
        <SectionTitle count={mine.length}>My Request</SectionTitle>
        <RequestsTable requests={mine} onView={onView} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. MANAGER DASHBOARD
═══════════════════════════════════════════════════════ */
export function ManagerDashboard({
  user, requests, onView, onNewNomination, onNavigateToAssessment,
}: {
  user: User; requests: TrainingRequest[];
  onView: (r: TrainingRequest) => void; onNewNomination: () => void; onNavigateToAssessment?: () => void;
}) {
  const myNominations = requests.filter((r) => r.nominatorId === user.id);
  const mine = requests.filter((r) => r.employeeId === user.id);
  const myApproved = mine.filter((r) => r.status === "Approved");
  const myWorkflow = mine.filter((r) => !["Approved", "Rejected"].includes(r.status));
  const approvals = myNominations.filter((r) => r.status === "PendingEmployee");
  const teamMembers = USERS.filter((u) => u.managerId === user.id);

  return (
    <div className="space-y-6">
      {/* 4 Functional Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FuncCard icon={FileText}     label="My Request"  value={mine.length}        color="bg-[#2D5A39]" />
        <FuncCard icon={CheckCircle2} label="Approved"    value={myApproved.length}  color="bg-green-600" />
        <FuncCard icon={GitBranch}    label="Workflow"    value={myWorkflow.length}  color="bg-[#F6AD55]" />
        <FuncCard
          icon={UserPlus} label="Nominate Employees" color="bg-[#1F4128]"
          onClick={onNewNomination} clickLabel="Nominate a team member"
        />
      </div>

      {/* Team overview */}
      {teamMembers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <SectionTitle count={teamMembers.length}>Team Members</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {teamMembers.map((m) => {
              const active = myNominations.filter((r) => r.employeeId === m.id && !["Approved","Rejected"].includes(r.status));
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-[#F7FAFC] border border-slate-200 rounded-xl">
                  <div className="w-9 h-9 bg-[#2D5A39] rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                    {m.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#2D3748] truncate" style={{ fontSize: "0.8rem", fontWeight: 600 }}>{m.name}</div>
                    <div className="text-[#4A5568]" style={{ fontSize: "0.68rem" }}>{m.position}</div>
                    {active.length > 0 && (
                      <span className="text-amber-600" style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                        {active.length} active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Training approvals pending */}
      {approvals.length > 0 && (
        <div>
          <SectionTitle count={approvals.length}>Training Approvals — Awaiting Employee</SectionTitle>
          <RequestsTable requests={approvals} onView={onView} />
        </div>
      )}

      <div>
        <SectionTitle count={myNominations.length}>All Nominations</SectionTitle>
        <RequestsTable requests={myNominations} onView={onView} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. TRAINING UNIT HEAD DASHBOARD
═══════════════════════════════════════════════════════ */
export function UnitHeadDashboard({
  user, requests, onView, onApprove, onReject, onNewNomination, onNavigateToAssessment,
}: {
  user: User; requests: TrainingRequest[];
  onView: (r: TrainingRequest) => void;
  onApprove: (r: TrainingRequest, comment?: string) => void;
  onReject: (r: TrainingRequest, comment?: string) => void;
  onNewNomination: () => void;
  onNavigateToAssessment?: () => void;
}) {
  const [modal, setModal] = useState<{ req: TrainingRequest; action: "approve" | "reject" } | null>(null);

  const pending  = requests.filter((r) => r.status === "PendingUnitHead");
  const mine     = requests.filter((r) => r.employeeId === user.id);
  const approved = mine.filter((r) => r.status === "Approved");
  const workflow = mine.filter((r) => !["Approved", "Rejected"].includes(r.status));

  return (
    <div className="space-y-6">
      {/* 5 Functional Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <FuncCard icon={FileText}     label="My Request"         value={mine.length}     color="bg-[#2D5A39]" />
        <FuncCard icon={CheckCircle2} label="Approved"           value={approved.length} color="bg-green-600" />
        <FuncCard icon={GitBranch}    label="Workflow"           value={workflow.length} color="bg-[#F6AD55]"
          sub="Requests in workflow"
        />
        <FuncCard
          icon={UserPlus}
          label="Nominate Employees"
          color="bg-[#1F4128]"
          onClick={onNewNomination}
          clickLabel="Nominate a team member"
        />
        <FuncCard icon={ShieldCheck}  label="Training Approvals" value={pending.length}  color="bg-amber-500"
          sub="Pending Unit Head review"
        />
      </div>

      {/* Pending approval cards */}
      {pending.length > 0 && (
        <div>
          <SectionTitle count={pending.length}>Awaiting My Approval</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map((r) => (
              <PendingCard
                key={r.id} request={r} onView={onView}
                onApprove={() => setModal({ req: r, action: "approve" })}
                onReject={() => setModal({ req: r, action: "reject" })}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle count={requests.length}>All Incoming Requests</SectionTitle>
        <RequestsTable
          requests={requests} onView={onView}
          onApprove={(r) => setModal({ req: r, action: "approve" })}
          onReject={(r)  => setModal({ req: r, action: "reject" })}
          showActions
          approveCheck={(r) => r.status === "PendingUnitHead"}
        />
      </div>

      {modal && (
        <QuickActionModal
          request={modal.req} action={modal.action}
          onConfirm={modal.action === "approve" ? onApprove : onReject}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   4. TALENT DEVELOPMENT DASHBOARD
═══════════════════════════════════════════════════════ */
export function TalentDevDashboard({
  user, requests, onView, onApprove, onReject, onNewNomination, onNavigateToAssessment,
}: {
  user: User; requests: TrainingRequest[];
  onView: (r: TrainingRequest) => void;
  onApprove: (r: TrainingRequest, comment?: string) => void;
  onReject: (r: TrainingRequest, comment?: string) => void;
  onNewNomination: () => void;
  onNavigateToAssessment?: () => void;
}) {
  const [modal, setModal] = useState<{ req: TrainingRequest; action: "approve" | "reject" } | null>(null);

  const pending = requests.filter((r) => r.status === "PendingTalentDev");

  return (
    <div className="space-y-6">
      {/* 2 Functional Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FuncCard
          icon={UserPlus}
          label="Nominate Employees"
          color="bg-[#1F4128]"
          onClick={onNewNomination}
          clickLabel="Nominate a team member"
        />
        <FuncCard icon={ShieldCheck} label="Training Approvals" value={pending.length} color="bg-amber-500"
          sub="Pending final approval"
        />
      </div>

      {/* Pending sign-off cards */}
      {pending.length > 0 && (
        <div>
          <SectionTitle count={pending.length}>Awaiting Final Sign-off</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pending.map((r) => (
              <PendingCard
                key={r.id} request={r} onView={onView}
                onApprove={() => setModal({ req: r, action: "approve" })}
                onReject={() => setModal({ req: r, action: "reject" })}
              />
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={26} className="text-green-600" />
          </div>
          <div className="text-green-800" style={{ fontWeight: 700 }}>All caught up!</div>
          <p className="text-green-600" style={{ fontSize: "0.83rem" }}>No requests awaiting final sign-off.</p>
        </div>
      )}

      {modal && (
        <QuickActionModal
          request={modal.req} action={modal.action}
          onConfirm={modal.action === "approve" ? onApprove : onReject}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5. HR ADMIN — REPORTING ROOM
═══════════════════════════════════════════════════════ */
export function HRAdminDashboard({
  user, requests, onView, onNavigateToAssessment,
}: { user: User; requests: TrainingRequest[]; onView: (r: TrainingRequest) => void; onNavigateToAssessment?: () => void }) {
  const [filter, setFilter] = useState<"all" | "approved" | "rejected" | "pending">("all");
  const [empSearch, setEmpSearch] = useState("");
  const [empResult, setEmpResult] = useState<TrainingRequest[]>([]);
  const [searchedId, setSearchedId] = useState("");

  /* Core metrics */
  const grandTotal   = requests.length;
  const finalApproved = requests.filter((r) => r.status === "Approved").length;
  const inProgress   = requests.filter((r) => !["Approved", "Rejected"].includes(r.status)).length;
  const totalBudget  = requests.filter((r) => r.status === "Approved").reduce((a, b) => a + b.usdCost, 0);

  /* Top Provider */
  const topInstitutes = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach((r) => {
      if (r.provider) map[r.provider] = (map[r.provider] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [requests]);

  const maxInstCount = topInstitutes[0]?.count || 1;

  /* Quarterly */
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const quarterlyData = useMemo(() =>
    quarters.map((q) => {
      const qReqs = requests.filter((r) => r.quarter === q);
      return {
        quarter: q,
        total: qReqs.length,
        approved: qReqs.filter((r) => r.status === "Approved").length,
        budget: qReqs.filter((r) => r.status === "Approved").reduce((a, b) => a + b.usdCost, 0),
      };
    }), [requests]
  );
  const maxQCount = Math.max(...quarterlyData.map((q) => q.total), 1);

  /* Departmental */
  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    requests.forEach((r) => {
      const dept = r.employeeDepartment || "Unknown";
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [requests]);
  const maxDeptCount = Math.max(...deptData.map((d) => d[1]), 1);

  /* Budget by quarter */
  const maxBudget = Math.max(...quarterlyData.map((q) => q.budget), 1);

  /* Employee search */
  const handleEmpSearch = () => {
    const q = empSearch.trim().toUpperCase();
    setSearchedId(q);
    const found = requests.filter((r) => r.employeeId.toUpperCase() === q);
    setEmpResult(found);
  };

  /* Table filter */
  const filtered = useMemo(() => {
    if (filter === "approved") return requests.filter((r) => r.status === "Approved");
    if (filter === "rejected") return requests.filter((r) => r.status === "Rejected");
    if (filter === "pending")  return requests.filter((r) => !["Approved", "Rejected"].includes(r.status));
    return requests;
  }, [filter, requests]);

  /* CSV Export */
  const handleExport = () => {
    const csv = [
      ["ID", "Employee", "Department", "Course", "Institute", "Quarter", "Status", "USD Cost", "Start", "End"].join(","),
      ...requests.map((r) =>
        [r.id, r.employeeName, r.employeeDepartment || "—", `"${r.courseTitle}"`,
         r.provider || "—",
         r.quarter, r.status, r.usdCost, r.startDate, r.endDate].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `TWMS_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2D5A39] text-white rounded-xl hover:bg-[#1F4128] shadow-md transition-all"
          style={{ fontWeight: 600, fontSize: "0.85rem" }}
        >
          <Download size={17} /> Export CSV
        </button>
      </div>

      {/* ── Core Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <FuncCard icon={FileText}     label="Grand Total Requests"  value={grandTotal}   color="bg-[#2D5A39]" />
        <FuncCard icon={CheckCircle2} label="Final Approved"        value={finalApproved} color="bg-green-600"
          sub="Completed full cycle" />
        <FuncCard icon={Clock}        label="In Progress"           value={inProgress}   color="bg-[#F6AD55]" />
        <FuncCard icon={DollarSign}   label="Total Approved Budget" value={`$${totalBudget.toLocaleString()}`} color="bg-[#1F4128]" />
      </div>

      {/* ── Analytics Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Institute */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#2D5A39]/10 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-[#2D5A39]" />
            </div>
            <h3 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              Top Training Institutes
            </h3>
          </div>
          {topInstitutes.length > 0 ? (
            <div className="space-y-3">
              {topInstitutes.map(({ name, count }, idx) => (
                <div key={name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#4A5568] truncate pr-2" style={{ fontSize: "0.8rem" }}>
                      {idx === 0 && <span className="text-[#F6AD55] mr-1">★</span>}
                      {name}
                    </span>
                    <span className="text-[#2D5A39] flex-shrink-0" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                      {count} req{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-[#2D5A39] h-2 rounded-full transition-all"
                      style={{ width: `${(count / maxInstCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#4A5568] text-center py-4" style={{ fontSize: "0.82rem" }}>No data yet</p>
          )}
        </div>

        {/* Quarterly Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#F6AD55]/10 rounded-lg flex items-center justify-center">
              <BarChart2 size={16} className="text-[#F6AD55]" />
            </div>
            <h3 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              Quarterly Analysis
            </h3>
          </div>
          <div className="space-y-3">
            {quarterlyData.map(({ quarter, total, approved, budget }) => (
              <div key={quarter}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#4A5568]" style={{ fontSize: "0.8rem" }}>{quarter}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600" style={{ fontSize: "0.72rem", fontWeight: 600 }}>
                      {approved} ✓
                    </span>
                    <span className="text-[#2D5A39]" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                      {total} total
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 relative overflow-hidden">
                  <div
                    className="bg-[#F6AD55] h-2.5 rounded-full"
                    style={{ width: `${(total / maxQCount) * 100}%` }}
                  />
                  <div
                    className="absolute top-0 left-0 bg-[#2D5A39] h-2.5 rounded-full"
                    style={{ width: `${(approved / maxQCount) * 100}%` }}
                  />
                </div>
                <div className="text-slate-400 mt-0.5" style={{ fontSize: "0.68rem" }}>
                  ${budget.toLocaleString()} approved
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-[#2D5A39]" />
              <span className="text-[#4A5568]" style={{ fontSize: "0.68rem" }}>Approved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-full bg-[#F6AD55]" />
              <span className="text-[#4A5568]" style={{ fontSize: "0.68rem" }}>Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Analytics Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Departmental Usage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <UsersIcon size={16} className="text-green-600" />
            </div>
            <h3 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              Departmental Usage
            </h3>
          </div>
          {deptData.length > 0 ? (
            <div className="space-y-3">
              {deptData.map(([dept, count]) => (
                <div key={dept}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#4A5568]" style={{ fontSize: "0.8rem" }}>{dept}</span>
                    <span className="text-[#2D5A39]" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                      {count} req{count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(count / maxDeptCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#4A5568] text-center py-4" style={{ fontSize: "0.82rem" }}>No data yet</p>
          )}
        </div>

        {/* Budget Tracking */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#1F4128]/10 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-[#1F4128]" />
            </div>
            <h3 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              Budget Tracking
            </h3>
          </div>
          <div className="space-y-4">
            {quarterlyData.map(({ quarter, budget }) => (
              <div key={quarter}>
                <div className="flex justify-between mb-1">
                  <span className="text-[#4A5568]" style={{ fontSize: "0.8rem" }}>{quarter}</span>
                  <span className="text-[#2D5A39]" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                    ${budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-[#F6AD55] h-3 rounded-full transition-all"
                    style={{ width: `${maxBudget > 0 ? (budget / maxBudget) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-200 flex justify-between">
              <span className="text-[#4A5568]" style={{ fontWeight: 600, fontSize: "0.82rem" }}>Total Approved</span>
              <span className="text-[#2D5A39]" style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                ${totalBudget.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee ID Workflow Search ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#2D5A39]/10 rounded-lg flex items-center justify-center">
            <Search size={16} className="text-[#2D5A39]" />
          </div>
          <h3 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            Workflow Tracking — Search by Employee ID
          </h3>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmpSearch()}
              placeholder="Enter Employee ID (e.g. E001)"
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10"
              style={{ fontSize: "0.85rem" }}
            />
          </div>
          <button
            onClick={handleEmpSearch}
            className="px-5 py-2.5 bg-[#2D5A39] text-white rounded-xl hover:bg-[#1F4128] transition-colors"
            style={{ fontWeight: 600, fontSize: "0.85rem" }}
          >
            Search
          </button>
        </div>

        {searchedId && (
          empResult.length > 0 ? (
            <div className="space-y-3">
              <div className="text-[#4A5568]" style={{ fontSize: "0.8rem" }}>
                Found <strong>{empResult.length}</strong> request{empResult.length !== 1 ? "s" : ""} for employee <strong>{searchedId}</strong>
              </div>
              {empResult.map((r) => (
                <div
                  key={r.id}
                  className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.85rem" }}>{r.id}</div>
                      <div className="text-[#4A5568]" style={{ fontSize: "0.75rem" }}>{r.courseTitle || "No course"}</div>
                    </div>
                    <div className="hidden sm:block text-[#4A5568]" style={{ fontSize: "0.75rem" }}>{r.quarter}</div>
                    <StatusBadge status={r.status} />
                  </div>
                  <button
                    onClick={() => onView(r)}
                    className="px-3 py-1.5 border border-[#2D5A39] text-[#2D5A39] rounded-lg hover:bg-[#2D5A39]/10 flex items-center gap-1.5"
                    style={{ fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    <Eye size={13} /> View
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[#4A5568]" style={{ fontSize: "0.85rem" }}>
                No requests found for employee ID <strong>{searchedId}</strong>
              </p>
            </div>
          )
        )}
      </div>

      {/* ── Filter & Full Table ── */}
      <div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2">
            <Filter size={14} className="text-[#4A5568]" />
            <span className="text-[#4A5568]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Filter:</span>
          </div>
          {([
            { key: "all",      label: "All",         count: requests.length },
            { key: "pending",  label: "In Progress", count: inProgress },
            { key: "approved", label: "Approved",    count: finalApproved },
            { key: "rejected", label: "Rejected",    count: requests.filter((r) => r.status === "Rejected").length },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
                filter === key
                  ? "bg-[#2D5A39] text-white shadow-md"
                  : "bg-slate-100 text-[#4A5568] hover:bg-slate-200"
              }`}
              style={{ fontSize: "0.78rem", fontWeight: 500 }}
            >
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full ${filter === key ? "bg-white/20" : "bg-white border border-slate-200"}`}
                style={{ fontWeight: 700, fontSize: "0.68rem" }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        <SectionTitle count={filtered.length}>
          All Requests {filter !== "all" && `— ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
        </SectionTitle>
        <RequestsTable requests={filtered} onView={onView} />
      </div>
    </div>
  );
}

/* Status badge helper */
const STATUS_META: Record<RequestStatus, { label: string; color: string }> = {
  DraftByManager:   { label: "Draft",              color: "bg-slate-100 text-slate-700" },
  PendingEmployee:  { label: "Awaiting Employee",  color: "bg-sky-100 text-sky-800" },
  PendingAI:        { label: "AI Auditing",        color: "bg-purple-100 text-purple-800" },
  AIRejected:       { label: "AI Returned",        color: "bg-orange-100 text-orange-800" },
  PendingUnitHead:  { label: "Pending Unit Head",  color: "bg-amber-100 text-amber-800" },
  PendingTalentDev: { label: "Pending Talent Dev", color: "bg-indigo-100 text-indigo-800" },
  Approved:         { label: "Approved",           color: "bg-green-100 text-green-800" },
  Rejected:         { label: "Rejected",           color: "bg-red-100 text-red-800" },
};
function StatusBadge({ status }: { status: RequestStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.color}`}>{m.label}</span>
  );
}
