export type Role = "Employee" | "TrainingUnitHead" | "TalentDevManager" | "Manager" | "HRAdmin";

export interface User {
  id: string;
  name: string;
  role: Role;
  managerId?: string;
  competency?: string;
  position: string;
  department: string;
  grade: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
}

export interface Institute {
  id: string;
  name: string;
}

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
  employeeId: string;
  employeeName: string;
  employeeDepartment?: string;
  nominatorId: string;
  nominatorName: string;
  competency: string;
  quarter: string;
  courseTitle: string;
  customCourse?: string;
  instituteId: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  basicCost: number;
  currency: string;
  usdCost: number;
  venueType: string;
  city: string;
  status: RequestStatus;
  comments: string[];
  createdAt: string;
}

export const USERS: User[] = [
  {
    id: "E001", name: "Ahmed Al-Saud", role: "Employee",
    managerId: "M001", competency: "Software Engineering",
    position: "Senior Software Developer", department: "Information Technology", grade: "G7",
  },
  {
    id: "E002", name: "Sara Al-Otaibi", role: "Employee",
    managerId: "M001", competency: "Data Analytics",
    position: "Data Analyst", department: "Business Intelligence", grade: "G6",
  },
  {
    id: "E003", name: "Khalid Al-Harbi", role: "Employee",
    managerId: "M002", competency: "Project Management",
    position: "Project Manager", department: "Operations", grade: "G8",
  },
  {
    id: "E004", name: "Reem Al-Shammari", role: "Employee",
    managerId: "M002", competency: "Finance",
    position: "Financial Analyst", department: "Finance", grade: "G6",
  },
  {
    id: "M001", name: "Fahad Al-Qahtani", role: "Manager",
    competency: "Engineering Leadership",
    position: "Engineering Manager", department: "Information Technology", grade: "G10",
  },
  {
    id: "M002", name: "Noura Al-Dossary", role: "Manager",
    competency: "Operations Management",
    position: "Operations Manager", department: "Operations", grade: "G10",
  },
  {
    id: "UH01", name: "Yousef Al-Mutairi", role: "TrainingUnitHead",
    competency: "Learning & Development",
    position: "Training Unit Head", department: "Human Resources", grade: "G11",
  },
  {
    id: "TD01", name: "Layla Al-Zahrani", role: "TalentDevManager",
    competency: "Talent Strategy",
    position: "Talent Development Manager", department: "Human Resources", grade: "G12",
  },
  {
    id: "HR01", name: "Omar Al-Ghamdi", role: "HRAdmin",
    competency: "Human Resources Management",
    position: "HR Systems Administrator", department: "Human Resources", grade: "G9",
  },
];

export const COURSES: Course[] = [
  { id: "C001", title: "Advanced React Patterns", category: "Technical" },
  { id: "C002", title: "Leadership Excellence", category: "Soft Skills" },
  { id: "C003", title: "Data Science Bootcamp", category: "Technical" },
  { id: "C004", title: "Project Management Professional (PMP)", category: "Certification" },
  { id: "C005", title: "Cybersecurity Fundamentals", category: "Technical" },
  { id: "C006", title: "Financial Modelling & Analysis", category: "Technical" },
  { id: "C007", title: "Strategic Leadership Program", category: "Soft Skills" },
  { id: "OTHER", title: "Other", category: "Custom" },
];

export const INSTITUTES: Institute[] = [
  { id: "I001", name: "Coursera for Business" },
  { id: "I002", name: "LinkedIn Learning" },
  { id: "I003", name: "Harvard Business School Online" },
  { id: "I004", name: "Saudi Academy for Leadership" },
  { id: "I005", name: "PMI Institute" },
  { id: "I006", name: "KFUPM Executive Education" },
];

export const VENUE_TYPES = ["Onsite", "Virtual", "Hybrid", "International"];
export const CURRENCIES = [
  { code: "USD", rate: 1 },
  { code: "SAR", rate: 0.27 },
  { code: "EUR", rate: 1.08 },
  { code: "GBP", rate: 1.27 },
];

export const INITIAL_REQUESTS: TrainingRequest[] = [
  {
    id: "REQ-1042",
    employeeId: "E001", employeeName: "Ahmed Al-Saud", employeeDepartment: "Information Technology",
    nominatorId: "M001", nominatorName: "Fahad Al-Qahtani",
    competency: "Software Engineering", quarter: "Q2-2026",
    courseTitle: "Advanced React Patterns", instituteId: "I001",
    startDate: "2026-06-10", endDate: "2026-06-14", durationDays: 5,
    basicCost: 4000, currency: "SAR", usdCost: 1080,
    venueType: "Virtual", city: "Riyadh", status: "PendingUnitHead",
    comments: ["AI Auditor: Budget within limits. Quarter alignment OK. ✓"],
    createdAt: "2026-04-20",
  },
  {
    id: "REQ-1043",
    employeeId: "E002", employeeName: "Sara Al-Otaibi", employeeDepartment: "Business Intelligence",
    nominatorId: "M001", nominatorName: "Fahad Al-Qahtani",
    competency: "Data Analytics", quarter: "Q2-2026",
    courseTitle: "Data Science Bootcamp", instituteId: "I001",
    startDate: "2026-07-01", endDate: "2026-07-21", durationDays: 21,
    basicCost: 8000, currency: "USD", usdCost: 8000,
    venueType: "Onsite", city: "Dubai", status: "PendingTalentDev",
    comments: ["AI Auditor: All checks passed. ✓", "✅ Unit Head (Yousef Al-Mutairi): Approved."],
    createdAt: "2026-04-18",
  },
  {
    id: "REQ-1041",
    employeeId: "E003", employeeName: "Khalid Al-Harbi", employeeDepartment: "Operations",
    nominatorId: "M002", nominatorName: "Noura Al-Dossary",
    competency: "Project Management", quarter: "Q1-2026",
    courseTitle: "Project Management Professional (PMP)", instituteId: "I005",
    startDate: "2026-05-15", endDate: "2026-05-19", durationDays: 5,
    basicCost: 3500, currency: "USD", usdCost: 3500,
    venueType: "Hybrid", city: "Jeddah", status: "Approved",
    comments: ["AI Auditor: All checks passed. ✓", "✅ Unit Head: Approved.", "✅ Talent Dev: Final sign-off."],
    createdAt: "2026-04-10",
  },
  {
    id: "REQ-1044",
    employeeId: "E001", employeeName: "Ahmed Al-Saud", employeeDepartment: "Information Technology",
    nominatorId: "M001", nominatorName: "Fahad Al-Qahtani",
    competency: "Software Engineering", quarter: "Q2-2026",
    courseTitle: "Cybersecurity Fundamentals", instituteId: "I002",
    startDate: "2026-05-05", endDate: "2026-05-06", durationDays: 2,
    basicCost: 500, currency: "USD", usdCost: 500,
    venueType: "Virtual", city: "Riyadh", status: "PendingEmployee",
    comments: [],
    createdAt: "2026-04-28",
  },
  {
    id: "REQ-1045",
    employeeId: "E004", employeeName: "Reem Al-Shammari", employeeDepartment: "Finance",
    nominatorId: "M002", nominatorName: "Noura Al-Dossary",
    competency: "Finance", quarter: "Q3-2026",
    courseTitle: "Financial Modelling & Analysis", instituteId: "I006",
    startDate: "2026-08-10", endDate: "2026-08-14", durationDays: 5,
    basicCost: 5200, currency: "USD", usdCost: 5200,
    venueType: "Onsite", city: "Riyadh", status: "Approved",
    comments: ["AI Auditor: All checks passed. ✓", "✅ Unit Head: Approved.", "✅ Talent Dev: Final sign-off."],
    createdAt: "2026-03-15",
  },
  {
    id: "REQ-1046",
    employeeId: "E002", employeeName: "Sara Al-Otaibi", employeeDepartment: "Business Intelligence",
    nominatorId: "M001", nominatorName: "Fahad Al-Qahtani",
    competency: "Leadership", quarter: "Q1-2026",
    courseTitle: "Leadership Excellence", instituteId: "I004",
    startDate: "2026-03-10", endDate: "2026-03-12", durationDays: 3,
    basicCost: 6000, currency: "SAR", usdCost: 1620,
    venueType: "Onsite", city: "Riyadh", status: "Rejected",
    comments: ["AI Auditor: All checks passed. ✓", "❌ Unit Head: Budget exceeds department allocation."],
    createdAt: "2026-02-20",
  },
];
