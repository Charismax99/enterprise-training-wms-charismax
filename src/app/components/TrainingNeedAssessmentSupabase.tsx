/**
 * Training Need Assessment Form - Connected to Supabase
 * This component replaces TrainingNeedAssessment with full database integration
 */

import { useState, useEffect } from 'react'
import { ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth'
import { useTrainingRequestForm } from '../../hooks/useTrainingRequestForm'
import type { TrainingCategory, TrainingProvider } from '../../types/database.types'

// Field mapping guide for reference:
// UI Field Name          →  Database Column Name
// ================================================
// Training Title         →  custom_training_title
// Category              →  category_id
// Training Type         →  training_type
// Business Need         →  business_justification
// Expected Outcomes     →  expected_outcomes
// Skill Gap            →  skill_gap_analysis
// Priority             →  priority
// Is Urgent            →  is_urgent
// Urgency Reason       →  urgency_reason
// Start Date           →  preferred_start_date
// End Date             →  preferred_end_date
// Estimated Cost       →  estimated_cost
// Budget Code          →  budget_code
// Cost Center          →  cost_center
// Number of People     →  number_of_participants
// Provider             →  provider_id / custom_provider_name
// Location             →  training_location
// Is Online            →  is_online
// Employee ID          →  requester_id (auto-captured from auth)

interface TrainingNeedAssessmentSupabaseProps {
  onBack: () => void
}

function Field({
  label,
  required,
  children,
  full,
  error,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  full?: boolean
  error?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
      <label className="text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  )
}

const inputCls =
  'text-sm px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 w-full outline-none focus:border-[#2D5A39] focus:ring-2 focus:ring-[#2D5A39]/10 transition'
const selectCls = inputCls
const errorInputCls =
  'text-sm px-3 py-2 border-2 border-red-400 rounded-lg bg-white text-gray-800 w-full outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition'

function SectionHead({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#2D5A39] to-[#3D7A4E] px-5 py-3 rounded-t-lg">
      <span className="text-white text-lg">{icon}</span>
      <span className="text-sm font-bold text-white tracking-wide">
        {title}
      </span>
    </div>
  )
}

export function TrainingNeedAssessmentSupabase({
  onBack,
}: TrainingNeedAssessmentSupabaseProps) {
  const { user, profile, loading: authLoading } = useSupabaseAuth()
  const {
    formData,
    errors,
    loading: formLoading,
    submitError,
    submitSuccess,
    updateField,
    saveDraft,
    submitRequest,
    resetForm,
  } = useTrainingRequestForm()

  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [providers, setProviders] = useState<TrainingProvider[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Load categories and providers on mount
  useEffect(() => {
    loadFormData()
  }, [])

  const loadFormData = async () => {
    try {
      // Load training categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('training_categories')
        .select('*')
        .eq('is_active', true)
        .order('name_ar')

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])

      // Load training providers
      const { data: providersData, error: providersError } = await supabase
        .from('training_providers')
        .select('*')
        .eq('is_approved', true)
        .order('name_ar')

      if (providersError) throw providersError
      setProviders(providersData || [])
    } catch (error) {
      console.error('Error loading form data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async () => {
    const result = await submitRequest()
    if (result.success) {
      // Success will be shown by submitSuccess state
    }
  }

  const handleSaveDraft = async () => {
    const result = await saveDraft()
    if (result.success) {
      setTimeout(() => {
        onBack()
      }, 2000)
    }
  }

  // Show loading state while checking auth
  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2D5A39] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border-t-4 border-red-600">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-red-600 font-bold text-2xl mb-3">
            خطأ في المصادقة
          </h2>
          <p className="text-gray-600 mb-8">
            يرجى تسجيل الدخول للوصول إلى هذه الصفحة
          </p>
          <button
            onClick={onBack}
            className="w-full bg-[#2D5A39] hover:bg-[#1F4128] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    )
  }

  // Show success message
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center border-t-4 border-[#2D5A39]">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-[#2D5A39] font-bold text-2xl mb-3">
            تم إرسال الطلب بنجاح
          </h2>
          <p className="text-gray-600 mb-2">
            تم إرسال طلب التدريب الخاص بك للمراجعة
          </p>
          <p className="text-sm text-gray-500 mb-8">
            سيتم إشعارك عند مراجعة الطلب من قبل المدير المباشر
          </p>
          <button
            onClick={() => {
              resetForm()
              onBack()
            }}
            className="w-full bg-[#2D5A39] hover:bg-[#1F4128] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2D5A39] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#2D5A39]">
              نموذج طلب تدريب جديد
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              الموظف: {profile.full_name} • القسم: {profile.department}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        {/* Error Alert */}
        {submitError && (
          <div className="mb-6 bg-red-50 border-r-4 border-red-600 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-semibold mb-1">خطأ في الإرسال</h3>
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 flex flex-col gap-8">
            {/* Section 1: Basic Information */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="📋" title="المعلومات الأساسية" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field
                  label="عنوان التدريب المطلوب"
                  required
                  full
                  error={errors.custom_training_title}
                >
                  <input
                    className={
                      errors.custom_training_title ? errorInputCls : inputCls
                    }
                    value={formData.custom_training_title}
                    onChange={(e) =>
                      updateField('custom_training_title', e.target.value)
                    }
                    placeholder="مثال: دورة تطوير React المتقدمة"
                  />
                </Field>

                <Field
                  label="نوع التدريب"
                  required
                  error={errors.training_type}
                >
                  <select
                    className={
                      errors.training_type ? errorInputCls : selectCls
                    }
                    value={formData.training_type}
                    onChange={(e) =>
                      updateField(
                        'training_type',
                        e.target.value as any
                      )
                    }
                  >
                    <option value="external">خارجي</option>
                    <option value="internal">داخلي</option>
                    <option value="online">إلكتروني</option>
                    <option value="workshop">ورشة عمل</option>
                    <option value="certification">شهادة احترافية</option>
                  </select>
                </Field>

                <Field label="التصنيف" required error={errors.category_id}>
                  <select
                    className={errors.category_id ? errorInputCls : selectCls}
                    value={formData.category_id}
                    onChange={(e) => updateField('category_id', e.target.value)}
                  >
                    <option value="">اختر التصنيف</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="الأولوية">
                  <select
                    className={selectCls}
                    value={formData.priority}
                    onChange={(e) =>
                      updateField('priority', e.target.value as any)
                    }
                  >
                    <option value="low">منخفض</option>
                    <option value="medium">متوسط</option>
                    <option value="high">عالي</option>
                    <option value="urgent">عاجل</option>
                  </select>
                </Field>

                <Field label="هل الطلب عاجل؟" full>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_urgent}
                      onChange={(e) =>
                        updateField('is_urgent', e.target.checked)
                      }
                      className="w-5 h-5 text-[#2D5A39] border-gray-300 rounded focus:ring-[#2D5A39]"
                    />
                    <span className="text-sm text-gray-700">
                      نعم، هذا الطلب عاجل
                    </span>
                  </label>
                </Field>

                {formData.is_urgent && (
                  <Field
                    label="سبب الاستعجال"
                    required
                    full
                    error={errors.urgency_reason}
                  >
                    <textarea
                      className={
                        errors.urgency_reason
                          ? errorInputCls + ' resize-y min-h-[80px]'
                          : inputCls + ' resize-y min-h-[80px]'
                      }
                      value={formData.urgency_reason}
                      onChange={(e) =>
                        updateField('urgency_reason', e.target.value)
                      }
                      placeholder="يرجى توضيح سبب استعجال هذا التدريب"
                    />
                  </Field>
                )}
              </div>
            </div>

            {/* Section 2: Training Justification */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="📝" title="المبررات والأهداف" />
              <div className="p-6 grid grid-cols-1 gap-y-5 bg-white rounded-b-xl">
                <Field
                  label="المبرر التجاري للتدريب"
                  required
                  full
                  error={errors.business_justification}
                >
                  <textarea
                    className={
                      errors.business_justification
                        ? errorInputCls + ' resize-y min-h-[100px]'
                        : inputCls + ' resize-y min-h-[100px]'
                    }
                    value={formData.business_justification}
                    onChange={(e) =>
                      updateField('business_justification', e.target.value)
                    }
                    placeholder="اشرح الحاجة التجارية لهذا التدريب وكيف سيساهم في تحسين الأداء الوظيفي..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    الحد الأدنى: 20 حرف
                  </p>
                </Field>

                <Field label="النتائج المتوقعة" full>
                  <textarea
                    className={inputCls + ' resize-y min-h-[80px]'}
                    value={formData.expected_outcomes}
                    onChange={(e) =>
                      updateField('expected_outcomes', e.target.value)
                    }
                    placeholder="ما هي النتائج والمهارات المتوقع اكتسابها من هذا التدريب؟"
                  />
                </Field>

                <Field label="تحليل الفجوة في المهارات" full>
                  <textarea
                    className={inputCls + ' resize-y min-h-[80px]'}
                    value={formData.skill_gap_analysis}
                    onChange={(e) =>
                      updateField('skill_gap_analysis', e.target.value)
                    }
                    placeholder="ما هي المهارات الحالية وما هي الفجوة التي يسدها هذا التدريب؟"
                  />
                </Field>
              </div>
            </div>

            {/* Section 3: Schedule & Location */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="📅" title="الجدول الزمني والموقع" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field
                  label="تاريخ البدء المفضل"
                  required
                  error={errors.preferred_start_date}
                >
                  <input
                    type="date"
                    className={
                      errors.preferred_start_date ? errorInputCls : inputCls
                    }
                    value={formData.preferred_start_date}
                    onChange={(e) =>
                      updateField('preferred_start_date', e.target.value)
                    }
                  />
                </Field>

                <Field
                  label="تاريخ الانتهاء المفضل"
                  error={errors.preferred_end_date}
                >
                  <input
                    type="date"
                    className={
                      errors.preferred_end_date ? errorInputCls : inputCls
                    }
                    value={formData.preferred_end_date}
                    onChange={(e) =>
                      updateField('preferred_end_date', e.target.value)
                    }
                  />
                </Field>

                <Field label="هل التدريب عبر الإنترنت؟">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_online}
                      onChange={(e) =>
                        updateField('is_online', e.target.checked)
                      }
                      className="w-5 h-5 text-[#2D5A39] border-gray-300 rounded focus:ring-[#2D5A39]"
                    />
                    <span className="text-sm text-gray-700">
                      نعم، التدريب أونلاين
                    </span>
                  </label>
                </Field>

                {!formData.is_online && (
                  <Field label="موقع التدريب">
                    <input
                      className={inputCls}
                      value={formData.training_location}
                      onChange={(e) =>
                        updateField('training_location', e.target.value)
                      }
                      placeholder="المدينة أو المكان"
                    />
                  </Field>
                )}
              </div>
            </div>

            {/* Section 4: Provider & Budget */}
            <div className="border border-gray-200 rounded-xl shadow-sm">
              <SectionHead icon="💰" title="المزود والميزانية" />
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 bg-white rounded-b-xl">
                <Field label="مزود التدريب">
                  <select
                    className={selectCls}
                    value={formData.provider_id}
                    onChange={(e) => updateField('provider_id', e.target.value)}
                  >
                    <option value="">اختر المزود</option>
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name_ar}
                      </option>
                    ))}
                    <option value="custom">أخرى (حدد في الحقل التالي)</option>
                  </select>
                </Field>

                {formData.provider_id === 'custom' && (
                  <Field label="اسم المزود (أخرى)">
                    <input
                      className={inputCls}
                      value={formData.custom_provider_name}
                      onChange={(e) =>
                        updateField('custom_provider_name', e.target.value)
                      }
                      placeholder="اسم مزود التدريب"
                    />
                  </Field>
                )}

                <Field
                  label="التكلفة التقديرية (ريال)"
                  error={errors.estimated_cost}
                >
                  <input
                    type="number"
                    step="0.01"
                    className={
                      errors.estimated_cost ? errorInputCls : inputCls
                    }
                    value={formData.estimated_cost || ''}
                    onChange={(e) =>
                      updateField('estimated_cost', parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </Field>

                <Field label="رمز الميزانية">
                  <input
                    className={inputCls}
                    value={formData.budget_code}
                    onChange={(e) => updateField('budget_code', e.target.value)}
                    placeholder="مثال: BDG-2026-001"
                  />
                </Field>

                <Field label="مركز التكلفة">
                  <input
                    className={inputCls}
                    value={formData.cost_center}
                    onChange={(e) =>
                      updateField('cost_center', e.target.value)
                    }
                    placeholder="مثال: IT-DEPT"
                  />
                </Field>

                <Field
                  label="عدد المشاركين"
                  error={errors.number_of_participants}
                >
                  <input
                    type="number"
                    min="1"
                    className={
                      errors.number_of_participants ? errorInputCls : inputCls
                    }
                    value={formData.number_of_participants}
                    onChange={(e) =>
                      updateField(
                        'number_of_participants',
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                </Field>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                disabled={formLoading}
                className="px-8 py-3 rounded-lg border-2 border-gray-400 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={formLoading}
                className="px-8 py-3 rounded-lg border-2 border-[#2D5A39] text-[#2D5A39] font-bold hover:bg-[#2D5A39]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {formLoading && <Loader2 size={16} className="animate-spin" />}
                حفظ كمسودة
              </button>
              <button
                onClick={handleSubmit}
                disabled={formLoading}
                className="px-8 py-3 rounded-lg bg-[#2D5A39] text-white font-bold hover:bg-[#1F4128] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {formLoading && <Loader2 size={16} className="animate-spin" />}
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
