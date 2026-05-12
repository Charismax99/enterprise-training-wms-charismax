-- ============================================
-- SEED DATA FOR T-WMS (Training Workflow Management System)
-- Test data for development and demonstration
-- ============================================

-- Note: Run this AFTER the main schema has been created
-- This file contains sample data for testing the application

-- ============================================
-- ORGANIZATIONAL UNITS
-- ============================================

INSERT INTO organizational_units (id, name, code, parent_unit_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Human Resources', 'HR', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'Information Technology', 'IT', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'Finance', 'FIN', NULL),
  ('550e8400-e29b-41d4-a716-446655440004', 'Marketing', 'MKT', NULL),
  ('550e8400-e29b-41d4-a716-446655440005', 'Operations', 'OPS', NULL);

-- ============================================
-- USER PROFILES (Sample Users)
-- ============================================
-- Note: You need to create these users in Supabase Auth first,
-- or modify the trigger to create profiles automatically

-- Sample Employees
INSERT INTO profiles (id, email, full_name, role, employee_id, job_title, department, organizational_unit_id) VALUES
  -- HR Admin
  ('11111111-1111-1111-1111-111111111111', 'admin@company.com', 'أحمد محمد السعيد', 'hr_admin', 'EMP001', 'مدير الموارد البشرية', 'الموارد البشرية', '550e8400-e29b-41d4-a716-446655440001'),

  -- Talent Development
  ('22222222-2222-2222-2222-222222222222', 'talent@company.com', 'فاطمة علي الغامدي', 'talent_dev', 'EMP002', 'مسؤولة تطوير المواهب', 'الموارد البشرية', '550e8400-e29b-41d4-a716-446655440001'),

  -- Unit Heads
  ('33333333-3333-3333-3333-333333333333', 'it.head@company.com', 'خالد عبدالله القحطاني', 'unit_head', 'EMP003', 'رئيس قسم تقنية المعلومات', 'تقنية المعلومات', '550e8400-e29b-41d4-a716-446655440002'),
  ('44444444-4444-4444-4444-444444444444', 'finance.head@company.com', 'نورة سعد العتيبي', 'unit_head', 'EMP004', 'رئيسة قسم المالية', 'المالية', '550e8400-e29b-41d4-a716-446655440003'),

  -- Managers
  ('55555555-5555-5555-5555-555555555555', 'manager1@company.com', 'محمد صالح الدوسري', 'manager', 'EMP005', 'مدير تطوير البرمجيات', 'تقنية المعلومات', '550e8400-e29b-41d4-a716-446655440002'),
  ('66666666-6666-6666-6666-666666666666', 'manager2@company.com', 'سارة يوسف الشمري', 'manager', 'EMP006', 'مديرة المحاسبة', 'المالية', '550e8400-e29b-41d4-a716-446655440003'),

  -- Employees
  ('77777777-7777-7777-7777-777777777777', 'emp1@company.com', 'عبدالرحمن أحمد العمري', 'employee', 'EMP007', 'مطور برمجيات أول', 'تقنية المعلومات', '550e8400-e29b-41d4-a716-446655440002'),
  ('88888888-8888-8888-8888-888888888888', 'emp2@company.com', 'ريم فهد المطيري', 'employee', 'EMP008', 'محاسبة', 'المالية', '550e8400-e29b-41d4-a716-446655440003'),
  ('99999999-9999-9999-9999-999999999999', 'emp3@company.com', 'عمر حسن الزهراني', 'employee', 'EMP009', 'مطور واجهات أمامية', 'تقنية المعلومات', '550e8400-e29b-41d4-a716-446655440002'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'emp4@company.com', 'منى خالد الحربي', 'employee', 'EMP010', 'محللة مالية', 'المالية', '550e8400-e29b-41d4-a716-446655440003');

-- Update manager relationships
UPDATE profiles SET manager_id = '55555555-5555-5555-5555-555555555555' WHERE id IN ('77777777-7777-7777-7777-777777777777', '99999999-9999-9999-9999-999999999999');
UPDATE profiles SET manager_id = '66666666-6666-6666-6666-666666666666' WHERE id IN ('88888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
UPDATE profiles SET manager_id = '33333333-3333-3333-3333-333333333333' WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE profiles SET manager_id = '44444444-4444-4444-4444-444444444444' WHERE id = '66666666-6666-6666-6666-666666666666';

-- Update unit heads
UPDATE organizational_units SET unit_head_id = '33333333-3333-3333-3333-333333333333' WHERE id = '550e8400-e29b-41d4-a716-446655440002';
UPDATE organizational_units SET unit_head_id = '44444444-4444-4444-4444-444444444444' WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- ============================================
-- TRAINING CATEGORIES
-- ============================================

INSERT INTO training_categories (name, name_ar, description, is_active) VALUES
  ('Leadership & Management', 'القيادة والإدارة', 'Leadership development and management skills training', true),
  ('Technical Skills', 'المهارات التقنية', 'Technical and IT-related training programs', true),
  ('Communication', 'مهارات التواصل', 'Communication and interpersonal skills', true),
  ('Project Management', 'إدارة المشاريع', 'Project management methodologies and tools', true),
  ('Compliance & Quality', 'الامتثال والجودة', 'Regulatory compliance and quality management', true),
  ('Professional Certifications', 'الشهادات المهنية', 'Professional certification programs', true),
  ('Soft Skills', 'المهارات الشخصية', 'Personal development and soft skills', true),
  ('Financial Management', 'الإدارة المالية', 'Financial analysis and accounting skills', true);

-- ============================================
-- TRAINING PROVIDERS
-- ============================================

INSERT INTO training_providers (name, name_ar, contact_person, email, phone, website, is_approved, rating) VALUES
  ('Saudi Training Academy', 'الأكاديمية السعودية للتدريب', 'أحمد الخالد', 'info@sta.sa', '+966501234567', 'https://sta.sa', true, 4.5),
  ('Professional Development Center', 'مركز التطوير المهني', 'فاطمة العمري', 'contact@pdc.com.sa', '+966502345678', 'https://pdc.com.sa', true, 4.8),
  ('Tech Skills Institute', 'معهد المهارات التقنية', 'خالد السعيد', 'info@techskills.sa', '+966503456789', 'https://techskills.sa', true, 4.3),
  ('Leadership Excellence', 'التميز القيادي', 'نورة الشمري', 'training@leadership.sa', '+966504567890', 'https://leadership.sa', true, 4.7),
  ('Global Certification Hub', 'مركز الشهادات العالمية', 'محمد الدوسري', 'certs@globalhub.sa', '+966505678901', 'https://globalhub.sa', true, 4.6);

-- ============================================
-- TRAINING PROGRAMS
-- ============================================

INSERT INTO training_programs (title, title_ar, description, category_id, provider_id, training_type, duration_hours, duration_days, cost_estimate, max_participants, prerequisites, learning_objectives) VALUES
  (
    'Advanced React Development',
    'تطوير React المتقدم',
    'Comprehensive React.js training covering hooks, state management, and performance optimization',
    (SELECT id FROM training_categories WHERE name = 'Technical Skills'),
    (SELECT id FROM training_providers WHERE name = 'Tech Skills Institute'),
    'online',
    40,
    5,
    8000.00,
    20,
    'Basic JavaScript and HTML/CSS knowledge',
    ARRAY['Master React Hooks', 'Implement state management with Redux', 'Optimize component performance', 'Build scalable applications']
  ),
  (
    'Project Management Professional (PMP)',
    'إدارة المشاريع الاحترافية',
    'PMP certification preparation course covering all PMBOK knowledge areas',
    (SELECT id FROM training_categories WHERE name = 'Project Management'),
    (SELECT id FROM training_providers WHERE name = 'Global Certification Hub'),
    'certification',
    120,
    15,
    15000.00,
    25,
    '3 years project management experience',
    ARRAY['Pass PMP exam', 'Master project planning', 'Understand risk management', 'Lead successful projects']
  ),
  (
    'Effective Leadership Skills',
    'مهارات القيادة الفعالة',
    'Leadership training program for managers and team leaders',
    (SELECT id FROM training_categories WHERE name = 'Leadership & Management'),
    (SELECT id FROM training_providers WHERE name = 'Leadership Excellence'),
    'workshop',
    24,
    3,
    6000.00,
    15,
    'Minimum 1 year management experience',
    ARRAY['Develop leadership style', 'Improve team motivation', 'Enhance decision-making', 'Build high-performing teams']
  ),
  (
    'Financial Analysis Fundamentals',
    'أساسيات التحليل المالي',
    'Introduction to financial statement analysis and financial modeling',
    (SELECT id FROM training_categories WHERE name = 'Financial Management'),
    (SELECT id FROM training_providers WHERE name = 'Professional Development Center'),
    'external',
    32,
    4,
    7500.00,
    20,
    'Basic accounting knowledge',
    ARRAY['Read financial statements', 'Perform ratio analysis', 'Build financial models', 'Make informed decisions']
  ),
  (
    'Communication Excellence',
    'التميز في التواصل',
    'Improve communication skills for professional environments',
    (SELECT id FROM training_categories WHERE name = 'Communication'),
    (SELECT id FROM training_providers WHERE name = 'Saudi Training Academy'),
    'internal',
    16,
    2,
    3000.00,
    30,
    'None',
    ARRAY['Master verbal communication', 'Improve presentation skills', 'Handle difficult conversations', 'Build rapport']
  );

-- ============================================
-- TRAINING REQUESTS (Sample Data)
-- ============================================

-- Request 1: Draft (Employee 1)
INSERT INTO training_requests (
  request_number,
  requester_id,
  training_program_id,
  custom_training_title,
  training_type,
  category_id,
  business_justification,
  expected_outcomes,
  priority,
  preferred_start_date,
  estimated_cost,
  number_of_participants,
  training_location,
  is_online,
  status,
  current_approval_level
) VALUES (
  'TR26000001',
  '77777777-7777-7777-7777-777777777777',
  (SELECT id FROM training_programs WHERE title = 'Advanced React Development'),
  'Advanced React Development',
  'online',
  (SELECT id FROM training_categories WHERE name = 'Technical Skills'),
  'نحتاج لتحديث مهارات الفريق في React لمواكبة أحدث التقنيات وتحسين جودة المنتج',
  'تحسين كفاءة التطوير وجودة الكود',
  'high',
  '2026-06-15',
  8000.00,
  3,
  'Online',
  true,
  'draft',
  0
);

-- Request 2: Pending Manager Approval
INSERT INTO training_requests (
  request_number,
  requester_id,
  custom_training_title,
  training_type,
  category_id,
  business_justification,
  expected_outcomes,
  priority,
  preferred_start_date,
  estimated_cost,
  number_of_participants,
  training_location,
  is_online,
  status,
  current_approver_id,
  current_approval_level,
  submitted_at
) VALUES (
  'TR26000002',
  '99999999-9999-9999-9999-999999999999',
  'UX/UI Design Principles',
  'external',
  (SELECT id FROM training_categories WHERE name = 'Technical Skills'),
  'لتحسين تجربة المستخدم في التطبيقات الجديدة وزيادة رضا العملاء',
  'تصميم واجهات أفضل وأكثر سهولة في الاستخدام',
  'medium',
  '2026-07-01',
  5500.00,
  2,
  'الرياض',
  false,
  'pending_manager',
  '55555555-5555-5555-5555-555555555555',
  1,
  NOW() - INTERVAL '2 days'
);

-- Request 3: Pending Unit Head Approval
INSERT INTO training_requests (
  request_number,
  requester_id,
  custom_training_title,
  training_type,
  category_id,
  business_justification,
  expected_outcomes,
  skill_gap_analysis,
  priority,
  preferred_start_date,
  estimated_cost,
  number_of_participants,
  training_location,
  is_online,
  status,
  current_approver_id,
  current_approval_level,
  submitted_at
) VALUES (
  'TR26000003',
  '88888888-8888-8888-8888-888888888888',
  'Advanced Excel for Financial Analysis',
  'online',
  (SELECT id FROM training_categories WHERE name = 'Financial Management'),
  'لتحسين كفاءة إعداد التقارير المالية والتحليلات المعقدة',
  'زيادة سرعة إنجاز التقارير بنسبة 40%',
  'نقص في المهارات المتقدمة في Excel وخاصة Power Query و Power Pivot',
  'high',
  '2026-06-20',
  4000.00,
  1,
  'Online',
  true,
  'pending_unit_head',
  '44444444-4444-4444-4444-444444444444',
  2,
  NOW() - INTERVAL '5 days'
);

-- Request 4: Approved
INSERT INTO training_requests (
  request_number,
  requester_id,
  training_program_id,
  custom_training_title,
  training_type,
  category_id,
  business_justification,
  expected_outcomes,
  priority,
  preferred_start_date,
  estimated_cost,
  number_of_participants,
  training_location,
  is_online,
  status,
  current_approval_level,
  submitted_at,
  completed_at
) VALUES (
  'TR26000004',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  (SELECT id FROM training_programs WHERE title = 'Financial Analysis Fundamentals'),
  'Financial Analysis Fundamentals',
  'external',
  (SELECT id FROM training_categories WHERE name = 'Financial Management'),
  'لبناء القدرات التحليلية لفريق المالية وتحسين جودة التقارير',
  'إعداد تقارير مالية أكثر دقة وشمولية',
  'medium',
  '2026-08-01',
  7500.00,
  2,
  'جدة',
  false,
  'approved',
  4,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '1 day'
);

-- Request 5: Rejected
INSERT INTO training_requests (
  request_number,
  requester_id,
  custom_training_title,
  training_type,
  category_id,
  business_justification,
  priority,
  preferred_start_date,
  estimated_cost,
  number_of_participants,
  training_location,
  is_online,
  status,
  current_approval_level,
  submitted_at,
  completed_at
) VALUES (
  'TR26000005',
  '77777777-7777-7777-7777-777777777777',
  'International Conference Trip',
  'external',
  (SELECT id FROM training_categories WHERE name = 'Technical Skills'),
  'حضور مؤتمر تقني دولي',
  'low',
  '2026-12-01',
  25000.00,
  1,
  'دبي',
  false,
  'rejected',
  1,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '8 days'
);

-- ============================================
-- APPROVAL WORKFLOWS
-- ============================================

-- Approval for Request 3 (by Manager)
INSERT INTO approval_workflows (
  training_request_id,
  approver_id,
  approver_role,
  approval_level,
  action,
  comments,
  approved_at
) VALUES (
  (SELECT id FROM training_requests WHERE request_number = 'TR26000003'),
  '66666666-6666-6666-6666-666666666666',
  'manager',
  1,
  'approved',
  'موافق، هذا التدريب مهم لتطوير مهارات الفريق',
  NOW() - INTERVAL '4 days'
);

-- Approvals for Request 4 (Complete workflow)
INSERT INTO approval_workflows (
  training_request_id,
  approver_id,
  approver_role,
  approval_level,
  action,
  comments,
  approved_at
) VALUES
  (
    (SELECT id FROM training_requests WHERE request_number = 'TR26000004'),
    '66666666-6666-6666-6666-666666666666',
    'manager',
    1,
    'approved',
    'معتمد',
    NOW() - INTERVAL '14 days'
  ),
  (
    (SELECT id FROM training_requests WHERE request_number = 'TR26000004'),
    '44444444-4444-4444-4444-444444444444',
    'unit_head',
    2,
    'approved',
    'معتمد من قسم المالية',
    NOW() - INTERVAL '10 days'
  ),
  (
    (SELECT id FROM training_requests WHERE request_number = 'TR26000004'),
    '22222222-2222-2222-2222-222222222222',
    'talent_dev',
    3,
    'approved',
    'معتمد نهائياً من تطوير المواهب',
    NOW() - INTERVAL '1 day'
  );

-- Rejection for Request 5
INSERT INTO approval_workflows (
  training_request_id,
  approver_id,
  approver_role,
  approval_level,
  action,
  comments,
  approved_at
) VALUES (
  (SELECT id FROM training_requests WHERE request_number = 'TR26000005'),
  '55555555-5555-5555-5555-555555555555',
  'manager',
  1,
  'rejected',
  'الميزانية غير متوفرة حالياً، يرجى إعادة التقديم في الربع القادم',
  NOW() - INTERVAL '8 days'
);

-- ============================================
-- NOTIFICATIONS (Sample)
-- ============================================

INSERT INTO notifications (user_id, title, message, type, related_request_id, is_read) VALUES
  (
    '55555555-5555-5555-5555-555555555555',
    'طلب تدريب جديد',
    'لديك طلب تدريب جديد بانتظار المراجعة',
    'info',
    (SELECT id FROM training_requests WHERE request_number = 'TR26000002'),
    false
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'طلب تدريب جديد',
    'لديك طلب تدريب جديد بانتظار المراجعة',
    'info',
    (SELECT id FROM training_requests WHERE request_number = 'TR26000003'),
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'تم اعتماد طلبك',
    'تم اعتماد طلب التدريب الخاص بك',
    'success',
    (SELECT id FROM training_requests WHERE request_number = 'TR26000004'),
    true
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    'تم رفض طلبك',
    'تم رفض طلب التدريب - يرجى مراجعة التعليقات',
    'error',
    (SELECT id FROM training_requests WHERE request_number = 'TR26000005'),
    true
  );

-- ============================================
-- ACTIVITY LOG (Sample)
-- ============================================

INSERT INTO activity_log (user_id, action, entity_type, entity_id) VALUES
  ('77777777-7777-7777-7777-777777777777', 'INSERT', 'training_requests', (SELECT id FROM training_requests WHERE request_number = 'TR26000001')),
  ('99999999-9999-9999-9999-999999999999', 'INSERT', 'training_requests', (SELECT id FROM training_requests WHERE request_number = 'TR26000002')),
  ('55555555-5555-5555-5555-555555555555', 'UPDATE', 'training_requests', (SELECT id FROM training_requests WHERE request_number = 'TR26000002')),
  ('88888888-8888-8888-8888-888888888888', 'INSERT', 'training_requests', (SELECT id FROM training_requests WHERE request_number = 'TR26000003')),
  ('66666666-6666-6666-6666-666666666666', 'INSERT', 'approval_workflows', (SELECT id FROM approval_workflows WHERE training_request_id = (SELECT id FROM training_requests WHERE request_number = 'TR26000003')));

-- ============================================
-- END OF SEED DATA
-- ============================================

-- Verify data
SELECT 'Profiles created:' as info, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Training categories:', COUNT(*) FROM training_categories
UNION ALL
SELECT 'Training providers:', COUNT(*) FROM training_providers
UNION ALL
SELECT 'Training programs:', COUNT(*) FROM training_programs
UNION ALL
SELECT 'Training requests:', COUNT(*) FROM training_requests
UNION ALL
SELECT 'Approval workflows:', COUNT(*) FROM approval_workflows
UNION ALL
SELECT 'Notifications:', COUNT(*) FROM notifications;
