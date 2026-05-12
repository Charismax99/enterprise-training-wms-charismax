import { useState } from "react";

const GRADES = ["Grade 1 — Junior","Grade 2 — Mid-level","Grade 3 — Senior","Grade 4 — Lead","Grade 5 — Principal"];
const COMPETENCIES = ["Leadership & Management","Technical Skills","Communication","Problem Solving","Project Management"];
const TIMEFRAMES = ["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)","Annual"];
const TRAININGS = ["Leadership Excellence Program","PMP Certification","Data Analytics Fundamentals","Cybersecurity Essentials","Agile & Scrum Practitioner","Excel Advanced Skills","Other"];
const PROVIDERS = ["Coursera","LinkedIn Learning","PMI","SHRM","Udemy Business","Internal L&D","External Consultant"];
const GROUPS = ["Individual contributor","Team lead","Middle management","Senior management","All staff"];
const VENUES = ["Head Office — Riyadh","Branch — Jeddah","Branch — Dammam","External Training Center","Online / Virtual"];
const METHODS = ["Classroom / In-person","Online — Self-paced","Online — Instructor-led","Blended","On-the-job training"];

const SAR_RATE = 3.75;

const initialForm = {
  managerId: "", reporteeId: "", payGrade: "", competency: "", otherCompetency: "",
  timeFrame: "", trainingDetails: "", trainingTitle: "", provider: "", otherTitle: "",
  employeeName: "", durationDays: "", weblink: "", targetedGroup: "", courseFeesUSD: "",
  rating: 0, startDay: "", venue: "", endDay: "", trainingCity: "", deliveryMethod: "",
  costTravel: "", costCourse: "", costPerdiem: "", costVisa: "",
};

function Field({ label, required, children, full }) {
  return (
    <div className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium text-gray-500">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-800 w-full outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition";
const selectCls = inputCls;
const readonlyCls = "text-sm px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 w-full outline-none cursor-default";

function SectionHead({ icon, title }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border-b border-green-100 px-4 py-2.5">
      <span className="text-green-700 text-base">{icon}</span>
      <span className="text-sm font-semibold text-gray-800">{title}</span>
    </div>
  );
}

export default function TrainingNeedAssessment() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "courseFeesUSD") {
        const usd = parseFloat(val) || 0;
        next.costCourse = usd > 0 ? (usd * SAR_RATE).toFixed(2) : "";
      }
      return next;
    });
  };

  const total = (() => {
    const t = [form.costTravel, form.costCourse, form.costPerdiem, form.costVisa]
      .reduce((s, v) => s + (parseFloat(v) || 0), 0);
    return t > 0 ? t.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
  })();

  const handleSubmit = () => {
    if (!form.managerId.trim() || !form.reporteeId.trim()) {
      alert("Please fill in required fields: Manager ID and Reportee Employee ID.");
      return;
    }
    setOpen(false);
    setSubmitted(true);
    setForm(initialForm);
  };

  const handleClose = () => { setOpen(false); setForm(initialForm); };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🎓 Training Need Assessment
        </h1>
        <button
          onClick={() => { setOpen(true); setSubmitted(false); }}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
        >
          + New Request
        </button>
      </div>

      {/* Empty / success state */}
      <div className="text-center py-20 text-gray-400">
        {submitted ? (
          <>
            <div className="text-5xl mb-3">✅</div>
            <p className="text-green-700 font-medium text-base">Training request submitted successfully</p>
            <p className="text-sm mt-1">Your request has been sent to HR for review.</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-600 font-medium">No training requests yet</p>
            <p className="text-sm mt-1">Click "New Request" to submit a training need assessment.</p>
          </>
        )}
      </div>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-white border-2 border-green-600 rounded-xl w-full max-w-3xl shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between bg-green-50 border-b border-green-200 px-5 py-3 rounded-t-xl">
              <span className="font-semibold text-green-900 text-sm">Training Need Assessment — New Request</span>
              <button onClick={handleClose} className="text-green-700 hover:bg-green-200 rounded px-2 py-0.5 text-lg leading-none transition">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-5">

              {/* Section 1 — Manager & Employee */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHead icon="👤" title="Manager & Employee Information" />
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Manager ID" required>
                    <input className={inputCls} value={form.managerId} onChange={set("managerId")} placeholder="e.g. MGR-00142" />
                  </Field>
                  <Field label="Reportee Employee ID" required>
                    <input className={inputCls} value={form.reporteeId} onChange={set("reporteeId")} placeholder="e.g. EMP-00587" />
                  </Field>
                  <Field label="Employee Pay Grade">
                    <select className={selectCls} value={form.payGrade} onChange={set("payGrade")}>
                      <option value="">Select grade</option>
                      {GRADES.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Employee Competencies">
                    <select className={selectCls} value={form.competency} onChange={set("competency")}>
                      <option value="">Select competency</option>
                      {COMPETENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Other Competencies">
                    <input className={inputCls} value={form.otherCompetency} onChange={set("otherCompetency")} placeholder="Specify additional competencies" />
                  </Field>
                  <Field label="Time Frame">
                    <select className={selectCls} value={form.timeFrame} onChange={set("timeFrame")}>
                      <option value="">Select time frame</option>
                      {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="More Details For Training Need" full>
                    <textarea
                      className={inputCls + " resize-y min-h-[70px]"}
                      value={form.trainingDetails}
                      onChange={set("trainingDetails")}
                      placeholder="Describe the specific training requirements, gaps identified, or business justification…"
                    />
                  </Field>
                </div>
              </div>

              {/* Section 2 — Training Details */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHead icon="🎓" title="Training Details" />
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Training Title" required>
                    <select className={selectCls} value={form.trainingTitle} onChange={set("trainingTitle")}>
                      <option value="">Select training</option>
                      {TRAININGS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Provider" required>
                    <select className={selectCls} value={form.provider} onChange={set("provider")}>
                      <option value="">Select provider</option>
                      {PROVIDERS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </Field>
                  <Field label="Other Training Title">
                    <input className={inputCls} value={form.otherTitle} onChange={set("otherTitle")} placeholder="If not listed above" />
                  </Field>
                  <Field label="Employee Name / ID">
                    <input className={inputCls} value={form.employeeName} onChange={set("employeeName")} placeholder="e.g. Sarah Al-Rashid / EMP-00587" />
                  </Field>
                  <Field label="Duration in Days">
                    <input type="number" min="1" className={inputCls} value={form.durationDays} onChange={set("durationDays")} placeholder="e.g. 5" />
                  </Field>
                  <Field label="Course Weblink">
                    <input type="url" className={inputCls} value={form.weblink} onChange={set("weblink")} placeholder="https://" />
                  </Field>
                  <Field label="Targeted Group">
                    <select className={selectCls} value={form.targetedGroup} onChange={set("targetedGroup")}>
                      <option value="">Select group</option>
                      {GROUPS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Course Fees in USD">
                    <input type="number" min="0" step="0.01" className={inputCls} value={form.courseFeesUSD} onChange={set("courseFeesUSD")} placeholder="0.00" />
                  </Field>
                  <Field label="Course Feedback Rating" full>
                    <div className="flex gap-1 py-1">
                      {[1,2,3,4,5].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, rating: v }))}
                          className={`text-2xl transition ${form.rating >= v ? "text-amber-500" : "text-gray-300"}`}
                          aria-label={`${v} star`}
                        >★</button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>

              {/* Section 3 — Employee Selection */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHead icon="📅" title="Employee Selection & Schedule" />
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Start Day" required>
                    <input type="date" className={inputCls} value={form.startDay} onChange={set("startDay")} />
                  </Field>
                  <Field label="Venue Location">
                    <select className={selectCls} value={form.venue} onChange={set("venue")}>
                      <option value="">Select venue</option>
                      {VENUES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </Field>
                  <Field label="End Day" required>
                    <input type="date" className={inputCls} value={form.endDay} onChange={set("endDay")} />
                  </Field>
                  <Field label="Training City">
                    <input className={inputCls} value={form.trainingCity} onChange={set("trainingCity")} placeholder="e.g. Riyadh, London, Dubai" />
                  </Field>
                  <Field label="Delivery Method">
                    <select className={selectCls} value={form.deliveryMethod} onChange={set("deliveryMethod")}>
                      <option value="">Select method</option>
                      {METHODS.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Section 4 — Training Costs */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SectionHead icon="💰" title="Training Costs (SAR)" />
                <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  <Field label="Expected Travel Costs">
                    <input type="number" min="0" step="0.01" className={inputCls} value={form.costTravel} onChange={set("costTravel")} placeholder="0.00" />
                  </Field>
                  <Field label="Course Fees (SAR)">
                    <input type="number" min="0" step="0.01" className={inputCls} value={form.costCourse} onChange={set("costCourse")} placeholder="Auto-filled from USD" />
                  </Field>
                  <Field label="Expected Per-Diem Costs">
                    <input type="number" min="0" step="0.01" className={inputCls} value={form.costPerdiem} onChange={set("costPerdiem")} placeholder="0.00" />
                  </Field>
                  <Field label="Expected Visa Costs">
                    <input type="number" min="0" step="0.01" className={inputCls} value={form.costVisa} onChange={set("costVisa")} placeholder="0.00" />
                  </Field>
                  <Field label="Total Expected Training Costs (SAR)" full>
                    <input readOnly className={readonlyCls} value={total} placeholder="Auto-calculated" />
                    <span className="text-xs text-gray-400 mt-1">Sum of travel + course fees + per-diem + visa costs</span>
                  </Field>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-5 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
              <button
                onClick={handleClose}
                className="text-sm font-medium px-6 py-2 rounded-lg border-2 border-red-600 text-red-700 bg-white hover:bg-red-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="text-sm font-medium px-6 py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white transition"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}