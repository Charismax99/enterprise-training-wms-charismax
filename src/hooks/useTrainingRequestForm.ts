/**
 * Custom Hook for Training Request Form
 * Handles form state, validation, and submission to Supabase
 */

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type {
  TrainingType,
  PriorityLevel,
  RequestStatus,
} from '../types/database.types'

export interface TrainingRequestFormFields {
  // Basic Information
  custom_training_title: string
  training_type: TrainingType
  category_id: string

  // Justification
  business_justification: string
  expected_outcomes: string
  skill_gap_analysis: string

  // Priority
  priority: PriorityLevel
  is_urgent: boolean
  urgency_reason: string

  // Timing
  preferred_start_date: string
  preferred_end_date: string

  // Budget
  estimated_cost: number
  budget_code: string
  cost_center: string

  // Participants
  number_of_participants: number
  participant_names: string[]

  // Provider (for external training)
  provider_id: string
  custom_provider_name: string
  provider_contact: string

  // Location
  training_location: string
  is_online: boolean
}

interface UseTrainingRequestFormReturn {
  formData: TrainingRequestFormFields
  errors: Record<string, string>
  loading: boolean
  submitError: string | null
  submitSuccess: boolean
  updateField: <K extends keyof TrainingRequestFormFields>(
    field: K,
    value: TrainingRequestFormFields[K]
  ) => void
  updateMultipleFields: (updates: Partial<TrainingRequestFormFields>) => void
  saveDraft: () => Promise<{ success: boolean; data?: any; error?: string }>
  submitRequest: () => Promise<{ success: boolean; data?: any; error?: string }>
  resetForm: () => void
  validateForm: () => boolean
}

const initialFormData: TrainingRequestFormFields = {
  custom_training_title: '',
  training_type: 'external',
  category_id: '',
  business_justification: '',
  expected_outcomes: '',
  skill_gap_analysis: '',
  priority: 'medium',
  is_urgent: false,
  urgency_reason: '',
  preferred_start_date: '',
  preferred_end_date: '',
  estimated_cost: 0,
  budget_code: '',
  cost_center: '',
  number_of_participants: 1,
  participant_names: [],
  provider_id: '',
  custom_provider_name: '',
  provider_contact: '',
  training_location: '',
  is_online: false,
}

export function useTrainingRequestForm(): UseTrainingRequestFormReturn {
  const [formData, setFormData] =
    useState<TrainingRequestFormFields>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Update single field
  const updateField = <K extends keyof TrainingRequestFormFields>(
    field: K,
    value: TrainingRequestFormFields[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Update multiple fields at once
  const updateMultipleFields = (updates: Partial<TrainingRequestFormFields>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.custom_training_title.trim()) {
      newErrors.custom_training_title = 'عنوان التدريب مطلوب'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'التصنيف مطلوب'
    }

    if (!formData.business_justification.trim()) {
      newErrors.business_justification = 'المبرر التجاري مطلوب'
    }

    if (formData.business_justification.length < 20) {
      newErrors.business_justification = 'المبرر التجاري يجب أن يكون 20 حرف على الأقل'
    }

    if (!formData.preferred_start_date) {
      newErrors.preferred_start_date = 'تاريخ البدء المفضل مطلوب'
    }

    if (formData.is_urgent && !formData.urgency_reason.trim()) {
      newErrors.urgency_reason = 'سبب الاستعجال مطلوب عند تحديد الطلب كعاجل'
    }

    if (formData.estimated_cost < 0) {
      newErrors.estimated_cost = 'التكلفة لا يمكن أن تكون سالبة'
    }

    if (formData.number_of_participants < 1) {
      newErrors.number_of_participants = 'يجب أن يكون عدد المشاركين 1 على الأقل'
    }

    // Date validation
    if (
      formData.preferred_start_date &&
      formData.preferred_end_date &&
      new Date(formData.preferred_end_date) <
        new Date(formData.preferred_start_date)
    ) {
      newErrors.preferred_end_date = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save as draft
  const saveDraft = async () => {
    setLoading(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('لم يتم العثور على المستخدم. يرجى تسجيل الدخول مرة أخرى.')
      }

      // Prepare data for insert
      const requestData = {
        requester_id: user.id,
        custom_training_title: formData.custom_training_title.trim(),
        training_type: formData.training_type,
        category_id: formData.category_id || null,
        business_justification: formData.business_justification.trim(),
        expected_outcomes: formData.expected_outcomes.trim() || null,
        skill_gap_analysis: formData.skill_gap_analysis.trim() || null,
        priority: formData.priority,
        is_urgent: formData.is_urgent,
        urgency_reason: formData.urgency_reason.trim() || null,
        preferred_start_date: formData.preferred_start_date || null,
        preferred_end_date: formData.preferred_end_date || null,
        estimated_cost: formData.estimated_cost || null,
        budget_code: formData.budget_code.trim() || null,
        cost_center: formData.cost_center.trim() || null,
        number_of_participants: formData.number_of_participants,
        participant_names:
          formData.participant_names.length > 0
            ? formData.participant_names
            : null,
        provider_id: formData.provider_id || null,
        custom_provider_name: formData.custom_provider_name.trim() || null,
        provider_contact: formData.provider_contact.trim() || null,
        training_location: formData.training_location.trim() || null,
        is_online: formData.is_online,
        status: 'draft' as RequestStatus,
        current_approval_level: 0,
        attachments: [],
      }

      // Insert into database
      const { data, error: insertError } = await supabase
        .from('training_requests')
        .insert(requestData)
        .select()
        .single()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(
          insertError.message || 'حدث خطأ أثناء حفظ المسودة'
        )
      }

      setSubmitSuccess(true)
      return { success: true, data }
    } catch (err: any) {
      console.error('Error saving draft:', err)
      setSubmitError(err.message || 'حدث خطأ غير متوقع')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Submit request (validates and submits to manager)
  const submitRequest = async () => {
    // Validate form first
    if (!validateForm()) {
      setSubmitError('يرجى تصحيح الأخطاء في النموذج')
      return { success: false, error: 'Validation failed' }
    }

    setLoading(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error('لم يتم العثور على المستخدم. يرجى تسجيل الدخول مرة أخرى.')
      }

      // Get user profile to find manager
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id, full_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        throw new Error('فشل تحميل معلومات الملف الشخصي')
      }

      if (!profile?.manager_id) {
        throw new Error(
          'لم يتم تعيين مدير لك. يرجى الاتصال بقسم الموارد البشرية.'
        )
      }

      // Prepare data for insert
      const requestData = {
        requester_id: user.id,
        custom_training_title: formData.custom_training_title.trim(),
        training_type: formData.training_type,
        category_id: formData.category_id || null,
        business_justification: formData.business_justification.trim(),
        expected_outcomes: formData.expected_outcomes.trim() || null,
        skill_gap_analysis: formData.skill_gap_analysis.trim() || null,
        priority: formData.priority,
        is_urgent: formData.is_urgent,
        urgency_reason: formData.urgency_reason.trim() || null,
        preferred_start_date: formData.preferred_start_date || null,
        preferred_end_date: formData.preferred_end_date || null,
        estimated_cost: formData.estimated_cost || null,
        budget_code: formData.budget_code.trim() || null,
        cost_center: formData.cost_center.trim() || null,
        number_of_participants: formData.number_of_participants,
        participant_names:
          formData.participant_names.length > 0
            ? formData.participant_names
            : null,
        provider_id: formData.provider_id || null,
        custom_provider_name: formData.custom_provider_name.trim() || null,
        provider_contact: formData.provider_contact.trim() || null,
        training_location: formData.training_location.trim() || null,
        is_online: formData.is_online,
        status: 'pending_manager' as RequestStatus,
        current_approver_id: profile.manager_id,
        current_approval_level: 1,
        submitted_at: new Date().toISOString(),
        attachments: [],
      }

      // Insert into database
      const { data, error: insertError } = await supabase
        .from('training_requests')
        .insert(requestData)
        .select()
        .single()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        throw new Error(
          insertError.message || 'حدث خطأ أثناء إرسال الطلب'
        )
      }

      // Create notification for manager
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: profile.manager_id,
          title: 'طلب تدريب جديد',
          message: `لديك طلب تدريب جديد من ${profile.full_name}`,
          type: 'info',
          related_request_id: data.id,
          is_read: false,
        })

      if (notificationError) {
        console.warn('Failed to create notification:', notificationError)
        // Don't fail the whole request if notification fails
      }

      setSubmitSuccess(true)
      return { success: true, data }
    } catch (err: any) {
      console.error('Error submitting request:', err)
      setSubmitError(err.message || 'حدث خطأ غير متوقع')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormData)
    setErrors({})
    setSubmitError(null)
    setSubmitSuccess(false)
  }

  return {
    formData,
    errors,
    loading,
    submitError,
    submitSuccess,
    updateField,
    updateMultipleFields,
    saveDraft,
    submitRequest,
    resetForm,
    validateForm,
  }
}
