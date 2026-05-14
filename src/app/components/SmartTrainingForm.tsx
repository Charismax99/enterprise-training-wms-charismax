import { useEffect, useMemo, useState } from "react";
import {
  CURRENCIES,
  PROVIDERS,
  QUARTERS,
  TRAINING_METHODS,
  TRAINING_VENUES,
  TrainingRequest,
  USERS,
  findTraining,
  trainingsForDepartment,
  OTHER_TRAINING_TITLE,
} from "../data/mockData";
import {
  ClipboardList, BookOpen, Eye, Check,
  ChevronRight, ChevronLeft, Send,
  Calendar, DollarSign, MapPin, Building,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
//  SmartTrainingForm
//
//  Used by an employee to complete a request that was nominated by their
//  manager. The Manager Selection card is shown read-only, the Training
//  Details + Costs cards are editable per the client spec.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  request: TrainingRequest;
  onSubmit: (updated: TrainingRequest) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const STEPS = [
  { id: 1, title: "Nomination Details", subtitle: "Verify nominator info",     icon: ClipboardList },
  { id: 2, title: "Training Information", subtitle: "Course & logistics",      icon: BookOpen },
  { id: 3, title: "Review & Submit", subtitle: "Confirm & send for AI audit",  icon: Eye },
];

// Cap the first letter of every word, leave the rest as-is.
function capitalizeFirstLetter(s: string): string {
  return s.replace(/(^|\s)(\p{L})/gu, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

function daysBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.floor((b - a) / (1000 * 60 * 60 * 24)) + 1;
}

export function SmartTrainingForm({ request, onSubmit, onCancel, readOnly }: Props) {
  const employee = useMemo(
    () => USERS.find((u) => u.id === request.employeeId),
    [request.employeeId],
  );

  const trainingOptions = useMemo(
    () => trainingsForDepartment(request.employeeDepartment ?? employee?.department ?? ""),
    [request.employeeDepartment, employee?.department],
  );

  const [step, setStep] = useState(1);

  // Training Details state
  const [trainingTitle, setTrainingTitle] = useState(request.courseTitle || "");
  const [otherTitle, setOtherTitle] = useState(request.customCourse ?? "");
  const [provider, setProvider] = useState(request.provider || "");
  const [weblink, setWeblink] = useState(request.courseWeblink ?? "");
  const [startDate, setStartDate] = useState(request.startDate || "");
  const [endDate, setEndDate] = useState(request.endDate || "");
  const [basicCost, setBasicCost] = useState<number>(request.basicCost || 0);
  const [currency, setCurrency] = useState(request.currency || "SAR");
  const [trainingMethod, setTrainingMethod] = useState(request.trainingMethod || TRAINING_METHODS[0]);
  const [venueLocation, setVenueLocation] = useState(request.venueLocation || "");
  const [city, setCity] = useState(request.city || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill provider + weblink when a known training is selected
  useEffect(() => {
    if (!trainingTitle || trainingTitle === OTHER_TRAINING_TITLE) return;
    const entry = findTraining(trainingTitle);
    if (entry) {
      if (!provider) setProvider(entry.provider);
      if (!weblink) setWeblink(entry.courseWeblink);
    }
    // We deliberately omit `provider` / `weblink` from deps — we only want to
    // backfill once on selection so the user can still override afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingTitle]);

  const durationDays = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate]);
  const usdCost = useMemo(() => {
    const rate = CURRENCIES.find((c) => c.code === currency)?.rate ?? 1;
    return Math.round(basicCost * rate * 100) / 100;
  }, [basicCost, currency]);

  // Re-capitalize first letters on blur
  const cityDisplay = city;

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!trainingTitle) e.trainingTitle = "Please select a training title.";
    if (trainingTitle === OTHER_TRAINING_TITLE && !otherTitle.trim())
      e.otherTitle = "Describe the training.";
    if (!provider) e.provider = "Please select a provider.";
    if (!startDate) e.startDate = "Start date is required.";
    if (!endDate) e.endDate = "End date is required.";
    if (startDate && endDate && endDate < startDate)
      e.endDate = "End date must be after start date.";
    if (basicCost <= 0) e.basicCost = "Cost must be greater than zero.";
    if (!city.trim()) e.city = "City is required.";
    if (!venueLocation) e.venueLocation = "Please select a venue.";
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
      courseTitle: trainingTitle === OTHER_TRAINING_TITLE ? otherTitle.trim() : trainingTitle,
      customCourse: trainingTitle === OTHER_TRAINING_TITLE ? otherTitle.trim() : undefined,
      provider,
      courseWeblink: weblink || undefined,
      startDate, endDate, durationDays,
      basicCost, currency, usdCost,
      trainingMethod, venueLocation, city: capitalizeFirstLetter(city.trim()),
      status: "PendingAI",
    });
  };

  // ── Read-only summary (used by RequestDetail when employee can't act) ──
  if (readOnly) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-4xl mx-auto space-y-6">
        <FieldGroup title="Manager Selection">
          <Grid2>
            <RF label="Nominator Name" value={request.nominatorName} />
            <RF label="Nominator ID"   value={request.nominatorId} />
            <RF label="Employee Name"  value={request.employeeName} />
            <RF label="Employee ID"    value={request.employeeId} />
            <RF label="Competency"     value={request.competency} />
            <RF label="Time Frame"     value={request.quarter} />
            <RF label="Employee Grade" value={request.employeeGrade ?? employee?.grade ?? "—"} />
            <RF label="More Details"   value={request.trainingDetails ?? "—"} />
          </Grid2>
        </FieldGroup>
        <FieldGroup title="Training Details">
          <Grid2>
            <RF label="Training Title" value={request.courseTitle || "—"} />
            <RF label="Provider"       value={request.provider || "—"} />
            <RF label="Course Weblink" value={request.courseWeblink || "—"} />
            <RF label="Start Date"     value={request.startDate || "—"} />
            <RF label="End Date"       value={request.endDate || "—"} />
            <RF label="Duration"       value={`${request.durationDays} days`} />
            <RF label="Cost"           value={`${request.basicCost} ${request.currency}`} />
            <RF label="USD Equiv."     value={`$${request.usdCost.toLocaleString()}`} />
            <RF label="Training Method" value={request.trainingMethod || "—"} />
            <RF label="Training Venue"  value={request.venueLocation || "—"} />
            <RF label="Training City"   value={request.city || "—"} />
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
          <h2 className="text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
            Complete Training Request
          </h2>
          <span className="text-green-200 text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {request.id}
          </span>
        </div>
        <p className="text-green-300 mb-6" style={{ fontSize: "0.77rem" }}>
          Manager Selection is read-only. Complete the Training Details to submit for AI audit.
        </p>
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const isDone = step > s.id;
            const isActive = step === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone ? "bg-[#F6AD55] border-[#F6AD55] text-white" :
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

      <div className="p-8">
        {/* ─── STEP 1: Manager Selection (read-only) ─── */}
        {step === 1 && (
          <div className="space-y-5">
            <StepHeader
              icon={<ClipboardList size={16} className="text-[#2D5A39]" />}
              iconBg="bg-[#2D5A39]/10"
              title="Manager Selection (Read-only)"
              sub="These fields were set by your manager and cannot be edited."
            />
            <div className="bg-[#F7FAFC] border border-slate-200 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={<Building size={14} />}      label="Nominator Name" value={request.nominatorName} />
              <InfoCard icon={<Building size={14} />}      label="Nominator ID"   value={request.nominatorId} />
              <InfoCard icon={<Building size={14} />}      label="Employee Name"  value={request.employeeName} />
              <InfoCard icon={<Building size={14} />}      label="Employee ID"    value={request.employeeId} />
              <InfoCard icon={<ClipboardList size={14} />} label="Competency"     value={request.competency} />
              <InfoCard icon={<Calendar size={14} />}      label="Time Frame"     value={request.quarter || QUARTERS[0]} />
              <InfoCard icon={<Building size={14} />}      label="Employee Grade" value={request.employeeGrade ?? employee?.grade ?? "—"} />
              <InfoCard icon={<ClipboardList size={14} />} label="More Details"   value={request.trainingDetails ?? "—"} />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-0.5" style={{ fontSize: "0.6rem", fontWeight: 700 }}>!</span>
              <p className="text-amber-800" style={{ fontSize: "0.8rem" }}>
                Please review the nomination details above before continuing.
              </p>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Training Details ─── */}
        {step === 2 && (
          <div className="space-y-5">
            <StepHeader
              icon={<BookOpen size={16} className="text-[#F6AD55]" />}
              iconBg="bg-[#F6AD55]/10"
              title="Training Details"
              sub="Fill in the course, dates, venue and cost details. Some fields auto-fill."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldBlock label="Training Title" required error={errors.trainingTitle}>
                <select
                  className={inputCls(errors.trainingTitle)}
                  value={trainingTitle}
                  onChange={(e) => setTrainingTitle(e.target.value)}
                >
                  <option value="">Select…</option>
                  {trainingOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FieldBlock>

              <FieldBlock label="Other Training Title" error={errors.otherTitle}>
                <input
                  className={inputCls(errors.otherTitle)}
                  value={otherTitle}
                  onChange={(e) => setOtherTitle(e.target.value)}
                  disabled={trainingTitle !== OTHER_TRAINING_TITLE}
                  placeholder={trainingTitle === OTHER_TRAINING_TITLE ? "Course name…" : "Select 'Other' above"}
                />
              </FieldBlock>

              <FieldBlock label="Provider (Institute)" required error={errors.provider}>
                <select
                  className={inputCls(errors.provider)}
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="">Select…</option>
                  {PROVIDERS.map((p) => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </FieldBlock>

              <FieldBlock label="Employee Name">
                <input className={readonlyInputCls} value={request.employeeName} readOnly />
              </FieldBlock>

              <FieldBlock label="Start Date" required error={errors.startDate}>
                <input
                  type="date"
                  className={inputCls(errors.startDate)}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FieldBlock>

              <FieldBlock label="End Date" required error={errors.endDate}>
                <input
                  type="date"
                  className={inputCls(errors.endDate)}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FieldBlock>

              <FieldBlock label="Duration in Days">
                <input
                  className={readonlyInputCls}
                  value={durationDays || ""}
                  readOnly
                  placeholder="Auto-calculated from dates"
                />
              </FieldBlock>

              <FieldBlock label="Course Weblink">
                <input
                  type="url"
                  className={inputCls()}
                  value={weblink}
                  onChange={(e) => setWeblink(e.target.value)}
                  placeholder="https://…"
                />
              </FieldBlock>

              <FieldBlock label="Course Fee" required error={errors.basicCost}>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputCls(errors.basicCost)} flex-1`}
                    value={basicCost || ""}
                    onChange={(e) => setBasicCost(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <select
                    className={`${inputCls()} w-32`}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </FieldBlock>

              <FieldBlock label="Course Fee in USD">
                <input
                  className={readonlyInputCls}
                  value={usdCost ? `$${usdCost.toLocaleString()}` : ""}
                  readOnly
                  placeholder="Auto-converted"
                />
              </FieldBlock>

              <FieldBlock label="Employee Grade">
                <input
                  className={readonlyInputCls}
                  value={request.employeeGrade ?? employee?.grade ?? ""}
                  readOnly
                />
              </FieldBlock>

              <FieldBlock label="Training Method" required>
                <select
                  className={inputCls()}
                  value={trainingMethod}
                  onChange={(e) => setTrainingMethod(e.target.value)}
                >
                  {TRAINING_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </FieldBlock>

              <FieldBlock label="Training Venue" required error={errors.venueLocation}>
                <select
                  className={inputCls(errors.venueLocation)}
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                >
                  <option value="">Select…</option>
                  {TRAINING_VENUES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </FieldBlock>

              <FieldBlock label="Training City" required error={errors.city}>
                <input
                  className={inputCls(errors.city)}
                  value={cityDisplay}
                  onChange={(e) => setCity(e.target.value)}
                  onBlur={() => setCity((c) => capitalizeFirstLetter(c.trim()))}
                  placeholder="e.g. Riyadh"
                />
              </FieldBlock>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Review & Submit ─── */}
        {step === 3 && (
          <div className="space-y-5">
            <StepHeader
              icon={<Eye size={16} className="text-purple-700" />}
              iconBg="bg-purple-100"
              title="Review & Submit"
              sub="Once submitted the request enters AI audit."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryCard
                icon={<BookOpen size={14} />}
                title="Course"
                lines={[
                  trainingTitle === OTHER_TRAINING_TITLE ? otherTitle : trainingTitle,
                  provider,
                  weblink || "—",
                ]}
              />
              <SummaryCard
                icon={<Calendar size={14} />}
                title="Schedule"
                lines={[
                  `${startDate || "—"} → ${endDate || "—"}`,
                  `${durationDays} day(s)`,
                  trainingMethod,
                ]}
              />
              <SummaryCard
                icon={<MapPin size={14} />}
                title="Venue"
                lines={[venueLocation || "—", capitalizeFirstLetter(city.trim()) || "—"]}
              />
              <SummaryCard
                icon={<DollarSign size={14} />}
                title="Cost"
                lines={[`${basicCost} ${currency}`, `≈ $${usdCost.toLocaleString()} USD`]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-7 py-5 bg-[#F7FAFC] border-t border-slate-200 flex justify-between">
        <button
          onClick={step === 1 ? onCancel : () => setStep((s) => s - 1)}
          className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-2"
        >
          <ChevronLeft size={15} />
          {step === 1 ? "Cancel" : "Back"}
        </button>
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg bg-[#2D5A39] text-white font-bold hover:bg-[#1F4128] flex items-center gap-2"
          >
            Next
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-[#F6AD55] text-white font-bold hover:bg-[#E89238] flex items-center gap-2"
          >
            <Send size={15} />
            Submit for AI Audit
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tiny presentation helpers ───────────────────────────────────────────────
const baseInputCls = "text-sm px-3 py-2 border rounded-lg bg-white text-gray-800 w-full outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition";
const inputCls = (err?: string) =>
  `${baseInputCls} ${err ? "border-red-400" : "border-gray-300"}`;
const readonlyInputCls = "text-sm px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 w-full outline-none cursor-default";

function StepHeader({ icon, iconBg, title, sub }: { icon: React.ReactNode; iconBg: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>{icon}</div>
      <div>
        <div className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</div>
        <div className="text-slate-500" style={{ fontSize: "0.78rem" }}>{sub}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5">
      <div className="flex items-center gap-1.5 text-slate-500" style={{ fontSize: "0.7rem", fontWeight: 600 }}>
        {icon} {label}
      </div>
      <div className="text-[#2D3748] mt-1" style={{ fontSize: "0.88rem", fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}

function FieldBlock({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label}{required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && <span className="text-red-600" style={{ fontSize: "0.7rem" }}>{error}</span>}
    </div>
  );
}

function SummaryCard({ icon, title, lines }: { icon: React.ReactNode; title: string; lines: string[] }) {
  return (
    <div className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-[#2D5A39] mb-2" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
        {icon} {title}
      </div>
      {lines.map((l, i) => (
        <div key={i} className="text-[#2D3748]" style={{ fontSize: "0.85rem" }}>{l}</div>
      ))}
    </div>
  );
}

// Used in readOnly mode
function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[#2D5A39]" style={{ fontWeight: 700, fontSize: "0.95rem" }}>{title}</h3>
      {children}
    </div>
  );
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
function RF({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F7FAFC] border border-slate-200 rounded-xl p-3">
      <div className="text-slate-500" style={{ fontSize: "0.7rem", fontWeight: 600 }}>{label}</div>
      <div className="text-[#2D3748] mt-0.5" style={{ fontSize: "0.85rem", fontWeight: 600 }}>{value || "—"}</div>
    </div>
  );
}
