# Supabase Setup Guide - T-WMS Database Schema

## 📋 Overview
This guide will help you set up the complete database schema for the Enterprise Training Workflow Management System (T-WMS) in Supabase.

## 🚀 Quick Start

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully initialized

### Step 2: Execute the Schema
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire content of `supabase_schema.sql`
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Wait for the execution to complete (should take 10-30 seconds)

### Step 3: Verify Installation
Run this query in SQL Editor to verify all tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 13 tables including:
- profiles
- training_requests
- approval_workflows
- organizational_units
- training_programs
- etc.

## 📊 Database Schema Overview

### Core Tables

#### 1. **profiles**
Extends Supabase `auth.users` with enterprise-specific fields:
- `role`: User role (employee, manager, unit_head, talent_dev, hr_admin)
- `manager_id`: Direct manager reference
- `organizational_unit_id`: Department/unit assignment
- Auto-created when user signs up via trigger

#### 2. **training_requests**
Main table for all training requests:
- Auto-generated `request_number` (format: TR26000001)
- Multi-field form data (justification, budget, timing, etc.)
- Workflow status tracking
- Current approver assignment

#### 3. **approval_workflows**
Tracks approval history:
- Links to training request
- Records approver, action (approved/rejected/returned), and comments
- Maintains approval level sequence

#### 4. **organizational_units**
Hierarchical organization structure:
- Supports parent-child relationships
- Links to unit head (profile)

#### 5. **training_programs**
Catalog of available training courses:
- Title, description, category
- Duration, cost, provider
- Can be internal or external

#### 6. **training_executions**
After approval, tracks actual training delivery:
- Actual dates, costs, participants
- Status: scheduled → in_progress → completed

#### 7. **training_attendance**
Individual employee attendance records:
- Attendance percentage
- Certificate issuance
- Completion status

#### 8. **training_evaluations**
Post-training feedback:
- 5-point scale ratings (content, trainer, materials, etc.)
- Text feedback
- Recommendation flag

## 🔐 Row Level Security (RLS) Policies

### Key Security Rules

#### Employees
- ✅ View their own requests
- ✅ Create new requests
- ✅ Edit draft requests only
- ❌ Cannot see other employees' requests

#### Managers
- ✅ View all requests from direct reports
- ✅ View requests assigned to them for approval
- ✅ Update status of assigned requests
- ❌ Cannot see requests outside their team

#### Unit Heads
- ✅ View all requests from their organizational unit
- ✅ Approve requests at unit level
- ❌ Cannot see requests from other units

#### Talent Development
- ✅ View all requests at talent_dev approval stage
- ✅ Manage training programs catalog
- ✅ Access training execution and evaluation data

#### HR Admins
- ✅ Full access to all data
- ✅ Manage user profiles and roles
- ✅ Configure system settings

## 🔄 Workflow Logic

### Approval Flow
1. **Draft** → Employee creates request
2. **pending_manager** → Submitted to direct manager
3. **pending_unit_head** → Approved by manager, sent to unit head
4. **pending_talent_dev** → Approved by unit head, sent to Talent Development
5. **approved** → Final approval from Talent Development
6. **rejected** → Can be rejected at any stage

### Auto-Generated Features
- **Request Numbers**: Auto-increment with year prefix (TR26000001)
- **User Profiles**: Created automatically on signup
- **Timestamps**: Auto-updated on modifications
- **Activity Logging**: All changes logged automatically

## 🔌 API Integration

### Supabase Client Setup (React)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Example Queries

#### Fetch User Profile
```javascript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

#### Create Training Request
```javascript
const { data, error } = await supabase
  .from('training_requests')
  .insert({
    requester_id: userId,
    custom_training_title: 'Advanced React Training',
    training_type: 'online',
    business_justification: 'Improve frontend skills',
    estimated_cost: 5000,
    priority: 'high',
    status: 'draft'
  })
```

#### Get Pending Approvals (for Managers)
```javascript
const { data: pendingRequests, error } = await supabase
  .from('training_requests')
  .select(`
    *,
    requester:profiles!requester_id(full_name, job_title)
  `)
  .eq('current_approver_id', currentUserId)
  .in('status', ['pending_manager', 'pending_unit_head', 'pending_talent_dev'])
```

#### Submit Approval Decision
```javascript
// Create approval record
const { data: approval, error: approvalError } = await supabase
  .from('approval_workflows')
  .insert({
    training_request_id: requestId,
    approver_id: approverId,
    approver_role: 'manager',
    approval_level: 1,
    action: 'approved',
    comments: 'Approved for team development'
  })

// Update request status
const { data: updated, error: updateError } = await supabase
  .from('training_requests')
  .update({
    status: 'pending_unit_head',
    current_approver_id: unitHeadId
  })
  .eq('id', requestId)
```

## 📈 Useful Helper Views

Two views are pre-created for convenience:

### 1. `my_pending_approvals`
Shows all requests waiting for your approval:
```sql
SELECT * FROM my_pending_approvals;
```

### 2. `my_training_requests`
Shows all your submitted requests with current status:
```sql
SELECT * FROM my_training_requests;
```

## 🛠 Environment Variables

Add these to your React `.env` file:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from:
Supabase Dashboard → Settings → API

## 🎨 Integration with Your React App

### 1. Install Supabase Client
```bash
pnpm add @supabase/supabase-js
```

### 2. Create Supabase Config File
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 3. Replace Mock Data
In your components, replace hardcoded data with Supabase queries.

Example - Replace mock categories:
```typescript
// Before (mock data)
const categories = ['Leadership', 'Technical', 'Communication']

// After (Supabase)
const [categories, setCategories] = useState([])

useEffect(() => {
  const fetchCategories = async () => {
    const { data } = await supabase
      .from('training_categories')
      .select('id, name, name_ar')
      .eq('is_active', true)
    setCategories(data || [])
  }
  fetchCategories()
}, [])
```

## 🔧 Customization

### Adding Custom Fields
To add fields to training_requests:
```sql
ALTER TABLE training_requests 
ADD COLUMN your_new_field TEXT;
```

### Modifying Enums
To add new training types:
```sql
ALTER TYPE training_type ADD VALUE 'your_new_type';
```

### Custom Functions
Create helper functions for complex operations:
```sql
CREATE OR REPLACE FUNCTION assign_next_approver(request_id UUID)
RETURNS UUID AS $$
-- Your custom logic here
$$ LANGUAGE plpgsql;
```

## 📞 Support & Troubleshooting

### Common Issues

**Issue: RLS policies blocking queries**
- Check user authentication status
- Verify user role in profiles table
- Review policy conditions in SQL Editor

**Issue: Foreign key violations**
- Ensure referenced records exist before insert
- Check organizational_unit_id and manager_id references

**Issue: Trigger not firing**
- Verify trigger is enabled: `ALTER TABLE table_name ENABLE TRIGGER trigger_name`
- Check function permissions (SECURITY DEFINER)

## 🎯 Next Steps

1. ✅ Execute schema in Supabase
2. 🔑 Get API keys and add to `.env`
3. 📦 Install Supabase client in React app
4. 🔄 Replace mock data with real Supabase queries
5. 🧪 Test with sample data
6. 🚀 Deploy to production

## 📝 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase React Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

**Schema Version**: 1.0  
**Last Updated**: May 2026  
**Compatible with**: Supabase PostgreSQL 15+
