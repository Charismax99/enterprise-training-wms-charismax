/**
 * Database Types for T-WMS (Training Workflow Management System)
 * Auto-generated type definitions for Supabase tables
 */

// ============================================
// ENUMS
// ============================================

export type UserRole =
  | 'employee'
  | 'manager'
  | 'unit_head'
  | 'talent_dev'
  | 'hr_admin'

export type RequestStatus =
  | 'draft'
  | 'pending_manager'
  | 'pending_unit_head'
  | 'pending_talent_dev'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export type TrainingType =
  | 'internal'
  | 'external'
  | 'online'
  | 'workshop'
  | 'certification'

export type PriorityLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export type ApprovalAction =
  | 'approved'
  | 'rejected'
  | 'returned'

export type ExecutionStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type CompletionStatus =
  | 'completed'
  | 'incomplete'
  | 'failed'

export type NotificationType =
  | 'info'
  | 'warning'
  | 'success'
  | 'error'

// ============================================
// TABLE TYPES
// ============================================

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  employee_id?: string
  job_title?: string
  department?: string
  organizational_unit_id?: string
  manager_id?: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrganizationalUnit {
  id: string
  name: string
  code: string
  parent_unit_id?: string
  unit_head_id?: string
  created_at: string
  updated_at: string
}

export interface TrainingCategory {
  id: string
  name: string
  name_ar: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainingProvider {
  id: string
  name: string
  name_ar: string
  contact_person?: string
  email?: string
  phone?: string
  website?: string
  is_approved: boolean
  rating?: number
  created_at: string
  updated_at: string
}

export interface TrainingProgram {
  id: string
  title: string
  title_ar: string
  description?: string
  category_id?: string
  provider_id?: string
  training_type: TrainingType
  duration_hours?: number
  duration_days?: number
  cost_estimate?: number
  currency: string
  max_participants?: number
  prerequisites?: string
  learning_objectives?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainingRequest {
  id: string
  request_number: string
  requester_id: string

  // Request Details
  training_program_id?: string
  custom_training_title?: string
  training_type: TrainingType
  category_id?: string

  // Justification
  business_justification: string
  expected_outcomes?: string
  skill_gap_analysis?: string
  priority: PriorityLevel

  // Timing
  preferred_start_date?: string
  preferred_end_date?: string
  is_urgent: boolean
  urgency_reason?: string

  // Budget
  estimated_cost?: number
  budget_code?: string
  cost_center?: string

  // Participants
  number_of_participants: number
  participant_names?: string[]

  // Provider (for external training)
  provider_id?: string
  custom_provider_name?: string
  provider_contact?: string

  // Location
  training_location?: string
  is_online: boolean

  // Status & Workflow
  status: RequestStatus
  current_approver_id?: string
  current_approval_level: number

  // Metadata
  submitted_at?: string
  completed_at?: string
  cancelled_at?: string
  cancellation_reason?: string

  // Attachments
  attachments: Attachment[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface ApprovalWorkflow {
  id: string
  training_request_id: string
  approver_id: string
  approver_role: UserRole
  approval_level: number
  action?: ApprovalAction
  comments?: string
  approved_at?: string
  created_at: string
}

export interface TrainingExecution {
  id: string
  training_request_id: string
  actual_start_date: string
  actual_end_date: string
  actual_cost?: number
  actual_participants?: number
  trainer_name?: string
  training_materials: Material[]
  status: ExecutionStatus
  created_at: string
  updated_at: string
}

export interface TrainingAttendance {
  id: string
  execution_id: string
  employee_id: string
  attended: boolean
  attendance_percentage?: number
  completion_status?: CompletionStatus
  certificate_issued: boolean
  certificate_url?: string
  created_at: string
  updated_at: string
}

export interface TrainingEvaluation {
  id: string
  execution_id: string
  employee_id: string

  // Ratings (1-5 scale)
  content_rating?: number
  trainer_rating?: number
  materials_rating?: number
  organization_rating?: number
  overall_rating?: number

  // Feedback
  strengths?: string
  improvements?: string
  would_recommend?: boolean
  comments?: string

  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  related_request_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// ============================================
// HELPER TYPES
// ============================================

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploaded_at: string
}

export interface Material {
  id: string
  title: string
  url: string
  type: string
}

// ============================================
// EXTENDED TYPES (WITH RELATIONS)
// ============================================

export interface TrainingRequestWithRelations extends TrainingRequest {
  requester?: Profile
  current_approver?: Profile
  category?: TrainingCategory
  training_program?: TrainingProgram
  provider?: TrainingProvider
  approval_workflows?: ApprovalWorkflow[]
}

export interface ApprovalWorkflowWithRelations extends ApprovalWorkflow {
  approver?: Profile
  training_request?: TrainingRequest
}

export interface ProfileWithRelations extends Profile {
  manager?: Profile
  organizational_unit?: OrganizationalUnit
  direct_reports?: Profile[]
}

export interface TrainingExecutionWithRelations extends TrainingExecution {
  training_request?: TrainingRequestWithRelations
  attendances?: TrainingAttendance[]
  evaluations?: TrainingEvaluation[]
}

// ============================================
// FORM TYPES (FOR UI)
// ============================================

export interface TrainingRequestFormData {
  // Basic Info
  training_type: TrainingType
  custom_training_title: string
  category_id: string

  // Justification
  business_justification: string
  expected_outcomes: string
  skill_gap_analysis: string
  priority: PriorityLevel
  is_urgent: boolean
  urgency_reason?: string

  // Timing
  preferred_start_date: string
  preferred_end_date: string

  // Budget
  estimated_cost: number
  budget_code?: string
  cost_center?: string

  // Participants
  number_of_participants: number
  participant_names: string[]

  // Provider
  provider_id?: string
  custom_provider_name?: string
  provider_contact?: string

  // Location
  training_location: string
  is_online: boolean

  // Attachments
  attachments: File[]
}

export interface ApprovalFormData {
  action: ApprovalAction
  comments: string
}

export interface EvaluationFormData {
  content_rating: number
  trainer_rating: number
  materials_rating: number
  organization_rating: number
  overall_rating: number
  strengths: string
  improvements: string
  would_recommend: boolean
  comments: string
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  total_requests: number
  pending_requests: number
  approved_requests: number
  rejected_requests: number
  total_budget_spent: number
  total_participants: number
}

export interface ManagerDashboardStats extends DashboardStats {
  team_training_hours: number
  team_members_trained: number
}

export interface TalentDevDashboardStats extends DashboardStats {
  active_programs: number
  scheduled_trainings: number
  completion_rate: number
}

// ============================================
// FILTER & SORT TYPES
// ============================================

export interface TrainingRequestFilters {
  status?: RequestStatus[]
  priority?: PriorityLevel[]
  training_type?: TrainingType[]
  category_id?: string
  date_from?: string
  date_to?: string
  requester_id?: string
}

export interface SortOptions {
  field: keyof TrainingRequest
  direction: 'asc' | 'desc'
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// ============================================
// SUPABASE QUERY TYPES
// ============================================

export type TrainingRequestInsert = Omit<TrainingRequest, 'id' | 'request_number' | 'created_at' | 'updated_at'>
export type TrainingRequestUpdate = Partial<TrainingRequestInsert>

export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>
export type ProfileUpdate = Partial<ProfileInsert>

export type ApprovalWorkflowInsert = Omit<ApprovalWorkflow, 'id' | 'created_at'>

// ============================================
// UTILITY TYPES
// ============================================

export const REQUEST_STATUS_LABELS: Record<RequestStatus, { en: string; ar: string }> = {
  draft: { en: 'Draft', ar: 'مسودة' },
  pending_manager: { en: 'Pending Manager', ar: 'بانتظار المدير' },
  pending_unit_head: { en: 'Pending Unit Head', ar: 'بانتظار رئيس الوحدة' },
  pending_talent_dev: { en: 'Pending Talent Dev', ar: 'بانتظار تطوير المواهب' },
  approved: { en: 'Approved', ar: 'معتمد' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
  cancelled: { en: 'Cancelled', ar: 'ملغى' }
}

export const PRIORITY_LABELS: Record<PriorityLevel, { en: string; ar: string; color: string }> = {
  low: { en: 'Low', ar: 'منخفض', color: '#10b981' },
  medium: { en: 'Medium', ar: 'متوسط', color: '#f59e0b' },
  high: { en: 'High', ar: 'عالي', color: '#ef4444' },
  urgent: { en: 'Urgent', ar: 'عاجل', color: '#dc2626' }
}

export const TRAINING_TYPE_LABELS: Record<TrainingType, { en: string; ar: string }> = {
  internal: { en: 'Internal', ar: 'داخلي' },
  external: { en: 'External', ar: 'خارجي' },
  online: { en: 'Online', ar: 'إلكتروني' },
  workshop: { en: 'Workshop', ar: 'ورشة عمل' },
  certification: { en: 'Certification', ar: 'شهادة احترافية' }
}

export const ROLE_LABELS: Record<UserRole, { en: string; ar: string }> = {
  employee: { en: 'Employee', ar: 'موظف' },
  manager: { en: 'Manager', ar: 'مدير' },
  unit_head: { en: 'Unit Head', ar: 'رئيس وحدة' },
  talent_dev: { en: 'Talent Development', ar: 'تطوير المواهب' },
  hr_admin: { en: 'HR Admin', ar: 'مسؤول الموارد البشرية' }
}
