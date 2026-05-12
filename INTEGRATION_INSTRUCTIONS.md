# 🚀 Integration Instructions - Connect UI to Supabase

## Step-by-Step Guide to Connect Your Training Request Form to Database

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [x] Executed `supabase_schema.sql` in Supabase SQL Editor
- [x] Created `.env` file with Supabase credentials
- [x] Installed `@supabase/supabase-js` package
- [x] Created at least one test user in Supabase Auth

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
pnpm add @supabase/supabase-js lucide-react
```

### Step 2: Create Environment Variables

Create `.env` in project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these from: **Supabase Dashboard → Settings → API**

### Step 3: Update Your Component

In `src/app/App.tsx` or wherever you import the form:

```diff
- import { TrainingNeedAssessment } from './components/TrainingNeedAssessment'
+ import { TrainingNeedAssessmentSupabase } from './components/TrainingNeedAssessmentSupabase'

  // In your component:
- <TrainingNeedAssessment onBack={handleBack} />
+ <TrainingNeedAssessmentSupabase onBack={handleBack} />
```

**That's it! Your form is now connected to Supabase. 🎉**

---

## 🧪 Testing the Integration

### Test 1: Authentication Check

Open browser console and run:

```typescript
import { supabase } from './lib/supabase'

// Check current user
const { data: { user } } = await supabase.auth.getUser()
console.log('Current User:', user)

// Should show: { id: 'uuid', email: 'user@example.com', ... }
```

### Test 2: Create Test User (if needed)

```typescript
// In Supabase Dashboard → Authentication → Users → Add User
// OR via code:

const { data, error } = await supabase.auth.signUp({
  email: 'test.employee@company.com',
  password: 'SecurePassword123!',
  options: {
    data: {
      full_name: 'Test Employee',
      role: 'employee'
    }
  }
})
```

After signup, a profile will be auto-created via the database trigger.

### Test 3: Complete Form Submission

1. **Login as employee**
2. **Click "New Training Request" button**
3. **Fill the form:**
   - Training Title: "React Advanced Training"
   - Category: Select any
   - Business Justification: Write at least 20 characters
   - Start Date: Select a future date
4. **Click "Submit Request"**
5. **Check database:**

```sql
-- In Supabase SQL Editor
SELECT 
  request_number,
  requester_id,
  custom_training_title,
  status,
  current_approver_id,
  created_at
FROM training_requests
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
```
request_number | requester_id | custom_training_title    | status          | current_approver_id | created_at
TR26000001     | user-uuid    | React Advanced Training  | pending_manager | manager-uuid        | 2026-05-12...
```

---

## 📊 How It Works (Behind the Scenes)

### When User Fills the Form

```
User fills form → State managed by useTrainingRequestForm hook
                ↓
              formData = {
                custom_training_title: 'React Training',
                training_type: 'online',
                category_id: 'uuid',
                business_justification: '...',
                // ... etc
              }
```

### When User Clicks "Submit Request"

```
1. submitRequest() called
   ↓
2. Validate all required fields
   ↓
3. Get current user from auth.uid()
   requester_id = user.id  ← Auto-captured
   ↓
4. Get user's manager from profiles
   manager_id = profile.manager_id
   ↓
5. Prepare database insert:
   {
     requester_id: user.id,           ← Auto
     current_approver_id: manager_id, ← Auto
     status: 'pending_manager',       ← Auto
     submitted_at: NOW(),             ← Auto
     request_number: (auto-generated), ← Auto
     custom_training_title: formData.custom_training_title,
     // ... all other fields
   }
   ↓
6. Insert into training_requests table
   ↓
7. Create notification for manager
   ↓
8. Show success message to user
```

### Database Automatically Handles

✅ `request_number` generation (TR26000001)  
✅ `created_at` timestamp  
✅ `updated_at` timestamp  
✅ RLS policy enforcement  
✅ Foreign key validation  

---

## 🔧 Common Issues & Solutions

### Issue 1: "Missing VITE_SUPABASE_URL"

**Error:**
```
Missing VITE_SUPABASE_URL environment variable
```

**Solution:**
1. Create `.env` file in project root
2. Add your Supabase URL and key
3. Restart development server: `pnpm dev`

**Important:** Environment variables must start with `VITE_` in Vite projects!

---

### Issue 2: "Not authenticated"

**Error in console:**
```
لم يتم العثور على المستخدم. يرجى تسجيل الدخول مرة أخرى.
```

**Solution:**
1. Ensure user is logged in via Login component
2. Check auth state:
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```
3. If no session, user needs to login again

---

### Issue 3: "No manager assigned"

**Error:**
```
لم يتم تعيين مدير لك. يرجى الاتصال بقسم الموارد البشرية.
```

**Solution:**
Update user profile with manager_id:

```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET manager_id = 'manager-user-uuid'
WHERE id = 'employee-user-uuid';
```

Or use seed data which already has manager relationships.

---

### Issue 4: RLS Policy Blocking Insert

**Error:**
```
new row violates row-level security policy
```

**Solution:**
1. Verify user is authenticated
2. Check RLS policies are correct:
```sql
-- Should exist:
CREATE POLICY "Employees can create own requests"
  ON training_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());
```
3. Ensure `requester_id` matches `auth.uid()`

---

### Issue 5: Foreign Key Violation

**Error:**
```
insert or update on table "training_requests" violates foreign key constraint
```

**Solution:**
- **category_id:** Must exist in `training_categories` table
- **provider_id:** Must exist in `training_providers` table
- Check available IDs:
```sql
SELECT id, name_ar FROM training_categories WHERE is_active = true;
SELECT id, name_ar FROM training_providers WHERE is_approved = true;
```

---

## 🎨 Customization Guide

### Add New Field to Form

**1. Add to Database (if needed):**
```sql
ALTER TABLE training_requests 
ADD COLUMN your_new_field TEXT;
```

**2. Add to TypeScript types:**
```typescript
// In src/types/database.types.ts
export interface TrainingRequest {
  // ... existing fields
  your_new_field?: string
}
```

**3. Add to form hook:**
```typescript
// In src/hooks/useTrainingRequestForm.ts
const initialFormData = {
  // ... existing fields
  your_new_field: '',
}
```

**4. Add to UI component:**
```tsx
// In TrainingNeedAssessmentSupabase.tsx
<Field label="Your Field Label">
  <input
    className={inputCls}
    value={formData.your_new_field}
    onChange={(e) => updateField('your_new_field', e.target.value)}
  />
</Field>
```

---

## 📈 Monitoring & Debugging

### Enable SQL Logging

```typescript
// In src/lib/supabase.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 't-wms',
    },
  },
  // Add this for debugging:
  auth: {
    debug: true,
  },
})
```

### View All Requests in Console

```typescript
// Add this to your component for debugging
useEffect(() => {
  const checkData = async () => {
    const { data, error } = await supabase
      .from('training_requests')
      .select('*')
    
    console.log('All Requests:', data)
    console.log('Error:', error)
  }
  
  checkData()
}, [])
```

### Real-time Subscription (Optional)

```typescript
// Listen for new requests
useEffect(() => {
  const channel = supabase
    .channel('training-requests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'training_requests',
      },
      (payload) => {
        console.log('New request created:', payload.new)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] RLS policies enabled on all tables
- [ ] API keys stored in environment variables (not in code)
- [ ] `.env` file added to `.gitignore`
- [ ] Service role key never used in frontend
- [ ] Input validation on both frontend and database
- [ ] SQL injection prevented by parameterized queries
- [ ] XSS protection via React's built-in escaping
- [ ] HTTPS enforced (Supabase does this automatically)

---

## 📚 Additional Resources

### Files Created
- ✅ `src/lib/supabase.ts` - Supabase client configuration
- ✅ `src/types/database.types.ts` - TypeScript type definitions
- ✅ `src/hooks/useSupabaseAuth.ts` - Authentication hook
- ✅ `src/hooks/useTrainingRequestForm.ts` - Form state & submission
- ✅ `src/app/components/TrainingNeedAssessmentSupabase.tsx` - UI component
- ✅ `supabase_schema.sql` - Complete database schema
- ✅ `supabase_seed_data.sql` - Test data
- ✅ `FIELD_MAPPING_GUIDE.md` - Field mapping documentation

### Documentation
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [React Integration](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

## ✅ Final Checklist

Before going live:

1. **Database**
   - [x] Schema executed
   - [x] RLS policies working
   - [x] Test users created
   - [x] Manager relationships set up

2. **Environment**
   - [x] `.env` file created
   - [x] Supabase URL added
   - [x] Anon key added
   - [x] `.env` in `.gitignore`

3. **Code**
   - [x] New component imported
   - [x] Hooks working
   - [x] Form validates correctly
   - [x] Error handling works

4. **Testing**
   - [x] Can create draft
   - [x] Can submit request
   - [x] Manager gets notification
   - [x] Status changes correctly
   - [x] Request number generated

---

## 🎉 You're All Set!

Your training request form is now fully integrated with Supabase:

✅ **User ID automatically captured** from auth session  
✅ **Data persisted** in PostgreSQL database  
✅ **Validation** prevents invalid submissions  
✅ **Error handling** shows friendly messages  
✅ **Manager auto-assigned** from user profile  
✅ **Workflow starts** automatically on submission  
✅ **Notifications sent** to approvers  

**Next Steps:**
- Test the complete workflow (employee → manager → unit head → talent dev)
- Implement the approval screens for managers
- Add dashboard statistics
- Enable file uploads for attachments

---

**Need Help?** Check:
- `FIELD_MAPPING_GUIDE.md` for field details
- `SUPABASE_SETUP_GUIDE.md` for database setup
- `SUPABASE_INTEGRATION_EXAMPLE.md` for code examples
