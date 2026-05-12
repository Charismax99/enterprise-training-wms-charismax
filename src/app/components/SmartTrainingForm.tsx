import { useMemo, useState } from "react";
import {
  COURSES, CURRENCIES, INSTITUTES, TrainingRequest, VENUE_TYPES,
} from "../data/mockData";
import {
  Search, Send, Check, ChevronRight, ChevronLeft,
  ClipboardList, BookOpen, Eye, Building, Calendar,
  DollarSign, MapPin,
} from "lucide-react";

interface Props {
  request: TrainingRequest;
  onSubmit: (updated: TrainingRequest) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const STEPS = [
  { id: 1, title: "Nomination Details", subtitle: "Verify nominator info",        icon: ClipboardList },
  { id: 2, title: "Training Information", subtitle: "Course & logistics",         icon: BookOpen },
  { id: 3, title: "Review & Submit", subtitle: "Confirm & send for AI audit",     icon: Eye },
];

export function SmartTrainingForm({ request, onSubmit, onCancel, readOnly }: Props) {
  const [step, setStep] = useState(1);
  const [courseQuery, setCourseQuery] = useState(request.courseTitle || "");
  const [showCourseList, setShowCourseList] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(request.courseTitle || "");
  const [customCourse, setCustomCourse] = useState(request.customCourse ?? "");
  const [instituteId, setInstituteId] = useState(request.instituteId || INSTITUTES[0].id);
  const [startDate, setStartDate] = useState(request.startDate || "");
  const [endDate, setEndDate] = useState(request.endDate || "");
  const [basicCost, setBasicCost] = useState(request.basicCost || 0);
  const [currency, setCurrency] = useState(request.currency || "USD");
  const [venueType, setVenueType] = useState(request.venueType || VENUE_TYPES[0]);
  const [city, setCity] = useState(request.city || "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const duration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, endDate]);

  const usdCost = useMemo(() => {
    const rate = CURRENCIES.find((c) => c.code === currency)?.rate ?? 1;
    return Math.round(basicCost * rate * 100) / 100;
  }, [basicCost, currency]);

  const filteredCourses = COURSES.filter((c) =>
    c.title.toLowerCase().includes(courseQuery.toLowerCase())
  );
  const instituteName = INSTITUTES.find((i) => i.id === instituteId)?.name ?? "—";

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!selectedCourse)                            e.course      = "Please select a course.";
    if (selectedCourse === "Other" && !customCourse) e.customCourse = "Please enter the course name.";
    if (!startDate)                                  e.startDate   = "Start date is required.";
    if (!endDate)                                    e.endDate     = "End date is required.";
    if (startDate && endDate && endDate < startDate) e.endDate     = "End date must be after start date.";
    if (!city.trim())                                e.city        = "City is required.";
    if (basicCost <= 0)                              e.basicCost   = "Cost must be greater than zero.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    onSubmit({
      ...request,
      courseTitle: selectedCourse,
      customCourse: selectedCourse === "Other" ? customCourse : undefined,
      instituteId, startDate, endDate, durationDays: duration,
      basicCost, currency, usdCost, venueType, city,
      status: "PendingAI",
    });
  };

  // Read-only flat view
  if (readOnly) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-4xl mx-auto space-y-6">
        <FieldGroup title="Nominator Details">
          <Grid2>
            <RF label="Nominator"    value={request.nominatorName} />
            <RF label="Nominator ID" value={request.nominatorId} />
            <RF label="Competency"   value={request.competency} />
            <RF label="Quarter"      value={request.quarter} />
          </Grid2>
        </FieldGroup>
        <FieldGroup title="Training Details">
          <Grid2>
            <RF label="Course"       value={request.courseTitle || "—"} />
            <RF label="Institute"    value={instituteName} />
            <RF label="Start Date"   value={request.startDate || "—"} />
            <RF label="End Date"     value={request.endDate || "—"} />
            <RF label="Duration"     value={`${request.durationDays} days`} />
            <RF label="Venue"        value={`${request.venueType} — ${request.city}`} />
            <RF label="Cost"         value={`${request.basicCost} ${request.currency}`} />
            <RF label="USD Equiv."   value={`$${request.usdCost.toLocaleString()}`} />
          </Grid2>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl mx-auto overflow-hidden shadow-sm">
      {/* Header with stepper */}
      <div style={{ background: "linear-gradient(135deg, #1F4128 0%, #2D5A39 100%)" }} className="px-8 py-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>Smart Training Form</h2>
          <span className="text-green-200 text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">{request.id}</span>
        </div>
        <p className="text-green-300 mb-6" style={{ fontSize: "0.77rem" }}>
          Complete all steps to submit for AI review
        </p>
        {/* Stepper */}
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const isDone   = step > s.id;
            const isActive = step === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone   ? "bg-[#F6AD55] border-[#F6AD55] text-white" :
                      isActive ? "bg-white border-white text-[#2D5A39]" :
                                 "bg-transparent border-white/30 text-white/30"
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {isDone ? <Check size={16} /> : <Icon size={15} />}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`transition-colors ${isActive || isDone ? "text-white" : "text-white/30"}`}
                      style={{ fontSize: "0.8rem", fontWeight: 600 }}>{s.title}</div>
                    <div className={`transition-colors ${isActive || isDone ? "text-green-200" : "text-white/20"}`}
                      style={{ fontSize: "0.66rem" }}>{s.subtitle}</div>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${isDone ? "bg-[#F6AD55]" : "bg-white/20"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="p-8">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <StepHeader icon={<ClipboardList size={16} className="text-[#2D5A39]" />} iconBg="bg-[#2D5A39]/10"
              title="Nomination Details" sub="These fields were set by your manager and cannot be edited." />
            <div className="bg-[#F7FAFC] border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={<Building size={14} />} label="Nominator Name" value={request.nominatorName} />
              <InfoCard icon={<Building size={14} />} label="Nominator ID"   value={request.nominatorId} />
              <InfoCard icon={<ClipboardList size={14} />} label="Competency" value={request.competency} />
              <InfoCard icon={<Calendar size={14} />} label="Quarter"        value={request.quarter} />
              <InfoCard icon={<Building size={14} />} label="Employee"       value={request.employeeName} />
              <InfoCard icon={<Building size={14} />} label="Employee ID"    value={request.employeeId} />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5" style={{ fontSize: "0.6rem", fontWeight: 700 }}>!</span>
              <p className="text-amber-800" style={{ fontSize: "0.8rem" }}>
                Please verify the nomination details are correct before proceeding.
              </p>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <StepHeader icon={<BookOpen size={16} className="text-[#F6AD55]" />} iconBg="bg-[#F6AD55]/10"
              title="Training Information" sub="Fill in the course, dates, venue, and cost details." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Course search */}
              <div className="col-span-2 relative">
                <Label required>Course Title</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 ${errors.course ? "border-red-400" : "border-slate-300"}`}
                    value={courseQuery}
                    onFocus={() => setShowCourseList(true)}
                    onChange={(e) => { setCourseQuery(e.target.value); setShowCourseList(true); }}
                    placeholder="Search available courses…"
                  />
                  {showCourseList && filteredCourses.length > 0 && (
                    <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl max-h-48 overflow-auto shadow-xl">
                      {filteredCourses.map((c) => (
                        <li key={c.id}
                          className="px-4 py-2.5 hover:bg-[#F7FAFC] cursor-pointer flex items-center justify-between"
                          onClick={() => { setSelectedCourse(c.title); setCourseQuery(c.title); setShowCourseList(false); setErrors((e) => { const n={...e}; delete n.course; return n; }); }}>
                          <span className="text-[#2D3748]" style={{ fontSize: "0.88rem" }}>{c.title}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{c.category}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {errors.course && <p className="text-red-500 mt-1" style={{ fontSize: "0.73rem" }}>{errors.course}</p>}
              </div>

              {selectedCourse === "Other" && (
                <div className="col-span-2">
                  <Label required>Custom Course Name</Label>
                  <input
                    className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#2D5A39] ${errors.customCourse ? "border-red-400" : "border-slate-300"}`}
                    value={customCourse} onChange={(e) => setCustomCourse(e.target.value)} placeholder="Enter course name" />
                  {errors.customCourse && <p className="text-red-500 mt-1" style={{ fontSize: "0.73rem" }}>{errors.customCourse}</p>}
                </div>
              )}

              <div>
                <Label required>Training Institute</Label>
                <select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2D5A39]"
                  value={instituteId} onChange={(e) => setInstituteId(e.target.value)}>
                  {INSTITUTES.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              <div>
                <Label required>Venue Type</Label>
                <select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2D5A39]"
                  value={venueType} onChange={(e) => setVenueType(e.target.value)}>
                  {VENUE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div>
                <Label required>Start Date</Label>
                <input type="date" className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#2D5A39] ${errors.startDate ? "border-red-400" : "border-slate-300"}`}
                  value={startDate} onChange={(e) => { setStartDate(e.target.value); setErrors((er) => { const n={...er}; delete n.startDate; return n; }); }} />
                {errors.startDate && <p className="text-red-500 mt-1" style={{ fontSize: "0.73rem" }}>{errors.startDate}</p>}
              </div>

              <div>
                <Label required>End Date</Label>
                <input type="date" className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#2D5A39] ${errors.endDate ? "border-red-400" : "border-slate-300"}`}
                  value={endDate} onChange={(e) => { setEndDate(e.target.value); setErrors((er) => { const n={...er}; delete n.endDate; return n; }); }} />
                {errors.endDate && <p className="text-red-500 mt-1" style={{ fontSize: "0.73rem" }}>{errors.endDate}</p>}
              </div>

              <div>
                <Label>Duration (auto)</Label>
                <div className="px-3 py-2.5 bg-[#F7FAFC] border border-slate-200 rounded-xl flex items-center gap-2">
                  <Calendar size={14} className="text-[#F6AD55]" />
                  <span className="text-[#2D5A39]" style={{ fontWeight: 700 }}>{duration}</span>
                  <span className="text-[#4A5568]">{duration === 1 ? "day" : "days"}</span>
                </div>
              </div>

              <div>
                <Label required>City</Label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#2D5A39] ${errors.city ? "border-red-400" : "border-slate-300"}`}
                    value={city} onChange={(e) => { const v=e.target.value; setCity(v.charAt(0).toUpperCase()+v.slice(1)); setErrors((er)=>{const n={...er};delete n.city;return n;}); }}
                    placeholder="e.g. Riyadh" />
                </div>
                {errors.city && <p className="text-red-500 mt-1" style={{ fontSize: "0.73rem" }}>{errors.city}</p>}
              </div>

              <div>
                <Label required>Cost</Label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="number" className={`w-full pl-9 pr-3 py-2.5 border rounded-xl focus:outline-none focus:border-[#2D5A39] ${errors.basicCost ? "border-red-400" : "border-slate-300"}`}
                    value={basicCost || ""} onChange={(e) => { setBasicCost(parseFloat(e.target.value)||0); setErrors((er)=>{const n={...er};delete n.basicCost;return n;}); }} placeholder="0.00" />
                </div>
                {errors.basicCost && <p className="text-red-500 mt-1" style={{ fontSize: "0.73rem" }}>{errors.basicCost}</p>}
              </div>

              <div>
                <Label>Currency</Label>
                <select className="w-full px-3 py-2.5 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2D5A39]"
                  value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <Label>USD Equivalent (auto)</Label>
                <div className="px-3 py-2.5 bg-[#F7FAFC] border border-slate-200 rounded-xl flex items-center gap-2">
                  <DollarSign size={14} className="text-[#F6AD55]" />
                  <span className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "1rem" }}>${usdCost.toLocaleString()}</span>
                  <span className="text-[#4A5568]" style={{ fontSize: "0.78rem" }}>
                    ({basicCost} {currency} × {CURRENCIES.find(c=>c.code===currency)?.rate})
                  </span>
                  {usdCost > 10000 && (
                    <span className="ml-auto text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded-full border border-red-200">⚠ Exceeds $10,000 cap</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <StepHeader icon={<Eye size={16} className="text-green-600" />} iconBg="bg-green-100"
              title="Review & Submit" sub="Confirm all details before sending to AI Auditor." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryBox title="Nomination" items={[
                { label: "Employee",   value: request.employeeName },
                { label: "Nominator",  value: request.nominatorName },
                { label: "Competency", value: request.competency },
                { label: "Quarter",    value: request.quarter },
              ]} />
              <SummaryBox title="Course & Venue" items={[
                { label: "Course",    value: selectedCourse === "Other" ? customCourse : selectedCourse },
                { label: "Institute", value: instituteName },
                { label: "Venue",     value: venueType },
                { label: "City",      value: city },
              ]} />
              <SummaryBox title="Schedule" items={[
                { label: "Start",    value: startDate || "—" },
                { label: "End",      value: endDate || "—" },
                { label: "Duration", value: `${duration} ${duration===1?"day":"days"}` },
              ]} />
              <SummaryBox title="Financial" items={[
                { label: "Cost",       value: `${basicCost.toLocaleString()} ${currency}` },
                { label: "USD Equiv.", value: `$${usdCost.toLocaleString()}` },
                { label: "Status",     value: usdCost<=10000 ? "✓ Within limit" : "⚠ Exceeds cap" },
              ]} />
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">🤖</div>
              <div>
                <div className="text-purple-800" style={{ fontWeight: 600, fontSize: "0.85rem" }}>AI Auditor reviews automatically</div>
                <div className="text-purple-600" style={{ fontSize: "0.77rem" }}>
                  The system will check budget limits, date validity, and completeness before forwarding to the Training Unit Head.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-8 py-4 bg-[#F7FAFC] border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-[#4A5568] hover:bg-slate-100"
        >
          <ChevronLeft size={15} />
          {step === 1 ? "Cancel" : "Back"}
        </button>
        <div className="flex items-center gap-1.5">
          {STEPS.map((s) => (
            <div key={s.id} className={`w-2 h-2 rounded-full ${step===s.id?"bg-[#2D5A39]":step>s.id?"bg-[#F6AD55]":"bg-slate-300"}`} />
          ))}
        </div>
        {step < 3 ? (
          <button onClick={handleNext} className="flex items-center gap-2 px-5 py-2 bg-[#2D5A39] text-white rounded-xl hover:bg-[#1F4128]" style={{ fontWeight: 600 }}>
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 bg-[#F6AD55] text-white rounded-xl hover:bg-[#dd9033] shadow-md" style={{ fontWeight: 700 }}>
            <Send size={15} /> Submit for AI Audit
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block mb-1.5 text-[#4A5568]" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}
function StepHeader({ icon, iconBg, title, sub }: { icon: React.ReactNode; iconBg: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className={`w-8 h-8 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
      <div>
        <h3 className="text-[#2D5A39]" style={{ fontWeight: 700 }}>{title}</h3>
        <p className="text-[#4A5568]" style={{ fontSize: "0.78rem" }}>{sub}</p>
      </div>
    </div>
  );
}
function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
      <div className="w-7 h-7 bg-[#2D5A39]/10 rounded-lg flex items-center justify-center text-[#2D5A39] flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="text-[#4A5568]" style={{ fontSize: "0.7rem" }}>{label}</div>
        <div className="text-[#2D5A39]" style={{ fontWeight: 600, fontSize: "0.88rem" }}>{value || "—"}</div>
      </div>
    </div>
  );
}
function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[#2D5A39] mb-3" style={{ fontWeight: 600, fontSize: "0.88rem" }}>{title}</h4>
      {children}
    </div>
  );
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
function RF({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F7FAFC] p-3 rounded-xl border border-slate-200">
      <div className="text-[#4A5568]" style={{ fontSize: "0.7rem" }}>{label}</div>
      <div className="text-[#2D3748]" style={{ fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}
function SummaryBox({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="bg-[#F7FAFC] border border-slate-200 rounded-2xl p-4">
      <div className="text-[#2D5A39] mb-3" style={{ fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </div>
      <div className="space-y-2">
        {items.map((i) => (
          <div key={i.label} className="flex items-start justify-between gap-2">
            <span className="text-[#4A5568]" style={{ fontSize: "0.78rem" }}>{i.label}</span>
            <span className="text-[#2D3748] text-right" style={{ fontSize: "0.8rem", fontWeight: 500 }}>{i.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
