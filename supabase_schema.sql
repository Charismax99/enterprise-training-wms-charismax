-- ============================================
-- Enterprise Training Workflow Management System (T-WMS)
-- Supabase Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
  'employee',
  'manager',
  'unit_head',
  'talent_dev',
  'hr_admin'
);

-- Training request status
CREATE TYPE request_status AS ENUM (
  'draft',
  'pending_manager',
  'pending_unit_head',
  'pending_talent_dev',
  'approved',
  'rejected',
  'cancelled'
);

-- Training type
CREATE TYPE training_type AS ENUM (
  'internal',
  'external',
  'online',
  'workshop',
  'certification'
);

-- Priority level
CREATE TYPE priority_level AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Approval action
CREATE TYPE approval_action AS ENUM (
  'approved',
  'rejected',
  'returned'
);

-- ============================================
-- TABLES
-- ============================================

-- Organizational Units
CREATE TABLE organizational_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  parent_unit_id UUID REFERENCES organizational_units(id),
  unit_head_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  employee_id TEXT UNIQUE,
  job_title TEXT,
  department TEXT,
  organizational_unit_id UUID REFERENCES organizational_units(id),
  manager_id UUID REFERENCES profiles(id),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Categories
CREATE TABLE training_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Providers
CREATE TABLE training_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  is_approved BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Programs/Courses
CREATE TABLE training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES training_categories(id),
  provider_id UUID REFERENCES training_providers(id),
  training_type training_type NOT NULL,
  duration_hours INTEGER,
  duration_days INTEGER,
  cost_estimate DECIMAL(10,2),
  currency TEXT DEFAULT 'SAR',
  max_participants INTEGER,
  prerequisites TEXT,
  learning_objectives TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Requests (Main table)
CREATE TABLE training_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_number TEXT UNIQUE NOT NULL,
  requester_id UUID NOT NULL REFERENCES profiles(id),

  -- Request Details
  training_program_id UUID REFERENCES training_programs(id),
  custom_training_title TEXT,
  training_type training_type NOT NULL,
  category_id UUID REFERENCES training_categories(id),

  -- Justification
  business_justification TEXT NOT NULL,
  expected_outcomes TEXT,
  skill_gap_analysis TEXT,
  priority priority_level DEFAULT 'medium',

  -- Timing
  preferred_start_date DATE,
  preferred_end_date DATE,
  is_urgent BOOLEAN DEFAULT false,
  urgency_reason TEXT,

  -- Budget
  estimated_cost DECIMAL(10,2),
  budget_code TEXT,
  cost_center TEXT,

  -- Participants
  number_of_participants INTEGER DEFAULT 1,
  participant_names TEXT[],

  -- Provider (for external training)
  provider_id UUID REFERENCES training_providers(id),
  custom_provider_name TEXT,
  provider_contact TEXT,

  -- Location
  training_location TEXT,
  is_online BOOLEAN DEFAULT false,

  -- Status & Workflow
  status request_status DEFAULT 'draft',
  current_approver_id UUID REFERENCES profiles(id),
  current_approval_level INTEGER DEFAULT 0,

  -- Metadata
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approval Workflow
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_request_id UUID NOT NULL REFERENCES training_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id),
  approver_role user_role NOT NULL,
  approval_level INTEGER NOT NULL,
  action approval_action,
  comments TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(training_request_id, approval_level)
);

-- Training Execution (After Approval)
CREATE TABLE training_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_request_id UUID NOT NULL REFERENCES training_requests(id),
  actual_start_date DATE NOT NULL,
  actual_end_date DATE NOT NULL,
  actual_cost DECIMAL(10,2),
  actual_participants INTEGER,
  trainer_name TEXT,
  training_materials JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Attendance
CREATE TABLE training_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES training_executions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),
  attended BOOLEAN DEFAULT false,
  attendance_percentage DECIMAL(5,2),
  completion_status TEXT, -- completed, incomplete, failed
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(execution_id, employee_id)
);

-- Training Evaluations
CREATE TABLE training_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  execution_id UUID NOT NULL REFERENCES training_executions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),

  -- Ratings (1-5 scale)
  content_rating INTEGER CHECK (content_rating >= 1 AND content_rating <= 5),
  trainer_rating INTEGER CHECK (trainer_rating >= 1 AND trainer_rating <= 5),
  materials_rating INTEGER CHECK (materials_rating >= 1 AND materials_rating <= 5),
  organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),

  -- Feedback
  strengths TEXT,
  improvements TEXT,
  would_recommend BOOLEAN,
  comments TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(execution_id, employee_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- info, warning, success, error
  related_request_id UUID REFERENCES training_requests(id),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- training_request, approval, etc.
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_manager ON profiles(manager_id);
CREATE INDEX idx_profiles_org_unit ON profiles(organizational_unit_id);

CREATE INDEX idx_training_requests_requester ON training_requests(requester_id);
CREATE INDEX idx_training_requests_status ON training_requests(status);
CREATE INDEX idx_training_requests_current_approver ON training_requests(current_approver_id);
CREATE INDEX idx_training_requests_submitted ON training_requests(submitted_at);

CREATE INDEX idx_approval_workflows_request ON approval_workflows(training_request_id);
CREATE INDEX idx_approval_workflows_approver ON approval_workflows(approver_id);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizational_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Managers can view their direct reports
CREATE POLICY "Managers can view direct reports"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.id = profiles.manager_id
    )
  );

-- HR Admins can view all profiles
CREATE POLICY "HR admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- HR Admins can manage all profiles
CREATE POLICY "HR admins can manage profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- ============================================
-- TRAINING REQUESTS POLICIES
-- ============================================

-- Employees can view their own requests
CREATE POLICY "Employees can view own requests"
  ON training_requests FOR SELECT
  USING (requester_id = auth.uid());

-- Employees can create their own requests
CREATE POLICY "Employees can create own requests"
  ON training_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Employees can update their own draft requests
CREATE POLICY "Employees can update own drafts"
  ON training_requests FOR UPDATE
  USING (requester_id = auth.uid() AND status = 'draft')
  WITH CHECK (requester_id = auth.uid() AND status = 'draft');

-- Managers can view requests from their direct reports
CREATE POLICY "Managers can view team requests"
  ON training_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = training_requests.requester_id
      AND profiles.manager_id = auth.uid()
    )
  );

-- Current approvers can view assigned requests
CREATE POLICY "Approvers can view assigned requests"
  ON training_requests FOR SELECT
  USING (current_approver_id = auth.uid());

-- Current approvers can update assigned requests
CREATE POLICY "Approvers can update assigned requests"
  ON training_requests FOR UPDATE
  USING (current_approver_id = auth.uid())
  WITH CHECK (current_approver_id = auth.uid());

-- Unit Heads can view requests from their unit
CREATE POLICY "Unit heads can view unit requests"
  ON training_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN organizational_units ou ON p.organizational_unit_id = ou.id
      WHERE p.id = training_requests.requester_id
      AND ou.unit_head_id = auth.uid()
    )
  );

-- Talent Development can view all pending requests
CREATE POLICY "Talent dev can view relevant requests"
  ON training_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'talent_dev'
      AND training_requests.status IN ('pending_talent_dev', 'approved')
    )
  );

-- HR Admins can view all requests
CREATE POLICY "HR admins can view all requests"
  ON training_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- HR Admins can manage all requests
CREATE POLICY "HR admins can manage all requests"
  ON training_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- ============================================
-- APPROVAL WORKFLOWS POLICIES
-- ============================================

-- Users can view approvals related to their requests
CREATE POLICY "Users can view own request approvals"
  ON approval_workflows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM training_requests
      WHERE training_requests.id = approval_workflows.training_request_id
      AND training_requests.requester_id = auth.uid()
    )
  );

-- Approvers can view and create approvals for assigned requests
CREATE POLICY "Approvers can manage assigned approvals"
  ON approval_workflows FOR ALL
  USING (approver_id = auth.uid())
  WITH CHECK (approver_id = auth.uid());

-- HR Admins can view all approvals
CREATE POLICY "HR admins can view all approvals"
  ON approval_workflows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System can create notifications (handled by functions)
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- LOOKUP TABLES POLICIES (Read-only for most users)
-- ============================================

-- Everyone can view training categories
CREATE POLICY "Everyone can view training categories"
  ON training_categories FOR SELECT
  USING (is_active = true);

-- Everyone can view approved training providers
CREATE POLICY "Everyone can view approved providers"
  ON training_providers FOR SELECT
  USING (is_approved = true);

-- Everyone can view active training programs
CREATE POLICY "Everyone can view active programs"
  ON training_programs FOR SELECT
  USING (is_active = true);

-- HR Admins can manage lookup tables
CREATE POLICY "HR admins can manage categories"
  ON training_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

CREATE POLICY "HR admins can manage providers"
  ON training_providers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

CREATE POLICY "HR admins can manage programs"
  ON training_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'hr_admin'
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_requests_updated_at
  BEFORE UPDATE ON training_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizational_units_updated_at
  BEFORE UPDATE ON organizational_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function: Generate training request number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  sequence_num TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  sequence_num := LPAD(
    (SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 4 FOR 6) AS INTEGER)), 0) + 1
     FROM training_requests
     WHERE request_number LIKE 'TR' || year_suffix || '%')::TEXT,
    6, '0'
  );
  NEW.request_number := 'TR' || year_suffix || sequence_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-generate request number
CREATE TRIGGER generate_training_request_number
  BEFORE INSERT ON training_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL)
  EXECUTE FUNCTION generate_request_number();

-- Function: Create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_related_request_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_request_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_request_id)
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to training_requests
CREATE TRIGGER log_training_request_activity
  AFTER INSERT OR UPDATE OR DELETE ON training_requests
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================
-- SEED DATA (Optional - for testing)
-- ============================================

-- Insert sample training categories
INSERT INTO training_categories (name, name_ar) VALUES
  ('Leadership', 'القيادة'),
  ('Technical Skills', 'المهارات التقنية'),
  ('Communication', 'التواصل'),
  ('Project Management', 'إدارة المشاريع'),
  ('Compliance', 'الامتثال والجودة');

-- ============================================
-- HELPER VIEWS (Optional)
-- ============================================

-- View: Pending approvals for current user
CREATE OR REPLACE VIEW my_pending_approvals AS
SELECT
  tr.id,
  tr.request_number,
  tr.custom_training_title,
  tr.status,
  tr.priority,
  tr.created_at,
  p.full_name as requester_name,
  p.job_title as requester_job_title
FROM training_requests tr
JOIN profiles p ON tr.requester_id = p.id
WHERE tr.current_approver_id = auth.uid()
  AND tr.status LIKE 'pending_%';

-- View: My training requests summary
CREATE OR REPLACE VIEW my_training_requests AS
SELECT
  tr.id,
  tr.request_number,
  tr.custom_training_title,
  tr.status,
  tr.priority,
  tr.estimated_cost,
  tr.preferred_start_date,
  tr.created_at,
  tr.submitted_at,
  CASE
    WHEN tr.current_approver_id IS NOT NULL THEN ap.full_name
    ELSE NULL
  END as current_approver_name
FROM training_requests tr
LEFT JOIN profiles ap ON tr.current_approver_id = ap.id
WHERE tr.requester_id = auth.uid();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles extending auth.users with role-based information';
COMMENT ON TABLE training_requests IS 'Main table for training requests with multi-level approval workflow';
COMMENT ON TABLE approval_workflows IS 'Tracks approval history for each training request';
COMMENT ON COLUMN training_requests.status IS 'Current status in the approval workflow';
COMMENT ON COLUMN training_requests.current_approver_id IS 'User ID of the person who needs to approve next';

-- ============================================
-- END OF SCHEMA
-- ============================================
