import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { USERS } from "../data/mockData";

const GRADES = ["Grade 1 — Junior","Grade 2 — Mid-level","Grade 3 — Senior","Grade 4 — Lead","Grade 5 — Principal"];
const COMPETENCIES = ["Leadership & Management","Technical Skills","Communication","Problem Solving","Project Management"];
const TIMEFRAMES = ["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)","Annual"];
const TRAININGS = ["Leadership Excellence Program","PMP Certification","Data Analytics Fundamentals","Cybersecurity Essentials","Agile & Scrum Practitioner","Excel Advanced Skills","Other"];
const PROVIDERS = ["Coursera","LinkedIn Learning","PMI","SHRM","Udemy Business","Internal L&D","External Consultant"];
const VENUES = ["Head Office — Riyadh","Branch — Jeddah","Branch — Dammam","External Training Center","Online / Virtual"];
const METHODS = ["Classroom / In-person","Online — Self-paced","Online — Instructor-led","Blended","On-the-job training"];

const SAR_RATE = 3.75;

// Supabase (only created when credentials are provided)
const _sbUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const _sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase = _sbUrl && _sbKey ? createClient(_sbUrl, _sbKey) : null;

const initialForm = {
  managerId: "", reporteeId: "", payGrade: "", competency: "", otherCompetency: "",
  timeFrame: "", trainingDetails: "", trainingTitle: "", provider: "", otherTitle: "",
  employeeName: "", durationDays: "", weblink: "", targetedGroup: "", courseFeesUSD: "",
  rating: "", startDay: "", venue: "", endDay: "", trainingCity: "", deliveryMethod: "",
  costTravel: "", costCourse: "", costPerdiem: "", costVisa: "",
};

function Field({ label, required, children, full }: { label: string; required?: boolean; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 w-full outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition";
const selectCls = inputCls;
const readonlyCls = "text-sm px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 w-full outline-none cursor-default";

function SectionHead({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#2D5A39] to-[#3D7A4E] px-5 py-3 rounded-t-lg">
      <span className="text-white text-lg">{icon}</span>
      <span className="text-sm font-bold text-white tracking-wide">{title}</span>
    </div>
  );
}

export function TrainingNeedAssessment({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async () => {
    setError("");
    
    if (!form.managerId.trim() || !form.reporteeId.trim()) {
      setError("Please fill in required fields: Manager ID and Employee ID.");
      return;
    }

    setLoading(true);

    try {
      // Get employee and manager info
      const employee = USERS.find(u => u.id.toLowerCase() === form.reporteeId.trim().toLowerCase());
      const manager = USERS.find(u => u.id.toLowerCase() === form.managerId.trim().toLowerCase());

      if (!employee) {
        throw new Error("Employee not found");
      }

      // Generate request ID
      const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

      // Create training request object
      const trainingRequest = {
        id: reqId,
        employee_id: employee.id,
        employee_name: employee.name,
        employee_department: employee.department,
        nominator_id: manager?.id || form.managerId,
        nominator_name: manager?.name || form.managerId,
        competency: form.competency || form.otherCompetency || "",
        quarter: form.timeFrame || "Q1-2026",
        course_title: form.trainingTitle === "Other" ? form.otherTitle : form.trainingTitle,
        custom_course: form.trainingTitle === "Other" ? form.otherTitle : null,
        institute_id: form.provider || "I001",
        start_date: form.startDay || "",
        end_date: form.endDay || "",
        duration_days: parseInt(form.durationDays) || 0,
        basic_cost: parseFloat(form.courseFeesUSD) || 0,
        currency: "USD",
        usd_cost: parseFloat(form.courseFeesUSD) || 0,
        venue_type: form.venue.split(" — ")[0] || "Virtual",
        city: form.trainingCity || "",
        status: "PendingAI",
        comments: [form.trainingDetails || "No additional details provided"],
        created_at: new Date().toISOString().split("T")[0],
      };

      // Save to Supabase (if configured), otherwise just succeed
      if (supabase) {
        const { error: saveError } = await supabase
          .from("training_requests")
          .insert([trainingRequest]);

        if (saveError) {
          throw new Error(saveError.message);
        }
      }

      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message || "Failed to submit request");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border-t-4 border-[#2D5A39]">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-[#2D5A39] font-bold text-2xl mb-3">Request Submitted</h2>
          <p className="text-gray-600 mb-8">Your Training Need Assessment has been successfully saved to the database and sent for AI audit.</p>
          <button
            onClick={onBack}
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
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D5A39] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#2D5A39]">Training Need Assessment</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 flex flex-col gap-8">
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                ⚠️ {error}
              </div>
            )}

            {/* Section 1 */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="👤" title="Manager Selection" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field label="Manager ID" required>
                  <input className={inputCls} value={form.managerId} onChange={set("managerId")} />
                </Field>
                <Field label="Employee ID" required>
                  <input className={inputCls} value={form.reporteeId} onChange={set("reporteeId")} />
                </Field>
                <Field label="Employee Pay Grade">
                  <select className={selectCls} value={form.payGrade} onChange={set("payGrade")}>
                    <option value=""></option>
                    {GRADES.map(g => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="Employee Competencies">
                  <select className={selectCls} value={form.competency} onChange={set("competency")}>
                    <option value=""></option>
                    {COMPETENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Other Competencies">
                  <input className={inputCls} value={form.otherCompetency} onChange={set("otherCompetency")} />
                </Field>
                <Field label="Time Frame">
                  <select className={selectCls} value={form.timeFrame} onChange={set("timeFrame")}>
                    <option value=""></option>
                    {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="More Details For Training Need" full>
                  <textarea className={inputCls + " resize-y min-h-[80px]"} value={form.trainingDetails} onChange={set("trainingDetails")} />
                </Field>
              </div>
            </div>

            {/* Section 2 */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="🎓" title="Training Details" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field label="Training Title" required>
                  <select className={selectCls} value={form.trainingTitle} onChange={set("trainingTitle")}>
                    <option value=""></option>
                    {TRAININGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Provider" required>
                  <select className={selectCls} value={form.provider} onChange={set("provider")}>
                    <option value=""></option>
                    {PROVIDERS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Other Training Title">
                  <input className={inputCls} value={form.otherTitle} onChange={set("otherTitle")} />
                </Field>
                <Field label="Employee Name">
                  <input className={inputCls} value={form.employeeName} onChange={set("employeeName")} />
                </Field>
                <Field label="Duration in Days">
                  <input type="number" className={inputCls} value={form.durationDays} onChange={set("durationDays")} />
                </Field>
                <Field label="Course Weblink">
                  <input type="url" className={inputCls} value={form.weblink} onChange={set("weblink")} />
                </Field>
                <Field label="Targeted Group">
                  <input type="text" className={inputCls} value={form.targetedGroup} onChange={set("targetedGroup")} />
                </Field>
                <Field label="Course Fees in USD">
                  <input type="number" step="0.01" className={inputCls} value={form.courseFeesUSD} onChange={set("courseFeesUSD")} />
                </Field>
                <Field label="Course Feedback Rating">
                  <input type="number" className={inputCls} value={form.rating} onChange={set("rating")} />
                </Field>
              </div>
            </div>

            {/* Section 3 */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="📅" title="Employee Selection" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field label="Start Day" required>
                  <input type="date" className={inputCls} value={form.startDay} onChange={set("startDay")} />
                </Field>
                <Field label="Venue Location">
                  <select className={selectCls} value={form.venue} onChange={set("venue")}>
                    <option value=""></option>
                    {VENUES.map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="End Day" required>
                  <input type="date" className={inputCls} value={form.endDay} onChange={set("endDay")} />
                </Field>
                <Field label="Training City">
                  <input className={inputCls} value={form.trainingCity} onChange={set("trainingCity")} />
                </Field>
                <Field label="Delivery Method">
                  <select className={selectCls} value={form.deliveryMethod} onChange={set("deliveryMethod")}>
                    <option value=""></option>
                    {METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Section 4 */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="💰" title="Training Costs" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field label="Expected Travel Costs (SAR)">
                  <input type="number" step="0.01" className={inputCls} value={form.costTravel} onChange={set("costTravel")} />
                </Field>
                <Field label="Course Fees (SAR)">
                  <input type="number" step="0.01" className={readonlyCls} value={form.costCourse} readOnly placeholder="Auto-calculated from USD" />
                </Field>
                <Field label="Expected Per-Diem Costs (SAR)">
                  <input type="number" step="0.01" className={inputCls} value={form.costPerdiem} onChange={set("costPerdiem")} />
                </Field>
                <Field label="Total Expected Training Costs">
                  <input readOnly className={readonlyCls} value={total} />
                </Field>
                <Field label="Expected Visa Costs (SAR)">
                  <input type="number" step="0.01" className={inputCls} value={form.costVisa} onChange={set("costVisa")} />
                </Field>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                disabled={loading}
                className="px-8 py-3 rounded-lg border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 rounded-lg bg-[#2D5A39] text-white font-bold hover:bg-[#1F4128] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
