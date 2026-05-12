# 🗄️ Supabase Database Schema - T-WMS

## نظام إدارة سير عمل التدريب المؤسسي

تم إنشاء schema قاعدة بيانات Supabase شامل وجاهز للاستخدام يدعم:
- ✅ 5 أدوار مستخدم مع RBAC
- ✅ سير عمل موافقات متعدد المستويات
- ✅ سياسات أمان RLS شاملة
- ✅ إشعارات في الوقت الفعلي
- ✅ سجل النشاطات
- ✅ أنواع TypeScript كاملة

---

## 📁 الملفات المنشأة

### 1️⃣ ملفات قاعدة البيانات

#### `supabase_schema.sql` ⭐ **الملف الرئيسي**
- **الوصف**: Schema PostgreSQL الكامل للنظام
- **يحتوي على**:
  - 13 جدول رئيسي
  - 5 ENUMs للأنواع
  - سياسات RLS شاملة لكل جدول
  - Triggers تلقائية
  - Functions مساعدة
  - Indexes للأداء الأمثل
- **الاستخدام**: انسخ المحتوى والصقه في Supabase SQL Editor

#### `supabase_seed_data.sql` 🌱
- **الوصف**: بيانات تجريبية للاختبار
- **يحتوي على**:
  - 10 مستخدمين بأدوار مختلفة
  - 5 وحدات تنظيمية
  - 8 تصنيفات تدريب
  - 5 مزودي تدريب
  - 5 برامج تدريبية
  - 5 طلبات تدريب بحالات مختلفة
  - سجل الموافقات
  - إشعارات نموذجية
- **الاستخدام**: نفذه بعد تنفيذ schema الرئيسي

---

### 2️⃣ ملفات TypeScript

#### `src/types/database.types.ts` 📘
- **الوصف**: تعريفات TypeScript لجميع الجداول
- **يحتوي على**:
  - أنواع لجميع الجداول (13 interface)
  - ENUMs بنفس أسماء PostgreSQL
  - أنواع العلاقات (WithRelations)
  - أنواع النماذج (FormData)
  - أنواع Dashboard Stats
  - Labels بالعربي والإنجليزي
- **الاستخدام**: استورده في مكونات React للحصول على type safety

#### `src/lib/supabase.ts` 🔧
- **الوصف**: إعداد Supabase Client
- **يحتوي على**:
  - إنشاء وإعداد Supabase client
  - دوال المصادقة (signIn, signUp, signOut)
  - دوال رفع الملفات
  - دوال الاشتراك في Real-time
  - دوال مساعدة
- **الاستخدام**: استورده في أي مكون يحتاج للتواصل مع Supabase

#### `src/services/trainingRequestService.ts` 🎯
- **الوصف**: خدمة API كاملة لإدارة طلبات التدريب
- **يحتوي على**:
  - `getTrainingRequests()` - جلب الطلبات مع الفلاتر
  - `getTrainingRequestById()` - جلب طلب واحد
  - `getMyTrainingRequests()` - طلباتي
  - `getMyPendingApprovals()` - الموافقات المعلقة
  - `createTrainingRequest()` - إنشاء طلب جديد
  - `submitTrainingRequest()` - إرسال طلب للمدير
  - `approveTrainingRequest()` - اعتماد طلب
  - `rejectTrainingRequest()` - رفض طلب
  - `cancelTrainingRequest()` - إلغاء طلب
  - `getDashboardStats()` - إحصائيات Dashboard
- **الاستخدام**: استورد الدوال المطلوبة في مكوناتك

---

### 3️⃣ ملفات التوثيق

#### `SUPABASE_SETUP_GUIDE.md` 📖
- **الوصف**: دليل الإعداد الشامل
- **يحتوي على**:
  - خطوات إنشاء مشروع Supabase
  - شرح Schema والجداول
  - شرح سياسات RLS
  - دليل سير العمل (Workflow)
  - أمثلة API queries
  - استخدام Views المساعدة
  - معلومات Environment Variables
  - Troubleshooting شائع
- **الاستخدام**: اقرأه قبل البدء بالتطبيق

#### `SUPABASE_INTEGRATION_EXAMPLE.md` 💡
- **الوصف**: أمثلة تكامل React كاملة
- **يحتوي على**:
  - مثال Login Component متكامل
  - مثال Employee Dashboard بالبيانات الحقيقية
  - مثال نموذج إنشاء طلب تدريب
  - مثال Real-time Notifications
  - Best Practices
  - Error Handling
  - Security Checklist
- **الاستخدام**: انسخ الأمثلة وعدّل حسب احتياجك

#### `SUPABASE_README.md` 📄 **(هذا الملف)**
- **الوصف**: ملخص شامل لكل الملفات
- **الاستخدام**: نقطة البداية لفهم البنية

---

## 🚀 خطوات البدء السريع

### الخطوة 1: إعداد Supabase
```bash
# 1. انتقل إلى supabase.com وأنشئ مشروع جديد
# 2. افتح SQL Editor
# 3. انسخ محتوى supabase_schema.sql والصقه
# 4. اضغط Run
# 5. (اختياري) نفذ supabase_seed_data.sql للبيانات التجريبية
```

### الخطوة 2: إعداد React App
```bash
# تثبيت Supabase client
pnpm add @supabase/supabase-js

# إنشاء ملف .env
echo "VITE_SUPABASE_URL=YOUR_URL_HERE" > .env
echo "VITE_SUPABASE_ANON_KEY=YOUR_KEY_HERE" >> .env
```

### الخطوة 3: استخدام في React
```tsx
// في أي component
import { supabase } from './lib/supabase'
import { getMyTrainingRequests } from './services/trainingRequestService'

// جلب البيانات
const requests = await getMyTrainingRequests()
```

---

## 📊 هيكل قاعدة البيانات

### الجداول الرئيسية

```
┌─────────────────────┐
│   auth.users        │  (Supabase Auth)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│    profiles         │  ← معلومات المستخدم + الدور
├─────────────────────┤
│ • role              │
│ • manager_id        │
│ • org_unit_id       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ training_requests   │  ← الطلبات الرئيسية
├─────────────────────┤
│ • requester_id      │
│ • status            │
│ • current_approver  │
│ • approval_level    │
└──────┬──────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ approval_    │   │ training_    │
│ workflows    │   │ executions   │
└──────────────┘   └──────────────┘
```

### الأدوار (Roles)

| الدور | الصلاحيات |
|------|---------|
| **employee** | إنشاء وعرض طلباته فقط |
| **manager** | عرض طلبات فريقه + الموافقة |
| **unit_head** | عرض طلبات الوحدة + الموافقة |
| **talent_dev** | عرض جميع الطلبات + الموافقة النهائية |
| **hr_admin** | صلاحيات كاملة |

---

## 🔐 سياسات الأمان (RLS)

### مثال: سياسات training_requests

```sql
-- الموظف يرى طلباته فقط
CREATE POLICY "Employees can view own requests"
  ON training_requests FOR SELECT
  USING (requester_id = auth.uid());

-- المدير يرى طلبات فريقه
CREATE POLICY "Managers can view team requests"
  ON training_requests FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = training_requests.requester_id
    AND profiles.manager_id = auth.uid()
  ));

-- المعتمد الحالي يمكنه التعديل
CREATE POLICY "Approvers can update assigned requests"
  ON training_requests FOR UPDATE
  USING (current_approver_id = auth.uid());
```

---

## 🔄 سير عمل الموافقات

```
┌─────────────┐
│   Draft     │ ← الموظف ينشئ الطلب
└──────┬──────┘
       │ Submit
       ▼
┌─────────────────┐
│ Pending Manager │ ← المدير المباشر
└──────┬──────────┘
       │ Approve
       ▼
┌──────────────────┐
│ Pending Unit Head│ ← رئيس الوحدة
└──────┬───────────┘
       │ Approve
       ▼
┌──────────────────────┐
│ Pending Talent Dev   │ ← تطوير المواهب
└──────┬───────────────┘
       │ Approve
       ▼
┌─────────────┐
│  Approved   │ ← معتمد نهائياً
└─────────────┘
```

**ملاحظة**: يمكن الرفض في أي مرحلة!

---

## 🎨 التكامل مع React

### مثال سريع: جلب طلبات التدريب

```tsx
import { useState, useEffect } from 'react'
import { getMyTrainingRequests } from '../services/trainingRequestService'
import type { TrainingRequest } from '../types/database.types'

function MyRequests() {
  const [requests, setRequests] = useState<TrainingRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const data = await getMyTrainingRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>جاري التحميل...</div>

  return (
    <div>
      {requests.map(req => (
        <div key={req.id}>
          <h3>{req.custom_training_title}</h3>
          <span>{req.status}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## 📈 الميزات الرئيسية

### ✅ ما يدعمه النظام

- [x] نظام صلاحيات متقدم (RBAC)
- [x] سير عمل موافقات متعدد المستويات
- [x] أمان على مستوى الصفوف (RLS)
- [x] إشعارات في الوقت الفعلي
- [x] سجل النشاطات (Audit Log)
- [x] رفع المرفقات
- [x] تقييم التدريبات بعد الانتهاء
- [x] متابعة الحضور
- [x] إحصائيات Dashboard
- [x] فلترة وترتيب متقدم
- [x] Types TypeScript كاملة

---

## 🛠 استكشاف الأخطاء

### مشكلة: سياسات RLS تمنع الوصول
```sql
-- تحقق من المستخدم الحالي
SELECT auth.uid();

-- تحقق من دور المستخدم
SELECT role FROM profiles WHERE id = auth.uid();

-- تحقق من سياسات الجدول
SELECT * FROM pg_policies WHERE tablename = 'training_requests';
```

### مشكلة: البيانات لا تظهر
```tsx
// تأكد من تسجيل الدخول
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// تحقق من الأخطاء
const { data, error } = await supabase.from('profiles').select('*')
console.log('Error:', error)
console.log('Data:', data)
```

---

## 📚 الموارد الإضافية

### الوثائق
- [Supabase Docs](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Functions](https://www.postgresql.org/docs/current/plpgsql.html)

### الملفات للقراءة
1. **ابدأ هنا**: `SUPABASE_SETUP_GUIDE.md`
2. **أمثلة الكود**: `SUPABASE_INTEGRATION_EXAMPLE.md`
3. **Schema الكامل**: `supabase_schema.sql`
4. **بيانات تجريبية**: `supabase_seed_data.sql`

---

## ✅ Checklist للتطبيق

### قاعدة البيانات
- [ ] إنشاء مشروع Supabase جديد
- [ ] تنفيذ `supabase_schema.sql`
- [ ] (اختياري) تنفيذ `supabase_seed_data.sql`
- [ ] الحصول على API keys

### React App
- [ ] تثبيت `@supabase/supabase-js`
- [ ] إضافة environment variables
- [ ] نسخ `src/lib/supabase.ts`
- [ ] نسخ `src/types/database.types.ts`
- [ ] نسخ `src/services/trainingRequestService.ts`
- [ ] تحديث Login component
- [ ] تحديث Dashboard components
- [ ] اختبار التكامل

### الاختبار
- [ ] تسجيل دخول بأدوار مختلفة
- [ ] إنشاء طلب تدريب جديد
- [ ] اعتماد طلب (Manager)
- [ ] اعتماد طلب (Unit Head)
- [ ] اعتماد نهائي (Talent Dev)
- [ ] اختبار الإشعارات
- [ ] اختبار الـ Real-time updates

---

## 🎯 الخطوات التالية المقترحة

1. **المرحلة 1**: إعداد قاعدة البيانات
   - تنفيذ Schema
   - إضافة البيانات التجريبية
   - اختبار سياسات RLS

2. **المرحلة 2**: التكامل الأساسي
   - إعداد Supabase client
   - تحديث Login
   - تحديث Dashboards

3. **المرحلة 3**: الميزات المتقدمة
   - Real-time notifications
   - File uploads
   - Advanced filters
   - Charts & Analytics

4. **المرحلة 4**: التحسينات
   - تحسين الأداء
   - إضافة Caching
   - تحسين UX
   - اختبارات شاملة

---

## 💡 نصائح مهمة

### الأمان
- ✅ **دائماً** استخدم RLS policies
- ✅ لا تشارك ANON KEY في الـ frontend (هذا آمن)
- ⚠️ لا تشارك SERVICE ROLE KEY أبداً
- ✅ استخدم Environment Variables

### الأداء
- استخدم Indexes على الأعمدة المستخدمة في البحث
- استخدم `select()` لتحديد الأعمدة المطلوبة فقط
- استخدم Pagination للقوائم الطويلة
- فعّل Supabase Cache

### الصيانة
- راجع Activity Log دورياً
- نظف Notifications القديمة
- احذف Draft requests القديمة
- عمل Backup دوري

---

## 📞 الدعم

إذا واجهت مشاكل:
1. راجع `SUPABASE_SETUP_GUIDE.md`
2. راجع `SUPABASE_INTEGRATION_EXAMPLE.md`
3. تحقق من [Supabase Docs](https://supabase.com/docs)
4. ابحث في [Supabase Community](https://github.com/supabase/supabase/discussions)

---

**نسخة Schema**: 1.0  
**آخر تحديث**: مايو 2026  
**متوافق مع**: Supabase PostgreSQL 15+, React 18+, TypeScript 5+

---

## 🎉 ملخص

تم إنشاء:
- ✅ Schema كامل (13 جدول)
- ✅ سياسات RLS شاملة
- ✅ أنواع TypeScript كاملة
- ✅ خدمات API جاهزة
- ✅ أمثلة تكامل React
- ✅ بيانات تجريبية
- ✅ توثيق شامل

**كل شيء جاهز للاستخدام! 🚀**
