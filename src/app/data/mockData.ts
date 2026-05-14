// ════════════════════════════════════════════════════════════════════════════
//   T-WMS Mock Data — sourced from the client-provided Database.xlsx
// ════════════════════════════════════════════════════════════════════════════

export type Role =
  | "Employee"
  | "Manager"
  | "TrainingUnitHead"
  | "TalentDevManager"
  | "HRAdmin";

export interface User {
  id: string;
  name: string;
  role: Role;
  managerId?: string;
  position: string;
  department: string;
  grade: string;
  password?: string;
  email?: string;
}

// ── Workflow states ─────────────────────────────────────────────────────────
export type RequestStatus =
  | "DraftByManager"
  | "PendingEmployee"
  | "PendingAI"
  | "AIRejected"
  | "PendingUnitHead"
  | "PendingTalentDev"
  | "Approved"
  | "Rejected";

export interface TrainingRequest {
  id: string;

  // ── Manager Selection (filled by manager, read-only for employee) ──
  nominatorId: string;
  nominatorName: string;
  employeeId: string;
  employeeName: string;
  employeeDepartment?: string;
  employeeGrade?: string;
  competency: string;
  otherCompetency?: string;
  quarter: string; // Q1 / Q2 / Q3 / Q4
  trainingDetails?: string; // More Details For Training Need

  // ── Training Details (filled by employee/recipient) ──
  courseTitle: string;
  customCourse?: string; // Other Training Title
  provider: string; // Institute / معهد
  courseWeblink?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  basicCost: number;
  currency: string;
  usdCost: number;
  trainingMethod: string; // In-Person / Online
  venueLocation: string; // GCC / UK / USA / ...
  city: string;

  // ── Workflow ──
  status: RequestStatus;
  comments: string[];
  createdAt: string;
}

// ── Compatibility aliases used by older callsites/imports ───────────────────
// We keep these around so any remaining references still type-check until
// they're individually migrated.
export interface Course { id: string; title: string; category: string; }
export interface Institute { id: string; name: string; }

// ════════════════════════════════════════════════════════════════════════════
//   USERS — from `Employees` sheet of Database.xlsx
// ════════════════════════════════════════════════════════════════════════════
export const USERS: User[] = [
  {
    id: "100", name: "Nehal", role: "Employee", managerId: "200",
    position: "Senior Talent Development Specialist", department: "HR", grade: "21",
    password: "1111", email: "nenaotibi@gmail.com",
  },
  {
    id: "200", name: "Abdullah", role: "TrainingUnitHead", managerId: "300",
    position: "Head Training Management Unit", department: "HR", grade: "23",
    password: "2222", email: "nenaotibi@gmail.com",
  },
  {
    id: "300", name: "Atyaf", role: "TalentDevManager",
    position: "Manager Talent Development Division", department: "HR", grade: "24",
    password: "3333", email: "nenaotibi@gmail.com",
  },
  {
    id: "400", name: "Yusuf", role: "Employee", managerId: "200",
    position: "Senior Talent Development Specialist", department: "HR", grade: "21",
    password: "4444", email: "nenaotibi@gmail.com",
  },
  {
    id: "500", name: "Hassan", role: "Employee", managerId: "700",
    position: "Senior Talent Development Specialist", department: "HR", grade: "21",
    password: "5555", email: "nenaotibi@gmail.com",
  },
  {
    id: "600", name: "Ibrahim", role: "Employee", managerId: "200",
    position: "Senior Talent Development Specialist", department: "HR", grade: "21",
    password: "6666", email: "nenaotibi@gmail.com",
  },
  {
    id: "700", name: "Khalid", role: "Manager",
    position: "Manager Financial Reporting & Control Division", department: "Finance", grade: "24",
    password: "7777", email: "nenaotibi@gmail.com",
  },
  {
    id: "800", name: "Saeed", role: "Manager", managerId: "700",
    position: "Head Financial Reporting Unit", department: "Finance", grade: "22",
    password: "8888", email: "nenaotibi@gmail.com",
  },
  {
    id: "900", name: "Mohamed", role: "Employee", managerId: "800",
    position: "Financial Reporting Specialist", department: "Finance", grade: "22",
    password: "9999", email: "nenaotibi@gmail.com",
  },
  {
    id: "1000", name: "Nasser", role: "Employee", managerId: "800",
    position: "Financial Reporting Specialist", department: "Finance", grade: "20",
    password: "1212", email: "nenaotibi@gmail.com",
  },
  {
    id: "3030", name: "HR Administrator", role: "HRAdmin",
    position: "HR Administrator", department: "HR", grade: "—",
    password: "3030",
  },
];

// ════════════════════════════════════════════════════════════════════════════
//   COMPETENCIES — from `Competencies` sheet
// ════════════════════════════════════════════════════════════════════════════
export interface DepartmentCompetency {
  department: string;
  competency: string;
}

export const COMPETENCIES: DepartmentCompetency[] = [
  { department: "HR", competency: "Employee And Government Relations" },
  { department: "HR", competency: "Payroll" },
  { department: "HR", competency: "Negotiation" },
  { department: "Finance", competency: "Drives Engagement" },
  { department: "Finance", competency: "Cultivates Creativity And Innovation" },
  { department: "Finance", competency: "Reporting, Analysis, And Interpretation" },
];

export function competenciesForDepartment(department: string): string[] {
  return COMPETENCIES
    .filter((c) => c.department === department)
    .map((c) => c.competency);
}

// ════════════════════════════════════════════════════════════════════════════
//   TRAINING CATALOGUE — from `Training Catalogue` sheet
// ════════════════════════════════════════════════════════════════════════════
export interface CatalogueEntry {
  competency: string;
  trainingTitle: string;
  provider: string;
  durationDays: number;
  department: string;
  courseFeesUSD: number;
  courseWeblink: string;
}

export const OTHER_TRAINING_TITLE = "Other";

export const TRAINING_CATALOGUE: CatalogueEntry[] = [
  {
    competency: "Payroll",
    trainingTitle: "Certified Payroll Professional",
    provider: "Meirc",
    durationDays: 5,
    department: "HR",
    courseFeesUSD: 4800,
    courseWeblink: "https://www.meirc.com/training-courses/accounting-finance/certified-payroll-professional",
  },
  {
    competency: "Payroll",
    trainingTitle: "Certificate In HR Audit",
    provider: "Informa Academy",
    durationDays: 4,
    department: "HR",
    courseFeesUSD: 5445,
    courseWeblink: "https://informaconnect.com/certificate-in-hr-audit/",
  },
  {
    competency: "Drives Engagement",
    trainingTitle: "High Impact Leadership",
    provider: "Columbia Business School",
    durationDays: 5,
    department: "Finance",
    courseFeesUSD: 12250,
    courseWeblink: "https://execed.business.columbia.edu/programs/hil",
  },
];

export function trainingsForDepartment(department: string): string[] {
  const titles = TRAINING_CATALOGUE
    .filter((t) => t.department === department)
    .map((t) => t.trainingTitle);
  return [...titles, OTHER_TRAINING_TITLE];
}

export function findTraining(title: string): CatalogueEntry | undefined {
  return TRAINING_CATALOGUE.find((t) => t.trainingTitle === title);
}

// ════════════════════════════════════════════════════════════════════════════
//   PROVIDERS — from `Provider` sheet
// ════════════════════════════════════════════════════════════════════════════
export interface Provider { name: string; web: string; }

export const PROVIDERS: Provider[] = [
  { name: "Berkeley Executive Education", web: "https://executive.berkeley.edu/programs" },
  { name: "Center for Creative Leadership", web: "https://shop.ccl.org" },
  { name: "Columbia Business School", web: "https://execed.business.columbia.edu" },
  { name: "Financial Academy", web: "https://fa.gov.sa/" },
  { name: "Fitch Learning", web: "https://fitchlearning.com/" },
  { name: "Harvard Business School", web: "https://www.exed.hbs.edu/" },
  { name: "Harvard Division of Continuing Education", web: "https://professional.dce.harvard.edu/" },
  { name: "Harvard Law Studio", web: "https://hls.harvard.edu/executive-education/" },
  { name: "Harvard University", web: "https://pll.harvard.edu/catalog" },
  { name: "IE Business School", web: "https://www.ie.edu" },
  { name: "IESE", web: "https://www.iese.edu" },
  { name: "IMD", web: "https://www.imd.org" },
  { name: "Imperial College Business School", web: "https://www.imperial.ac.uk/business-school/executive-education" },
  { name: "Informa Academy", web: "https://informaconnect.com/academy/" },
  { name: "INSEAD", web: "https://www.insead.edu" },
  { name: "Institute of Public Administration", web: "https://www.ipa.edu.sa/ar/training" },
  { name: "IPMO Advisory", web: "https://ipmoadvisory.com" },
  { name: "ISOC", web: "https://www.isoc.com/" },
  { name: "Judge Business School", web: "https://www.jbs.cam.ac.uk" },
  { name: "Kellogg School of Management", web: "https://www.kellogg.northwestern.edu" },
  { name: "Koenig Solutions", web: "https://www.koenig-solutions.com" },
  { name: "KPI Institute", web: "https://kpiinstitute.org/" },
  { name: "Leoron", web: "https://www.leoron.com" },
  { name: "London Business School", web: "https://www.london.edu/" },
  { name: "London Management Center", web: "https://www.lmcuk.com" },
  { name: "London School of Economics", web: "https://www.lse.ac.uk/" },
  { name: "Management Center Europe", web: "https://mce.eu" },
  { name: "Meirc", web: "https://www.meirc.com/" },
  { name: "MIT Management", web: "https://executive.mit.edu" },
  { name: "Nexant", web: "https://training.nexanteca.com" },
  { name: "Qa Ltd", web: "https://www.qa.com/" },
  { name: "Said Business School", web: "https://www.sbs.ox.ac.uk/" },
  { name: "Shinka Management", web: "https://shinkamanagement.com/" },
  { name: "Stanford Business School", web: "https://www.gsb.stanford.edu/" },
  { name: "University of Cambridge", web: "https://www.jbs.cam.ac.uk" },
  { name: "Wharton Executive Education", web: "https://executiveeducation.wharton.upenn.edu/" },
];

// ════════════════════════════════════════════════════════════════════════════
//   TRAINING VENUES — from `Venue Location` sheet
// ════════════════════════════════════════════════════════════════════════════
export const TRAINING_VENUES = [
  "GCC", "UK", "USA", "Spain", "Australia",
  "France", "Austria", "Switzerland", "Singapore",
];

// ════════════════════════════════════════════════════════════════════════════
//   ENUMS — Quarters, training methods, currencies
// ════════════════════════════════════════════════════════════════════════════
export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

export const TRAINING_METHODS = ["In-Person", "Online"];

// Rate to USD (1 unit of currency = N USD)
export const CURRENCIES = [
  { code: "USD", label: "USD — US Dollar", rate: 1 },
  { code: "SAR", label: "SAR — Saudi Riyal", rate: 0.27 },
  { code: "EUR", label: "EUR — Euro", rate: 1.08 },
  { code: "GBP", label: "GBP — British Pound", rate: 1.27 },
  { code: "AED", label: "AED — UAE Dirham", rate: 0.27 },
];

// ── Back-compat exports (some legacy modules still import these) ────────────
export const VENUE_TYPES = TRAINING_VENUES;
export const INSTITUTES: Institute[] = PROVIDERS.map((p, i) => ({
  id: `P${String(i + 1).padStart(3, "0")}`,
  name: p.name,
}));
export const COURSES: Course[] = TRAINING_CATALOGUE.map((t) => ({
  id: t.trainingTitle,
  title: t.trainingTitle,
  category: t.department,
}));

// ════════════════════════════════════════════════════════════════════════════
//   SAMPLE REQUESTS — used in demo/fallback mode
// ════════════════════════════════════════════════════════════════════════════
export const INITIAL_REQUESTS: TrainingRequest[] = [
  {
    id: "REQ-1042",
    nominatorId: "200", nominatorName: "Abdullah",
    employeeId: "100", employeeName: "Nehal", employeeDepartment: "HR", employeeGrade: "21",
    competency: "Payroll", quarter: "Q2",
    trainingDetails: "Refresher on payroll compliance for KSA labour law.",
    courseTitle: "Certified Payroll Professional",
    provider: "Meirc",
    courseWeblink: "https://www.meirc.com/training-courses/accounting-finance/certified-payroll-professional",
    startDate: "2026-06-10", endDate: "2026-06-14", durationDays: 5,
    basicCost: 18000, currency: "SAR", usdCost: 4860,
    trainingMethod: "In-Person", venueLocation: "GCC", city: "Riyadh",
    status: "PendingUnitHead",
    comments: ["AI Auditor: Budget within limits. Quarter alignment OK. ✓"],
    createdAt: "2026-04-20",
  },
  {
    id: "REQ-1043",
    nominatorId: "700", nominatorName: "Khalid",
    employeeId: "900", employeeName: "Mohamed", employeeDepartment: "Finance", employeeGrade: "22",
    competency: "Drives Engagement", quarter: "Q3",
    trainingDetails: "Building executive leadership presence.",
    courseTitle: "High Impact Leadership",
    provider: "Columbia Business School",
    courseWeblink: "https://execed.business.columbia.edu/programs/hil",
    startDate: "2026-07-01", endDate: "2026-07-05", durationDays: 5,
    basicCost: 12250, currency: "USD", usdCost: 12250,
    trainingMethod: "In-Person", venueLocation: "USA", city: "New York",
    status: "PendingTalentDev",
    comments: [
      "AI Auditor: All checks passed. ✓",
      "✅ Unit Head (Abdullah): Approved.",
    ],
    createdAt: "2026-04-18",
  },
  {
    id: "REQ-1044",
    nominatorId: "200", nominatorName: "Abdullah",
    employeeId: "400", employeeName: "Yusuf", employeeDepartment: "HR", employeeGrade: "21",
    competency: "Negotiation", quarter: "Q2",
    trainingDetails: "Negotiation skills for HR business partners.",
    courseTitle: "",
    provider: "",
    startDate: "", endDate: "", durationDays: 0,
    basicCost: 0, currency: "USD", usdCost: 0,
    trainingMethod: "", venueLocation: "", city: "",
    status: "PendingEmployee",
    comments: ["Nominated by Abdullah (200)."],
    createdAt: "2026-04-28",
  },
];
