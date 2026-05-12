/**
 * Training Request Service
 * API functions for managing training requests
 */

import { supabase } from '../lib/supabase'
import type {
  TrainingRequest,
  TrainingRequestWithRelations,
  TrainingRequestInsert,
  TrainingRequestUpdate,
  TrainingRequestFilters,
  SortOptions,
  PaginatedResponse,
} from '../types/database.types'

/**
 * Fetch all training requests with optional filters and sorting
 */
export const getTrainingRequests = async (
  filters?: TrainingRequestFilters,
  sort?: SortOptions,
  page: number = 1,
  perPage: number = 10
): Promise<PaginatedResponse<TrainingRequestWithRelations>> => {
  let query = supabase
    .from('training_requests')
    .select(
      `
      *,
      requester:profiles!requester_id(id, full_name, email, job_title, department),
      current_approver:profiles!current_approver_id(id, full_name, email),
      category:training_categories(id, name, name_ar),
      training_program:training_programs(id, title, title_ar),
      provider:training_providers(id, name, name_ar)
    `,
      { count: 'exact' }
    )

  // Apply filters
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status)
  }
  if (filters?.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority)
  }
  if (filters?.training_type && filters.training_type.length > 0) {
    query = query.in('training_type', filters.training_type)
  }
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to)
  }
  if (filters?.requester_id) {
    query = query.eq('requester_id', filters.requester_id)
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === 'asc' })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    total: count || 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count || 0) / perPage),
  }
}

/**
 * Get a single training request by ID
 */
export const getTrainingRequestById = async (
  id: string
): Promise<TrainingRequestWithRelations | null> => {
  const { data, error } = await supabase
    .from('training_requests')
    .select(
      `
      *,
      requester:profiles!requester_id(*),
      current_approver:profiles!current_approver_id(*),
      category:training_categories(*),
      training_program:training_programs(*),
      provider:training_providers(*),
      approval_workflows(
        *,
        approver:profiles(*)
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Get training requests for current user
 */
export const getMyTrainingRequests = async (): Promise<TrainingRequest[]> => {
  const { data, error } = await supabase
    .from('training_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get pending approvals for current user
 */
export const getMyPendingApprovals = async (): Promise<
  TrainingRequestWithRelations[]
> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('training_requests')
    .select(
      `
      *,
      requester:profiles!requester_id(id, full_name, email, job_title, department),
      category:training_categories(id, name, name_ar),
      training_program:training_programs(id, title, title_ar)
    `
    )
    .eq('current_approver_id', user.id)
    .in('status', [
      'pending_manager',
      'pending_unit_head',
      'pending_talent_dev',
    ])
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create a new training request
 */
export const createTrainingRequest = async (
  requestData: TrainingRequestInsert
): Promise<TrainingRequest> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('training_requests')
    .insert({
      ...requestData,
      requester_id: user.id,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a training request
 */
export const updateTrainingRequest = async (
  id: string,
  updates: TrainingRequestUpdate
): Promise<TrainingRequest> => {
  const { data, error } = await supabase
    .from('training_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Submit a training request (change status from draft to pending_manager)
 */
export const submitTrainingRequest = async (
  id: string
): Promise<TrainingRequest> => {
  // Get the requester's profile to find their manager
  const request = await getTrainingRequestById(id)
  if (!request) throw new Error('Request not found')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('manager_id')
    .eq('id', request.requester_id)
    .single()

  if (profileError) throw profileError
  if (!profile?.manager_id) throw new Error('Manager not assigned')

  // Update request status and assign to manager
  const { data, error } = await supabase
    .from('training_requests')
    .update({
      status: 'pending_manager',
      current_approver_id: profile.manager_id,
      submitted_at: new Date().toISOString(),
      current_approval_level: 1,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Create notification for manager
  await createNotification(
    profile.manager_id,
    'New Training Request',
    `You have a new training request to review`,
    'info',
    id
  )

  return data
}

/**
 * Approve a training request
 */
export const approveTrainingRequest = async (
  requestId: string,
  comments?: string
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current request details
  const request = await getTrainingRequestById(requestId)
  if (!request) throw new Error('Request not found')

  // Get approver profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  // Determine next status and approver based on current status
  let nextStatus: string
  let nextApproverId: string | null = null

  switch (request.status) {
    case 'pending_manager':
      // Move to unit head
      nextStatus = 'pending_unit_head'
      // Find unit head from requester's organizational unit
      const { data: orgUnit } = await supabase
        .from('organizational_units')
        .select('unit_head_id')
        .eq(
          'id',
          (request.requester as any).organizational_unit_id
        )
        .single()
      nextApproverId = orgUnit?.unit_head_id || null
      break

    case 'pending_unit_head':
      // Move to talent development
      nextStatus = 'pending_talent_dev'
      // Find talent development user
      const { data: talentDev } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'talent_dev')
        .limit(1)
        .single()
      nextApproverId = talentDev?.id || null
      break

    case 'pending_talent_dev':
      // Final approval
      nextStatus = 'approved'
      nextApproverId = null
      break

    default:
      throw new Error('Invalid request status for approval')
  }

  // Create approval record
  const { error: approvalError } = await supabase
    .from('approval_workflows')
    .insert({
      training_request_id: requestId,
      approver_id: user.id,
      approver_role: profile.role,
      approval_level: request.current_approval_level,
      action: 'approved',
      comments: comments || null,
      approved_at: new Date().toISOString(),
    })

  if (approvalError) throw approvalError

  // Update request status
  const { error: updateError } = await supabase
    .from('training_requests')
    .update({
      status: nextStatus as any,
      current_approver_id: nextApproverId,
      current_approval_level: request.current_approval_level + 1,
      ...(nextStatus === 'approved' && {
        completed_at: new Date().toISOString(),
      }),
    })
    .eq('id', requestId)

  if (updateError) throw updateError

  // Create notification for requester
  await createNotification(
    request.requester_id,
    'Request Approved',
    `Your training request has been approved by ${profile.role}`,
    'success',
    requestId
  )

  // If there's a next approver, notify them
  if (nextApproverId) {
    await createNotification(
      nextApproverId,
      'New Training Request',
      `You have a new training request to review`,
      'info',
      requestId
    )
  }
}

/**
 * Reject a training request
 */
export const rejectTrainingRequest = async (
  requestId: string,
  comments: string
): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const request = await getTrainingRequestById(requestId)
  if (!request) throw new Error('Request not found')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  // Create approval record with rejection
  const { error: approvalError } = await supabase
    .from('approval_workflows')
    .insert({
      training_request_id: requestId,
      approver_id: user.id,
      approver_role: profile.role,
      approval_level: request.current_approval_level,
      action: 'rejected',
      comments: comments,
      approved_at: new Date().toISOString(),
    })

  if (approvalError) throw approvalError

  // Update request status to rejected
  const { error: updateError } = await supabase
    .from('training_requests')
    .update({
      status: 'rejected',
      current_approver_id: null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updateError) throw updateError

  // Notify requester
  await createNotification(
    request.requester_id,
    'Request Rejected',
    `Your training request has been rejected`,
    'error',
    requestId
  )
}

/**
 * Cancel a training request
 */
export const cancelTrainingRequest = async (
  requestId: string,
  reason: string
): Promise<void> => {
  const { error } = await supabase
    .from('training_requests')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq('id', requestId)

  if (error) throw error
}

/**
 * Delete a draft training request
 */
export const deleteTrainingRequest = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('training_requests')
    .delete()
    .eq('id', id)
    .eq('status', 'draft')

  if (error) throw error
}

/**
 * Helper: Create notification
 */
const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string,
  relatedRequestId?: string
) => {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    related_request_id: relatedRequestId || null,
  })

  if (error) console.error('Failed to create notification:', error)
}

/**
 * Get dashboard statistics for current user
 */
export const getDashboardStats = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Count requests by status
  const { data: requests } = await supabase
    .from('training_requests')
    .select('status, estimated_cost, number_of_participants')

  const stats = {
    total_requests: requests?.length || 0,
    pending_requests:
      requests?.filter((r) => r.status.startsWith('pending')).length || 0,
    approved_requests:
      requests?.filter((r) => r.status === 'approved').length || 0,
    rejected_requests:
      requests?.filter((r) => r.status === 'rejected').length || 0,
    total_budget_spent:
      requests
        ?.filter((r) => r.status === 'approved')
        .reduce((sum, r) => sum + (r.estimated_cost || 0), 0) || 0,
    total_participants:
      requests?.reduce((sum, r) => sum + (r.number_of_participants || 0), 0) ||
      0,
  }

  return stats
}
