# 🗺️ Field Mapping Guide - UI to Database

## Training Request Form Field Mapping

This document provides a complete mapping between the UI form fields and the Supabase database columns.

---

## 📋 Complete Field Mapping Table

| UI Field Name (English) | UI Field Name (العربية) | Database Column | Data Type | Required | Auto-Populated | Notes |
|------------------------|------------------------|-----------------|-----------|----------|----------------|-------|
| **AUTOMATICALLY CAPTURED** |
| Employee ID | معرف الموظف | `requester_id` | UUID | ✅ | ✅ | Captured from `auth.uid()` |
| Employee Name | اسم الموظف | via `profiles.full_name` | TEXT | ✅ | ✅ | Fetched from profiles table |
| Department | القسم | via `profiles.department` | TEXT | - | ✅ | Fetched from profiles table |
| Manager ID | معرف المدير | `current_approver_id` | UUID | - | ✅ | Auto-assigned from profiles.manager_id |
| Request Number | رقم الطلب | `request_number` | TEXT | ✅ | ✅ | Auto-generated (TR26000001) |
| Submission Date | تاريخ الإرسال | `submitted_at` | TIMESTAMPTZ | - | ✅ | Set when status changes to pending |
| **BASIC INFORMATION** |
| Training Title | عنوان التدريب | `custom_training_title` | TEXT | ✅ | - | Main training title |
| Training Type | نوع التدريب | `training_type` | ENUM | ✅ | - | external, internal, online, workshop, certification |
| Category | التصنيف | `category_id` | UUID | ✅ | - | FK to training_categories |
| Priority | الأولوية | `priority` | ENUM | ✅ | - | low, medium, high, urgent |
| Is Urgent? | هل الطلب عاجل؟ | `is_urgent` | BOOLEAN | - | - | Default: false |
| Urgency Reason | سبب الاستعجال | `urgency_reason` | TEXT | Conditional | - | Required if is_urgent = true |
| **JUSTIFICATION** |
| Business Need | المبرر التجاري | `business_justification` | TEXT | ✅ | - | Min 20 characters |
| Expected Outcomes | النتائج المتوقعة | `expected_outcomes` | TEXT | - | - | Optional description |
| Skill Gap Analysis | تحليل الفجوة | `skill_gap_analysis` | TEXT | - | - | Optional analysis |
| **SCHEDULE** |
| Preferred Start Date | تاريخ البدء المفضل | `preferred_start_date` | DATE | ✅ | - | ISO date format |
| Preferred End Date | تاريخ الانتهاء المفضل | `preferred_end_date` | DATE | - | - | Must be after start date |
| **LOCATION** |
| Is Online? | هل التدريب أونلاين؟ | `is_online` | BOOLEAN | - | - | Default: false |
| Training Location | موقع التدريب | `training_location` | TEXT | - | - | Required if is_online = false |
| **PROVIDER** |
| Provider | مزود التدريب | `provider_id` | UUID | - | - | FK to training_providers |
| Custom Provider Name | اسم المزود (أخرى) | `custom_provider_name` | TEXT | - | - | If provider not in list |
| Provider Contact | جهة اتصال المزود | `provider_contact` | TEXT | - | - | Optional contact info |
| **BUDGET** |
| Estimated Cost (SAR) | التكلفة التقديرية | `estimated_cost` | DECIMAL(10,2) | - | - | In SAR currency |
| Budget Code | رمز الميزانية | `budget_code` | TEXT | - | - | Optional budget reference |
| Cost Center | مركز التكلفة | `cost_center` | TEXT | - | - | Optional cost allocation |
| **PARTICIPANTS** |
| Number of Participants | عدد المشاركين | `number_of_participants` | INTEGER | ✅ | - | Min: 1, Default: 1 |
| Participant Names | أسماء المشاركين | `participant_names` | TEXT[] | - | - | Array of names |
| **WORKFLOW** |
| Status | الحالة | `status` | ENUM | ✅ | ✅ | draft, pending_manager, etc. |
| Current Approval Level | مستوى الموافقة الحالي | `current_approval_level` | INTEGER | - | ✅ | Starts at 0 for draft |
| **METADATA** |
| Created At | تاريخ الإنشاء | `created_at` | TIMESTAMPTZ | ✅ | ✅ | Auto timestamp |
| Updated At | تاريخ التحديث | `updated_at` | TIMESTAMPTZ | ✅ | ✅ | Auto updated |
| Attachments | المرفقات | `attachments` | JSONB | - | - | Array of file objects |

---

## 🔄 Workflow Status Flow

```
draft (المسودة)
  ↓ (Submit)
pending_manager (بانتظار المدير)
  ↓ (Manager Approves)
pending_unit_head (بانتظار رئيس الوحدة)
  ↓ (Unit Head Approves)
pending_talent_dev (بانتظار تطوير المواهب)
  ↓ (Talent Dev Approves)
approved (معتمد)

  ↓ (Any level can reject)
rejected (مرفوض)
```

---

## 📝 Code Examples

### 1. Getting Current User ID (Auto-Captured)

```typescript
// This happens automatically in useTrainingRequestForm hook
const { data: { user }, error } = await supabase.auth.getUser()

// User ID is automatically added to requester_id field
const requestData = {
  requester_id: user.id,  // ← Auto-populated from authenticated session
  // ... other fields
}
```

### 2. Inserting a Training Request

```typescript
// All fields properly mapped
const { data, error } = await supabase
  .from('training_requests')
  .insert({
    // Auto-captured fields
    requester_id: user.id,                    // From auth session
    
    // Basic information
    custom_training_title: 'React Advanced Training',
    training_type: 'online',
    category_id: 'uuid-of-category',
    priority: 'high',
    is_urgent: true,
    urgency_reason: 'Project deadline approaching',
    
    // Justification
    business_justification: 'Need to improve frontend skills...',
    expected_outcomes: 'Better code quality and performance',
    skill_gap_analysis: 'Team lacks modern React patterns',
    
    // Schedule
    preferred_start_date: '2026-06-15',
    preferred_end_date: '2026-06-20',
    
    // Location
    is_online: true,
    training_location: null,
    
    // Provider
    provider_id: 'uuid-of-provider',
    custom_provider_name: null,
    provider_contact: null,
    
    // Budget
    estimated_cost: 8000.00,
    budget_code: 'BDG-2026-001',
    cost_center: 'IT-DEPT',
    
    // Participants
    number_of_participants: 3,
    participant_names: ['Ahmed', 'Sara', 'Mohammed'],
    
    // Workflow (for draft)
    status: 'draft',
    current_approval_level: 0,
    current_approver_id: null,
    submitted_at: null,
    
    // Metadata
    attachments: []
  })
```

### 3. Submitting Request (Moving from Draft to Pending)

```typescript
// Get user's manager from profile
const { data: profile } = await supabase
  .from('profiles')
  .select('manager_id')
  .eq('id', user.id)
  .single()

// Update status and assign to manager
const { data, error } = await supabase
  .from('training_requests')
  .update({
    status: 'pending_manager',              // Change status
    current_approver_id: profile.manager_id, // Assign to manager
    current_approval_level: 1,               // First approval level
    submitted_at: new Date().toISOString()   // Record submission time
  })
  .eq('id', requestId)
```

---

## 🛠 Implementation Files

### Created Files for Database Integration

1. **`src/hooks/useSupabaseAuth.ts`**
   - Manages authentication state
   - Auto-captures `user.id` for `requester_id`
   - Fetches user profile data

2. **`src/hooks/useTrainingRequestForm.ts`**
   - Handles all form state
   - Validates required fields
   - Maps UI fields to database columns
   - `saveDraft()` - Saves with status='draft'
   - `submitRequest()` - Saves and sends to manager

3. **`src/app/components/TrainingNeedAssessmentSupabase.tsx`**
   - Complete UI form with Supabase integration
   - Real-time error display
   - Success/error feedback
   - Loading states

---

## 🎯 Key Features Implemented

### ✅ Automatic User Capture
```typescript
// User ID captured automatically from auth session
const { data: { user } } = await supabase.auth.getUser()
requester_id: user.id  // ← No manual input needed
```

### ✅ Manager Auto-Assignment
```typescript
// Manager automatically found from user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('manager_id')
  .eq('id', user.id)
  .single()

current_approver_id: profile.manager_id  // ← Auto-assigned
```

### ✅ Request Number Auto-Generation
```sql
-- Trigger automatically generates: TR26000001, TR26000002, etc.
CREATE TRIGGER generate_training_request_number
  BEFORE INSERT ON training_requests
  FOR EACH ROW EXECUTE FUNCTION generate_request_number();
```

### ✅ Error Handling
```typescript
try {
  const { data, error } = await supabase
    .from('training_requests')
    .insert(requestData)
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Success!
} catch (err) {
  setSubmitError(err.message)  // Display error to user
}
```

### ✅ Validation
```typescript
// Validate before submission
if (!formData.custom_training_title.trim()) {
  errors.custom_training_title = 'عنوان التدريب مطلوب'
}

if (formData.business_justification.length < 20) {
  errors.business_justification = 'المبرر يجب أن يكون 20 حرف على الأقل'
}
```

---

## 🔍 Field Details & Validation Rules

### Required Fields (Cannot Submit Without)

1. **custom_training_title** - Training title (min 1 char)
2. **category_id** - Must select a category
3. **business_justification** - Min 20 characters
4. **preferred_start_date** - Must select a date
5. **requester_id** - Auto-captured from session

### Conditional Requirements

- **urgency_reason** - Required if `is_urgent = true`
- **training_location** - Required if `is_online = false`

### Auto-Calculated Fields

- **request_number** - Format: TR{YY}{6-digit-number}
- **current_approver_id** - From user's manager_id
- **submitted_at** - Current timestamp when submitted
- **created_at** / **updated_at** - Database triggers

### Data Type Constraints

- **estimated_cost** - Must be >= 0
- **number_of_participants** - Must be >= 1
- **preferred_end_date** - Must be >= preferred_start_date
- **training_type** - Must be one of: external, internal, online, workshop, certification
- **priority** - Must be one of: low, medium, high, urgent
- **status** - Must be valid status enum value

---

## 🧪 Testing the Integration

### Test Scenario 1: Save Draft
```typescript
// User fills partial form and clicks "Save as Draft"
const result = await saveDraft()

// Expected result:
{
  success: true,
  data: {
    id: 'uuid',
    request_number: 'TR26000001',
    requester_id: 'user-uuid',  // ← Auto-captured
    status: 'draft',
    custom_training_title: 'React Training',
    // ... other fields
  }
}
```

### Test Scenario 2: Submit Request
```typescript
// User fills complete form and clicks "Submit"
const result = await submitRequest()

// Expected result:
{
  success: true,
  data: {
    id: 'uuid',
    request_number: 'TR26000002',
    requester_id: 'user-uuid',        // ← Auto-captured
    current_approver_id: 'manager-uuid', // ← Auto-assigned
    status: 'pending_manager',
    submitted_at: '2026-05-12T10:30:00Z',
    // ... other fields
  }
}

// Notification created for manager automatically
```

### Test Scenario 3: Validation Error
```typescript
// User tries to submit with missing required fields
const result = await submitRequest()

// Expected result:
{
  success: false,
  error: 'يرجى تصحيح الأخطاء في النموذج'
}

// Error messages shown on form:
errors = {
  custom_training_title: 'عنوان التدريب مطلوب',
  business_justification: 'المبرر التجاري مطلوب'
}
```

---

## 📊 Database Query Examples

### Get User's Training Requests
```typescript
const { data } = await supabase
  .from('training_requests')
  .select('*')
  .eq('requester_id', user.id)  // ← Filtered by captured user ID
  .order('created_at', { ascending: false })
```

### Get Pending Approvals for Manager
```typescript
const { data } = await supabase
  .from('training_requests')
  .select(`
    *,
    requester:profiles!requester_id(full_name, department)
  `)
  .eq('current_approver_id', user.id)  // ← User is the approver
  .eq('status', 'pending_manager')
```

---

## 🔐 Security - RLS Policies

### Employee Can Only See Their Own Requests
```sql
CREATE POLICY "Employees can view own requests"
  ON training_requests FOR SELECT
  USING (requester_id = auth.uid());  -- ← Matches auto-captured user ID
```

### Manager Can See Team Requests
```sql
CREATE POLICY "Managers can view team requests"
  ON training_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = training_requests.requester_id
      AND profiles.manager_id = auth.uid()
    )
  );
```

---

## 🎉 Summary

### What's Implemented

✅ **Automatic user_id capture** from auth session  
✅ **Complete field mapping** from UI to database  
✅ **Validation** with error messages  
✅ **Error handling** with user-friendly feedback  
✅ **Auto-assignment** of manager from profile  
✅ **Auto-generation** of request numbers  
✅ **Save draft** functionality  
✅ **Submit request** with workflow transition  
✅ **Notification** creation for approvers  
✅ **Loading states** during operations  
✅ **Success feedback** after submission  

### Files to Use

- Replace `TrainingNeedAssessment.tsx` with `TrainingNeedAssessmentSupabase.tsx`
- Import and use the hooks: `useSupabaseAuth` and `useTrainingRequestForm`
- Ensure `.env` has Supabase credentials

---

**Ready to persist data! 🚀**
