import { useCallback, useEffect, useState } from "react";
import {
  TrainingRequest,
  User,
  INITIAL_REQUESTS,
  TRAINING_CATALOGUE,
  OTHER_TRAINING_TITLE,
} from "./data/mockData";
import { Login } from "./components/Login";
import { Shell } from "./components/Shell";
import {
  EmployeeDashboard,
  ManagerDashboard,
  UnitHeadDashboard,
  TalentDevDashboard,
  HRAdminDashboard,
} from "./components/Dashboards";
import { RequestDetail } from "./components/RequestDetail";
import { TrainingNeedAssessment } from "./components/TrainingNeedAssessment";
import { supabase as supabaseClient, isSupabaseConfigured } from "../lib/supabase";

// Null when credentials are absent — app falls back to demo mode.
const supabase = isSupabaseConfigured ? supabaseClient : null;
const IS_DEMO = !supabase;

// ── DB row ↔ TrainingRequest mappers ─────────────────────────────────────────

function rowToRequest(row: Record<string, unknown>): TrainingRequest {
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    employeeName: row.employee_name as string,
    employeeDepartment: row.employee_department as string | undefined,
    employeeGrade: row.employee_grade as string | undefined,
    nominatorId: row.nominator_id as string,
    nominatorName: row.nominator_name as string,
    competency: (row.competency as string) ?? "",
    otherCompetency: row.other_competency as string | undefined,
    quarter: (row.quarter as string) ?? "",
    trainingDetails: row.training_details as string | undefined,
    courseTitle: (row.course_title as string) ?? "",
    customCourse: row.custom_course as string | undefined,
    // Tolerate legacy rows whose institute id was stored instead of name.
    provider: ((row.provider as string) ?? (row.institute_id as string) ?? ""),
    courseWeblink: row.course_weblink as string | undefined,
    startDate: (row.start_date as string) ?? "",
    endDate: (row.end_date as string) ?? "",
    durationDays: (row.duration_days as number) ?? 0,
    basicCost: (row.basic_cost as number) ?? 0,
    currency: (row.currency as string) ?? "USD",
    usdCost: (row.usd_cost as number) ?? 0,
    trainingMethod: ((row.training_method as string) ?? ""),
    venueLocation: ((row.venue_location as string) ?? (row.venue_type as string) ?? ""),
    city: (row.city as string) ?? "",
    status: row.status as TrainingRequest["status"],
    comments: (row.comments as string[]) ?? [],
    createdAt: (row.created_at as string) ?? "",
  };
}

function requestToRow(r: TrainingRequest): Record<string, unknown> {
  return {
    id: r.id,
    employee_id: r.employeeId,
    employee_name: r.employeeName,
    employee_department: r.employeeDepartment,
    employee_grade: r.employeeGrade,
    nominator_id: r.nominatorId,
    nominator_name: r.nominatorName,
    competency: r.competency,
    other_competency: r.otherCompetency,
    quarter: r.quarter,
    training_details: r.trainingDetails,
    course_title: r.courseTitle,
    custom_course: r.customCourse,
    provider: r.provider,
    course_weblink: r.courseWeblink,
    start_date: r.startDate,
    end_date: r.endDate,
    duration_days: r.durationDays,
    basic_cost: r.basicCost,
    currency: r.currency,
    usd_cost: r.usdCost,
    training_method: r.trainingMethod,
    venue_location: r.venueLocation,
    city: r.city,
    status: r.status,
    comments: r.comments,
    created_at: r.createdAt,
  };
}

// ── Client-side AI auditor ────────────────────────────────────────────────────
//
// Verifies a training request before it is forwarded to the Training Unit Head:
//   1. Required fields are present
//   2. Date range produces a positive duration
//   3. Cost is within the $15,000 ceiling
//   4. The chosen course actually develops the competency the nominator requested
//      (looked up in TRAINING_CATALOGUE). Custom / "Other" entries skip this
//      check and are passed through with a manual-review note.
//
// On rejection the comment explains exactly what's wrong and lists the
// approved courses for the requested competency so the employee can pick again.

const COST_CEILING_USD = 15000;

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function aiAudit(req: TrainingRequest): { pass: boolean; comment: string } {
  // 1. Required fields
  const missing: string[] = [];
  if (!req.courseTitle) missing.push("Course Title");
  if (!req.provider) missing.push("Institute");
  if (!req.city) missing.push("City");
  if (!req.venueLocation) missing.push("Venue Location");
  if (missing.length > 0) {
    return {
      pass: false,
      comment: `AI Auditor: Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`,
    };
  }

  // 2. Duration sanity
  if (req.durationDays <= 0) {
    return {
      pass: false,
      comment: "AI Auditor: Invalid date range — end date must be after start date.",
    };
  }

  // 3. Cost ceiling
  if (req.usdCost > COST_CEILING_USD) {
    return {
      pass: false,
      comment: `AI Auditor: Course cost ($${req.usdCost.toLocaleString()}) exceeds the $${COST_CEILING_USD.toLocaleString()} ceiling. Please justify or choose a more affordable option.`,
    };
  }

  // 4. Competency ↔ Training match
  const isCustomCourse =
    req.courseTitle === OTHER_TRAINING_TITLE || Boolean(req.customCourse);

  if (isCustomCourse) {
    return {
      pass: true,
      comment: `AI Auditor ✓ Custom course '${req.customCourse || req.courseTitle}' — auto-checks (cost, duration, fields) passed. Note: competency–training match could not be verified automatically; Training Unit Head should confirm relevance to '${req.competency}'.`,
    };
  }

  const catalogueEntry = TRAINING_CATALOGUE.find(
    (c) => normalize(c.trainingTitle) === normalize(req.courseTitle),
  );

  if (!catalogueEntry) {
    return {
      pass: true,
      comment: `AI Auditor ✓ Course '${req.courseTitle}' is not in the master catalogue; auto-checks (cost, duration, fields) passed. Competency match flagged for Unit Head review.`,
    };
  }

  if (normalize(catalogueEntry.competency) !== normalize(req.competency)) {
    const alternatives = TRAINING_CATALOGUE
      .filter((c) => normalize(c.competency) === normalize(req.competency))
      .map((c) => c.trainingTitle);
    const altList =
      alternatives.length > 0
        ? `${alternatives.join(", ")}.`
        : "no approved courses found in the catalogue for this competency — please coordinate with your manager.";
    return {
      pass: false,
      comment: `AI Auditor: Selected course '${catalogueEntry.trainingTitle}' develops competency '${catalogueEntry.competency}', but the request requires '${req.competency}'. Recommended courses for the required competency: ${altList}`,
    };
  }

  return {
    pass: true,
    comment: `AI Auditor ✓ Competency–training match verified: '${req.competency}' ↔ '${catalogueEntry.trainingTitle}'. Cost $${req.usdCost.toLocaleString()} within budget, duration ${req.durationDays} day${req.durationDays === 1 ? "" : "s"}. Forwarded to Training Unit Head.`,
  };
}

// ── Session helpers ───────────────────────────────────────────────────────────

type View = { kind: "list" } | { kind: "detail"; id: string } | { kind: "assessment" };

const SESSION_KEY = "twms_user";

function saveSession(u: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(u));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function loadSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState<User | null>(loadSession);
  const [requests, setRequests] = useState<TrainingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>({ kind: "list" });

  // ── Persist a single request (no-op in demo mode) ────────────────────────
  const saveRequest = useCallback(async (request: TrainingRequest) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("training_requests")
      .upsert(requestToRow(request), { onConflict: "id" });
    if (error) console.error("Failed to save request:", error.message);
  }, []);

  // ── Load all requests ─────────────────────────────────────────────────────
  const loadRequests = useCallback(async () => {
    if (!supabase) {
      setRequests(INITIAL_REQUESTS);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("training_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data.map(rowToRequest));
    } else {
      console.error("Failed to load requests:", error?.message);
      setRequests(INITIAL_REQUESTS);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadRequests();
  }, [user, loadRequests]);

  // ── Real-time subscription — all sessions update live ────────────────────
  useEffect(() => {
    if (!supabase || !user) return;

    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from("training_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setRequests(data.map(rowToRequest));
    };

    const channel = supabase
      .channel("training_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "training_requests" },
        () => { fetchLatest(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // ── AI auditor background process (one request per tick) ─────────────────
  useEffect(() => {
    const pendingAI = requests.find((r) => r.status === "PendingAI");
    if (!pendingAI) return;

    const t = setTimeout(async () => {
      const result = aiAudit(pendingAI);
      const updated: TrainingRequest = {
        ...pendingAI,
        status: result.pass ? "PendingUnitHead" : "AIRejected",
        comments: [...pendingAI.comments, result.comment],
      };
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      await saveRequest(updated);
    }, 1800);

    return () => clearTimeout(t);
  }, [requests, saveRequest]);

  if (!user) return <Login onLogin={(u) => { saveSession(u); setUser(u); }} />;

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleUpdate = async (updated: TrainingRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    await saveRequest(updated);
    setView({ kind: "list" });
  };

  const handleApprove = (r: TrainingRequest, comment?: string) => {
    const extra = comment ? ` — "${comment}"` : "";
    if (user.role === "TrainingUnitHead") {
      handleUpdate({
        ...r,
        status: "PendingTalentDev",
        comments: [...r.comments, `✅ Unit Head (${user.name}): Approved.${extra}`],
      });
    } else if (user.role === "TalentDevManager") {
      handleUpdate({
        ...r,
        status: "Approved",
        comments: [...r.comments, `✅ Talent Dev (${user.name}): Final sign-off.${extra}`],
      });
    }
  };

  const handleReject = (r: TrainingRequest, comment?: string) => {
    const extra = comment ? ` — "${comment}"` : "";
    handleUpdate({
      ...r,
      status: "Rejected",
      comments: [...r.comments, `❌ ${user.name}: Rejected.${extra}`],
    });
  };

  const handleCreate = async (r: TrainingRequest) => {
    setRequests((prev) => [r, ...prev]);
    await saveRequest(r);
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setView({ kind: "list" });
    setRequests([]);
  };

  // ── Views ─────────────────────────────────────────────────────────────────

  if (view.kind === "assessment") {
    return (
      <TrainingNeedAssessment
        user={user}
        onCancel={() => setView({ kind: "list" })}
        onCreate={(r) => {
          handleCreate(r);
        }}
      />
    );
  }

  if (view.kind === "detail") {
    const req = requests.find((r) => r.id === view.id);
    if (!req) { setView({ kind: "list" }); return null; }
    return (
      <Shell
        user={user}
        onLogout={handleLogout}
        requests={requests}
        onViewRequest={(id) => setView({ kind: "detail", id })}
      >
        <RequestDetail
          request={req}
          user={user}
          onBack={() => setView({ kind: "list" })}
          onUpdate={handleUpdate}
        />
      </Shell>
    );
  }

  return (
    <Shell
      user={user}
      onLogout={handleLogout}
      requests={requests}
      onViewRequest={(id) => setView({ kind: "detail", id })}
    >
      {IS_DEMO && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-amber-800 text-sm">
          <strong>Demo mode</strong> — data is stored locally and not shared between users.
          Add your Supabase credentials to <code className="bg-amber-100 px-1 rounded">.env</code> to enable shared persistent storage.
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-40 text-slate-400">
          Loading...
        </div>
      )}

      {!loading && user.role === "Employee" && (
        <EmployeeDashboard
          user={user}
          requests={requests}
          onView={(r) => setView({ kind: "detail", id: r.id })}
          onNavigateToAssessment={() => setView({ kind: "assessment" })}
        />
      )}
      {!loading && user.role === "Manager" && (
        <ManagerDashboard
          user={user}
          requests={requests}
          onView={(r) => setView({ kind: "detail", id: r.id })}
          onNewNomination={() => setView({ kind: "assessment" })}
          onNavigateToAssessment={() => setView({ kind: "assessment" })}
        />
      )}
      {!loading && user.role === "TrainingUnitHead" && (
        <UnitHeadDashboard
          user={user}
          requests={requests}
          onView={(r) => setView({ kind: "detail", id: r.id })}
          onApprove={handleApprove}
          onReject={handleReject}
          onNewNomination={() => setView({ kind: "assessment" })}
          onNavigateToAssessment={() => setView({ kind: "assessment" })}
        />
      )}
      {!loading && user.role === "TalentDevManager" && (
        <TalentDevDashboard
          user={user}
          requests={requests}
          onView={(r) => setView({ kind: "detail", id: r.id })}
          onApprove={handleApprove}
          onReject={handleReject}
          onNewNomination={() => setView({ kind: "assessment" })}
          onNavigateToAssessment={() => setView({ kind: "assessment" })}
        />
      )}
      {!loading && user.role === "HRAdmin" && (
        <HRAdminDashboard
          user={user}
          requests={requests}
          onView={(r) => setView({ kind: "detail", id: r.id })}
          onNavigateToAssessment={() => setView({ kind: "assessment" })}
        />
      )}

    </Shell>
  );
}
