import { TrainingRequest, RequestStatus } from "../data/mockData";
import { Eye, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_META: Record<RequestStatus, { label: string; color: string; dot: string }> = {
  DraftByManager:   { label: "Draft",              color: "bg-slate-100 text-slate-700 border-slate-200",   dot: "bg-slate-400" },
  PendingEmployee:  { label: "Awaiting Employee",  color: "bg-sky-50 text-sky-800 border-sky-200",          dot: "bg-sky-500" },
  PendingAI:        { label: "AI Auditing",        color: "bg-purple-50 text-purple-800 border-purple-200", dot: "bg-purple-500" },
  AIRejected:       { label: "AI Returned",        color: "bg-orange-50 text-orange-800 border-orange-200", dot: "bg-orange-500" },
  PendingUnitHead:  { label: "Pending Unit Head",  color: "bg-amber-50 text-amber-800 border-amber-200",    dot: "bg-amber-500" },
  PendingTalentDev: { label: "Pending Talent Dev", color: "bg-indigo-50 text-indigo-800 border-indigo-200", dot: "bg-indigo-500" },
  Approved:         { label: "Approved",           color: "bg-green-50 text-green-800 border-green-200",    dot: "bg-green-500" },
  Rejected:         { label: "Rejected",           color: "bg-red-50 text-red-800 border-red-200",          dot: "bg-red-500" },
};

interface Props {
  requests: TrainingRequest[];
  onView: (req: TrainingRequest) => void;
  onApprove?: (req: TrainingRequest) => void;
  onReject?: (req: TrainingRequest) => void;
  showActions?: boolean;
  approveCheck?: (req: TrainingRequest) => boolean;
}

export function RequestsTable({ requests, onView, onApprove, onReject, showActions, approveCheck }: Props) {
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Clock size={22} className="text-slate-400" />
        </div>
        <p className="text-[#4A5568]" style={{ fontWeight: 500 }}>No requests found</p>
        <p className="text-slate-400" style={{ fontSize: "0.8rem" }}>Requests will appear here once created.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F7FAFC] border-b border-slate-200">
              <Th>Request ID</Th>
              <Th>Employee</Th>
              <Th>Course</Th>
              <Th>Quarter</Th>
              <Th>Cost (USD)</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, idx) => {
              const meta = STATUS_META[r.status];
              const canAct = approveCheck ? approveCheck(r) : true;
              return (
                <tr
                  key={r.id}
                  className={`border-b border-slate-100 hover:bg-[#F7FAFC] transition-colors ${idx % 2 !== 0 ? "bg-slate-50/40" : ""}`}
                >
                  <Td>
                    <span className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.83rem" }}>{r.id}</span>
                  </Td>
                  <Td>
                    <div>
                      <div className="text-[#2D3748]" style={{ fontWeight: 500, fontSize: "0.85rem" }}>{r.employeeName}</div>
                      <div className="text-slate-400" style={{ fontSize: "0.7rem" }}>{r.employeeId}</div>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-[#2D3748]" style={{ fontSize: "0.85rem" }}>
                      {r.courseTitle || <span className="text-slate-400 italic">Not filled yet</span>}
                    </span>
                  </Td>
                  <Td>
                    <span className="px-2 py-0.5 bg-[#2D5A39]/10 text-[#2D5A39] rounded" style={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      {r.quarter}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-[#2D3748]" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                      {r.usdCost > 0 ? `$${r.usdCost.toLocaleString()}` : "—"}
                    </span>
                  </Td>
                  <Td>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onView(r)}
                        title="View details"
                        className="p-1.5 text-[#2D5A39] hover:bg-[#2D5A39]/10 rounded-lg transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                      {showActions && canAct && onApprove && (
                        <button
                          onClick={() => onApprove(r)}
                          title="Quick approve"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      )}
                      {showActions && canAct && onReject && (
                        <button
                          onClick={() => onReject(r)}
                          title="Quick reject"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 bg-[#F7FAFC] border-t border-slate-100">
        <span className="text-slate-400" style={{ fontSize: "0.72rem" }}>
          {requests.length} record{requests.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-[#4A5568]" style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}
