# Supabase Integration Examples

## 🎯 Complete Integration Guide for React Components

This document shows how to integrate the Supabase backend with your existing React components in the T-WMS application.

---

## 📦 Prerequisites

### 1. Install Dependencies
```bash
pnpm add @supabase/supabase-js
```

### 2. Environment Variables
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. File Structure
```
src/
├── lib/
│   └── supabase.ts              # ✅ Already created
├── types/
│   └── database.types.ts        # ✅ Already created
├── services/
│   └── trainingRequestService.ts # ✅ Already created
└── app/
    ├── components/
    │   ├── Login.tsx
    │   ├── EmployeeDashboard.tsx
    │   └── TrainingNeedAssessment.tsx
    └── App.tsx
```

---

## 🔐 Example 1: Login Component Integration

Update your existing `Login.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { user, session } = await signIn(email, password)
      
      // Redirect based on user role (stored in profiles table)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect based on role
      switch (profile?.role) {
        case 'employee':
          navigate('/employee-dashboard')
          break
        case 'manager':
          navigate('/manager-dashboard')
          break
        case 'unit_head':
          navigate('/unit-head-dashboard')
          break
        case 'talent_dev':
          navigate('/talent-dev-dashboard')
          break
        case 'hr_admin':
          navigate('/hr-admin-dashboard')
          break
        default:
          navigate('/employee-dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right Side - Form */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8">
          <h1 className="text-3xl font-bold text-[#2D5A39] mb-2">
            مرحباً بك في نظام إدارة التدريب
          </h1>
          <p className="text-gray-600 mb-8">
            سجل دخولك للوصول إلى لوحة التحكم
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39] focus:border-transparent"
                placeholder="example@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D5A39] text-white py-3 rounded-lg hover:bg-[#234528] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </div>
      </div>

      {/* Left Side - Image */}
      <div className="w-1/2">
        <img
          src="/login-image.png"
          alt="Training Management"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
```

---

## 📊 Example 2: Employee Dashboard with Real Data

Update `EmployeeDashboard.tsx`:

```tsx
import { useState, useEffect } from 'react'
import { supabase, getCurrentProfile } from '../../lib/supabase'
import { getMyTrainingRequests, getDashboardStats } from '../../services/trainingRequestService'
import type { Profile, TrainingRequest, DashboardStats } from '../../types/database.types'

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [requests, setRequests] = useState<TrainingRequest[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load user profile
      const userProfile = await getCurrentProfile()
      setProfile(userProfile)

      // Load training requests
      const myRequests = await getMyTrainingRequests()
      setRequests(myRequests)

      // Load statistics
      const dashboardStats = await getDashboardStats()
      setStats(dashboardStats)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D5A39] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2D5A39]">
              مرحباً، {profile?.full_name}
            </h1>
            <p className="text-sm text-gray-600">{profile?.job_title}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-[#2D5A39]"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">إجمالي الطلبات</h3>
            <p className="text-3xl font-bold text-[#2D5A39]">
              {stats?.total_requests || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">طلبات قيد المراجعة</h3>
            <p className="text-3xl font-bold text-orange-500">
              {stats?.pending_requests || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm text-gray-600 mb-2">طلبات معتمدة</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats?.approved_requests || 0}
            </p>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              طلباتي التدريبية
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    عنوان التدريب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    الأولوية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">
                    تاريخ الإنشاء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.request_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.custom_training_title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getPriorityLabel(request.priority)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper functions
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    pending_manager: 'بانتظار المدير',
    pending_unit_head: 'بانتظار رئيس الوحدة',
    pending_talent_dev: 'بانتظار تطوير المواهب',
    approved: 'معتمد',
    rejected: 'مرفوض',
    cancelled: 'ملغى',
  }
  return labels[status] || status
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    urgent: 'عاجل',
  }
  return labels[priority] || priority
}
```

---

## 📝 Example 3: Training Request Form with Supabase

Update `TrainingNeedAssessment.tsx` to save to Supabase:

```tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { createTrainingRequest, submitTrainingRequest } from '../../services/trainingRequestService'
import type { TrainingCategory, TrainingType, PriorityLevel } from '../../types/database.types'

export default function TrainingNeedAssessmentForm({ onClose }: { onClose: () => void }) {
  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    training_type: 'external' as TrainingType,
    custom_training_title: '',
    category_id: '',
    business_justification: '',
    expected_outcomes: '',
    skill_gap_analysis: '',
    priority: 'medium' as PriorityLevel,
    is_urgent: false,
    urgency_reason: '',
    preferred_start_date: '',
    preferred_end_date: '',
    estimated_cost: 0,
    number_of_participants: 1,
    training_location: '',
    is_online: false,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('training_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    setCategories(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create the request
      const newRequest = await createTrainingRequest(formData)

      // Submit it (moves to pending_manager status)
      await submitTrainingRequest(newRequest.id)

      alert('تم إرسال طلب التدريب بنجاح!')
      onClose()
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)

    try {
      await createTrainingRequest(formData)
      alert('تم حفظ المسودة بنجاح!')
      onClose()
    } catch (error: any) {
      alert('حدث خطأ: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#2D5A39]">
            نموذج تقييم الاحتياجات التدريبية
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Training Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان التدريب المطلوب *
            </label>
            <input
              type="text"
              required
              value={formData.custom_training_title}
              onChange={(e) =>
                setFormData({ ...formData, custom_training_title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التصنيف *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39]"
            >
              <option value="">اختر التصنيف</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Business Justification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المبرر التجاري للتدريب *
            </label>
            <textarea
              required
              value={formData.business_justification}
              onChange={(e) =>
                setFormData({ ...formData, business_justification: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39]"
            />
          </div>

          {/* Expected Outcomes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              النتائج المتوقعة
            </label>
            <textarea
              value={formData.expected_outcomes}
              onChange={(e) =>
                setFormData({ ...formData, expected_outcomes: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39]"
            />
          </div>

          {/* Estimated Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التكلفة التقديرية (ريال)
            </label>
            <input
              type="number"
              value={formData.estimated_cost}
              onChange={(e) =>
                setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2D5A39]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#2D5A39] text-white py-3 rounded-lg hover:bg-[#234528] disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-6 py-3 border border-[#2D5A39] text-[#2D5A39] rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              حفظ كمسودة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

---

## 🔔 Example 4: Real-time Notifications

Add real-time notification listener:

```tsx
import { useEffect, useState } from 'react'
import { supabase, subscribeToTable } from '../../lib/supabase'
import type { Notification } from '../../types/database.types'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()

    // Subscribe to real-time updates
    const channel = subscribeToTable(
      'notifications',
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications((prev) => [payload.new as Notification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      },
      `user_id=eq.${userId}` // Replace with actual user ID
    )

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    setNotifications(data || [])
    setUnreadCount(data?.filter((n) => !n.is_read).length || 0)
  }

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)

    loadNotifications()
  }

  return (
    <div className="relative">
      <button className="relative p-2">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification dropdown - implement as needed */}
    </div>
  )
}
```

---

## 🎨 Best Practices

### 1. Error Handling
```tsx
try {
  const data = await someSupabaseFunction()
} catch (error: any) {
  console.error('Error:', error)
  
  // Show user-friendly message
  if (error.code === 'PGRST116') {
    alert('لم يتم العثور على البيانات')
  } else if (error.code === '23505') {
    alert('البيانات موجودة مسبقاً')
  } else {
    alert('حدث خطأ غير متوقع')
  }
}
```

### 2. Loading States
Always show loading states during async operations.

### 3. Optimistic Updates
Update UI immediately, then sync with database.

### 4. Real-time Subscriptions
Clean up subscriptions in useEffect cleanup function.

---

## 🔒 Security Checklist

- ✅ RLS policies are enabled on all tables
- ✅ API keys are in `.env` (not committed to git)
- ✅ User can only access their own data
- ✅ Approvers can only approve assigned requests
- ✅ All mutations require authentication

---

## 🚀 Next Steps

1. ✅ Execute `supabase_schema.sql` in Supabase
2. 🔑 Add Supabase credentials to `.env`
3. 📦 Install `@supabase/supabase-js`
4. 🔄 Update components with examples above
5. 🧪 Test each feature
6. 📊 Add loading and error states
7. 🎨 Maintain the `#2D5A39` color theme

---

**Questions?** Check the [Supabase Documentation](https://supabase.com/docs) or the SUPABASE_SETUP_GUIDE.md file.
