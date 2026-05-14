import { useMemo, useState } from "react";
import { ArrowLeft, UserCircle2, Users, BookOpen, Calendar, FileText } from "lucide-react";
import {
  USERS,
  QUARTERS,
  TrainingRequest,
  User,
  competenciesForDepartment,
} from "../data/mockData";

// ─────────────────────────────────────────────────────────────────────────────
//  Manager Selection form
//
//  Per the client spec, a Manager / Training Unit Head / Talent Dev Manager
//  uses this screen to create a new training nomination targeted at one of
//  their direct reports. The form contains ONLY the 5 "Manager Selection"
//  fields. Once submitted the request is persisted with status
//  `PendingEmployee` so the chosen employee can complete the rest of the form
//  through `SmartTrainingForm`.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  user: User;
  onCancel: () => void;
  onCreate: (req: TrainingRequest) => void;
}

const OTHER_COMPETENCY = "Other";

function SectionHead({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#1F4128] to-[#2D5A39] px-6 py-4 rounded-t-2xl">
      <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-white">{icon}</div>
      <div>
        <div className="text-white font-bold" style={{ fontSize: "0.95rem" }}>{title}</div>
        {subtitle && <div className="text-green-200" style={{ fontSize: "0.72rem" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function Field({
  label, required, full, hint, children,
}: { label: string; required?: boolean; full?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <div className="text-[0.7rem] text-slate-400">{hint}</div>}
    </div>
  );
}

const inputCls =
  "text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 w-full outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition";
const readonlyCls =
  "text-sm px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 w-full outline-none cursor-default";

export function TrainingNeedAssessment({ user, onCancel, onCreate }: Props) {
  // The list of direct reports (people who report to this manager).
  const subordinates = useMemo(
    () => USERS.filter((u) => u.managerId === user.id),
    [user.id],
  );

  const [employeeId, setEmployeeId] = useState(subordinates[0]?.id ?? "");
  const [competency, setCompetency] = useState("");
  const [otherCompetency, setOtherCompetency] = useState("");
  const [quarter, setQuarter] = useState(QUARTERS[0]);
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const selectedEmployee = subordinates.find((s) => s.id === employeeId);
  const competencyOptions = competenciesForDepartment(user.department);

  const handleSubmit = () => {
    setError("");

    if (!selectedEmployee) {
      setError("Please select an employee from your team.");
      return;
    }
    if (!competency) {
      setError("Please choose a competency.");
      return;
    }
    if (competency === OTHER_COMPETENCY && !otherCompetency.trim()) {
      setError("Please describe the 'Other' competency.");
      return;
    }

    const newReq: TrainingRequest = {
      id: `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nominatorId: user.id,
      nominatorName: user.name,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeDepartment: selectedEmployee.department,
      employeeGrade: selectedEmployee.grade,
      competency: competency === OTHER_COMPETENCY ? otherCompetency.trim() : competency,
      otherCompetency: competency === OTHER_COMPETENCY ? otherCompetency.trim() : undefined,
      quarter,
      trainingDetails: details.trim() || undefined,
      // Training Details — left blank for the employee to fill in
      courseTitle: "",
      provider: "",
      startDate: "",
      endDate: "",
      durationDays: 0,
      basicCost: 0,
      currency: "USD",
      usdCost: 0,
      trainingMethod: "",
      venueLocation: "",
      city: "",
      status: "PendingEmployee",
      comments: [`Nominated by ${user.name} (${user.id}).`],
      createdAt: new Date().toISOString().split("T")[0],
    };

    onCreate(newReq);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border-t-4 border-[#2D5A39]">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Users size={28} className="text-green-700" />
          </div>
          <h2 className="text-[#2D5A39] font-bold text-2xl mb-2">Nomination Sent</h2>
          <p className="text-gray-600 mb-7" style={{ fontSize: "0.9rem" }}>
            {selectedEmployee?.name} has been notified to complete the training details.
            The request will move through AI audit and management approvals afterwards.
          </p>
          <button
            onClick={onCancel}
            className="w-full bg-[#2D5A39] hover:bg-[#1F4128] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D5A39] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#2D5A39]">Send Training Request</h1>
            <p className="text-slate-500" style={{ fontSize: "0.78rem" }}>
              Fill the Manager Selection card — your employee will complete the rest.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <SectionHead
            icon={<UserCircle2 size={18} />}
            title="Manager Selection"
            subtitle="Information you provide to your employee"
          />

          <div className="p-7 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            {error && (
              <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Manager ID — read-only, auto from session */}
            <Field label="Manager ID" required>
              <input className={readonlyCls} value={user.id} readOnly />
            </Field>

            {/* Employee ID — dropdown of direct reports */}
            <Field
              label="Employee ID"
              required
              hint={subordinates.length === 0 ? "You have no direct reports configured." : undefined}
            >
              <select
                className={inputCls}
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={subordinates.length === 0}
              >
                {subordinates.length === 0 && <option value="">— No team members —</option>}
                {subordinates.map((s) => (
                  <option key={s.id} value={s.id}>{s.id} — {s.name}</option>
                ))}
              </select>
            </Field>

            {/* Manager Name */}
            <Field label="Manager Name">
              <input className={readonlyCls} value={user.name} readOnly />
            </Field>

            {/* Employee Pay Grade */}
            <Field label="Employee Pay Grade">
              <input
                className={readonlyCls}
                value={selectedEmployee?.grade ?? ""}
                readOnly
                placeholder="—"
              />
            </Field>

            {/* Employee Competencies */}
            <Field label="Employee Competencies" required>
              <select
                className={inputCls}
                value={competency}
                onChange={(e) => setCompetency(e.target.value)}
              >
                <option value="">Select a competency…</option>
                {competencyOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value={OTHER_COMPETENCY}>Other</option>
              </select>
            </Field>

            {/* Other Competencies (text) — visible only when "Other" is chosen */}
            <Field label="Other Competencies">
              <input
                className={inputCls}
                value={otherCompetency}
                onChange={(e) => setOtherCompetency(e.target.value)}
                disabled={competency !== OTHER_COMPETENCY}
                placeholder={competency === OTHER_COMPETENCY ? "Describe the competency…" : "Select 'Other' above to enable"}
              />
            </Field>

            {/* Time Frame (Quarter) */}
            <Field label="Time Frame (Quarter)" required>
              <select className={inputCls} value={quarter} onChange={(e) => setQuarter(e.target.value)}>
                {QUARTERS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </Field>

            <div />

            {/* More Details For Training Need */}
            <Field label="More Details For Training Need" full>
              <textarea
                className={inputCls + " resize-y min-h-[110px]"}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any context the employee should know about this training need…"
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-7 py-5 bg-[#F7FAFC] border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-7 py-2.5 rounded-lg border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={subordinates.length === 0}
              className="px-7 py-2.5 rounded-lg bg-[#2D5A39] text-white font-bold hover:bg-[#1F4128] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FileText size={15} />
              Send to Employee
            </button>
          </div>
        </div>

        {/* Info side-card */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-5 flex items-start gap-3">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
            <BookOpen size={14} />
          </div>
          <div className="text-blue-900" style={{ fontSize: "0.82rem" }}>
            After you send the request, the employee will see this Manager Selection
            (read-only) and complete the Training Details section.
            The full request then moves to AI Audit → Training Unit Head → Talent Development for final approval.
          </div>
        </div>

        {/* Calendar legend (small visual) */}
        <div className="mt-4 flex items-center gap-2 text-slate-500" style={{ fontSize: "0.72rem" }}>
          <Calendar size={12} />
          Quarters use the calendar year.
        </div>
      </div>
    </div>
  );
}
