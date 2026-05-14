import { useState } from "react";
import { TrainingRequest, User } from "../data/mockData";
import { WorkflowTracker } from "./WorkflowTracker";
import { SmartTrainingForm } from "./SmartTrainingForm";
import {
  ArrowLeft, MessageSquare, CheckCircle2, XCircle, X, AlertTriangle,
  Building, Calendar, DollarSign, MapPin, BookOpen, User as UserIcon,
} from "lucide-react";

interface Props {
  request: TrainingRequest;
  user: User;
  onBack: () => void;
  onUpdate: (r: TrainingRequest) => void;
}

export function RequestDetail({ request, user, onBack, onUpdate }: Props) {
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(null);
  const [confirmComment, setConfirmComment] = useState("");

  const isEmployeeAction =
    user.id === request.employeeId &&
    (request.status === "PendingEmployee" || request.status === "AIRejected");

  const canUnitHead  = user.role === "TrainingUnitHead"  && request.status === "PendingUnitHead";
  const canTalentDev = user.role === "TalentDevManager"  && request.status === "PendingTalentDev";

  const handleConfirmAction = () => {
    const extra = confirmComment ? ` — "${confirmComment}"` : "";
    if (showConfirm === "approve") {
      if (canUnitHead) {
        onUpdate({ ...request, status: "PendingTalentDev", comments: [...request.comments, `✅ Unit Head (${user.name}): Approved.${extra}`] });
      } else if (canTalentDev) {
        onUpdate({ ...request, status: "Approved",         comments: [...request.comments, `✅ Talent Dev (${user.name}): Final sign-off.${extra}`] });
      }
    } else {
      onUpdate({ ...request, status: "Rejected", comments: [...request.comments, `❌ ${user.name}: Rejected.${extra}`] });
    }
    setShowConfirm(null);
    setConfirmComment("");
  };

  const institute = request.provider || "—";

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-[#2D5A39] hover:underline" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
        <ArrowLeft size={15} /> Back to Dashboard
      </button>

      <WorkflowTracker status={request.status} />

      {isEmployeeAction ? (
        <SmartTrainingForm request={request} onSubmit={onUpdate} onCancel={onBack} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto overflow-hidden">
          {/* Card header */}
          <div style={{ background: "linear-gradient(135deg, #1F4128 0%, #2D5A39 100%)" }} className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Request Details</h2>
              <p className="text-green-200" style={{ fontSize: "0.77rem" }}>{request.id}</p>
            </div>
            {(canUnitHead || canTalentDev) && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowConfirm("approve"); setConfirmComment(""); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 shadow"
                  style={{ fontWeight: 600, fontSize: "0.83rem" }}
                >
                  <CheckCircle2 size={15} /> Approve
                </button>
                <button
                  onClick={() => { setShowConfirm("reject"); setConfirmComment(""); }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow"
                  style={{ fontWeight: 600, fontSize: "0.83rem" }}
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <DetailGroup title="People">
                <DF icon={<UserIcon size={13} />}    label="Employee"     value={request.employeeName} />
                <DF icon={<UserIcon size={13} />}    label="Nominated By" value={request.nominatorName} />
              </DetailGroup>
              <DetailGroup title="Program">
                <DF icon={<BookOpen size={13} />}   label="Competency"   value={request.competency} />
                <DF icon={<Calendar size={13} />}   label="Quarter"      value={request.quarter} />
              </DetailGroup>
              <DetailGroup title="Course & Venue">
                <DF icon={<BookOpen size={13} />}   label="Course"       value={request.courseTitle || "—"} />
                <DF icon={<Building size={13} />}   label="Institute"    value={institute} />
                <DF icon={<MapPin size={13} />}     label="Venue"        value={`${request.venueLocation || "—"} — ${request.city || "—"}`} />
              </DetailGroup>
              <DetailGroup title="Schedule & Cost">
                <DF icon={<Calendar size={13} />}   label="Start Date"   value={request.startDate || "—"} />
                <DF icon={<Calendar size={13} />}   label="End Date"     value={request.endDate || "—"} />
                <DF icon={<Calendar size={13} />}   label="Duration"     value={`${request.durationDays} days`} />
                <DF icon={<DollarSign size={13} />} label="Cost"         value={`${request.basicCost.toLocaleString()} ${request.currency}`} />
                <DF icon={<DollarSign size={13} />} label="USD Equiv."   value={`$${request.usdCost.toLocaleString()}`} highlight={request.usdCost > 10000 ? "red" : "green"} />
              </DetailGroup>
            </div>

            {/* Audit Trail */}
            <div>
              <h3 className="text-[#2D5A39] mb-4 flex items-center gap-2 pb-2 border-b border-slate-200" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                <MessageSquare size={15} />
                Audit Trail
                <span className="ml-1 px-2 py-0.5 bg-[#2D5A39]/10 text-[#2D5A39] rounded-full text-xs">{request.comments.length} entries</span>
              </h3>
              {request.comments.length === 0 ? (
                <p className="text-[#4A5568] text-center py-4" style={{ fontSize: "0.83rem" }}>No audit entries yet.</p>
              ) : (
                <ul className="space-y-2">
                  {request.comments.map((c, i) => (
                    <li key={i} className={`p-3 rounded-xl border flex items-start gap-2 ${
                      c.startsWith("✅") ? "bg-green-50 border-green-200" :
                      c.startsWith("❌") ? "bg-red-50 border-red-200" :
                      c.startsWith("AI Auditor") ? "bg-purple-50 border-purple-200" :
                      "bg-[#F7FAFC] border-slate-200"
                    }`}>
                      <span style={{ fontSize: "0.85rem" }}>
                        {c.startsWith("✅") ? "✅" : c.startsWith("❌") ? "❌" : c.startsWith("AI") ? "🤖" : "📋"}
                      </span>
                      <span className="text-[#2D3748]" style={{ fontSize: "0.82rem" }}>{c.replace(/^[✅❌🤖📋]\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className={`px-6 py-4 ${showConfirm === "approve" ? "bg-green-600" : "bg-red-600"} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  {showConfirm === "approve" ? <CheckCircle2 size={17} className="text-white" /> : <X size={17} className="text-white" />}
                </div>
                <div>
                  <div className="text-white" style={{ fontWeight: 700 }}>{showConfirm === "approve" ? "Confirm Approval" : "Confirm Rejection"}</div>
                  <div className="text-white/70" style={{ fontSize: "0.72rem" }}>{request.id}</div>
                </div>
              </div>
              <button onClick={() => setShowConfirm(null)} className="text-white/70 hover:text-white p-1 rounded-md"><X size={17} /></button>
            </div>
            <div className="p-6 space-y-4">
              {showConfirm === "reject" && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700" style={{ fontSize: "0.77rem" }}>This action is permanent and logged in the audit trail.</p>
                </div>
              )}
              <div>
                <label className="block text-[#4A5568] mb-1.5" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                  Comment {showConfirm === "approve" ? "(optional)" : "(recommended)"}
                </label>
                <textarea rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-[#2D5A39] resize-none"
                  placeholder={showConfirm === "approve" ? "Add a note…" : "Provide a reason…"}
                  value={confirmComment} onChange={(e) => setConfirmComment(e.target.value)}
                  style={{ fontSize: "0.88rem" }} />
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-[#4A5568] hover:bg-slate-50"
                style={{ fontSize: "0.88rem" }}>Cancel</button>
              <button onClick={handleConfirmAction}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 ${showConfirm==="approve"?"bg-green-600 hover:bg-green-700":"bg-red-600 hover:bg-red-700"}`}
                style={{ fontSize: "0.88rem" }}>
                {showConfirm === "approve" ? <CheckCircle2 size={15} /> : <X size={15} />}
                {showConfirm === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F7FAFC] border border-slate-200 rounded-2xl p-4">
      <div className="text-[#2D5A39] mb-3 pb-2 border-b border-slate-200" style={{ fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {title}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function DF({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: "red" | "green" }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-[#2D5A39]/60 flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-[#4A5568]" style={{ fontSize: "0.7rem" }}>{label}</div>
        <div className={highlight==="red"?"text-red-600 font-semibold":highlight==="green"?"text-green-700 font-semibold":"text-[#2D3748]"}
          style={{ fontSize: "0.86rem", fontWeight: highlight ? 600 : 400 }}>
          {value}
        </div>
      </div>
    </div>
  );
}
