# نظام إدارة طلبات التدريب — T-WMS

نظام ويب لإدارة دورة التدريب الكاملة من الترشيح حتى الاعتماد النهائي عبر خمس مراحل:
**المدير → الموظف → المُدقّق الذكي → رئيس وحدة التدريب → مدير تطوير المواهب.**

---

## المتطلبات قبل التشغيل

- Node.js إصدار 20 أو أحدث ([تحميل من هنا](https://nodejs.org/))
- متصفح حديث (Chrome / Edge / Firefox)
- محرر VS Code (مفضّل)

---

## خطوات التشغيل المحلي

### ١. فك ضغط المشروع وافتحه في VS Code
```bash
cd enterprise-training-wms
code .
```

### ٢. أنشئ ملف البيئة
انسخ ملف `.env.example` إلى ملف جديد اسمه `.env`:
```bash
cp .env.example .env
```
الملف جاهز ببيانات Supabase الحقيقية، لا حاجة لتعديله.

### ٣. ثبّت الحزم
```bash
npm install
```

### ٤. شغّل المشروع
```bash
npm run dev
```

### ٥. افتح المتصفح
```
http://localhost:5173/
```

---

## بيانات الدخول لجميع الأدوار

كلمة المرور: **أي قيمة (مثل `123`)** — النظام في وضع العرض لا يتحقق من كلمة المرور.

| الدور | الرقم الوظيفي | الاسم |
|---|---|---|
| موظف | `E001` | Ahmed Al-Saud |
| موظف | `E002` | Sara Al-Otaibi |
| موظف | `E003` | Khalid Al-Harbi |
| موظف | `E004` | Reem Al-Shammari |
| مدير مباشر | `M001` | Fahad Al-Qahtani |
| مدير مباشر | `M002` | Noura Al-Dossary |
| رئيس وحدة التدريب | `UH01` | Yousef Al-Mutairi |
| مدير تطوير المواهب | `TD01` | Layla Al-Zahrani |
| إدارة الموارد البشرية | `HR01` | Omar Al-Ghamdi |

---

## مسار الموافقة (Workflow)

```
١. المدير المباشر       →  يرسل ترشيح للموظف
٢. الموظف              →  يكمل تفاصيل التدريب
٣. المُدقّق الذكي       →  يتحقّق آلياً (تكلفة، مدّة، حقول مطلوبة)
٤. رئيس وحدة التدريب    →  مراجعة فنية (موافقة / رفض)
٥. مدير تطوير المواهب   →  اعتماد نهائي (موافقة / رفض)
```

---

## النشر على Vercel (اختياري)

إذا أردتِ نشر نسخة على الإنترنت:
1. ارفعي المشروع على GitHub (private repository).
2. ادخلي [vercel.com](https://vercel.com) واربطي الـ repository.
3. في **Project Settings → Environment Variables** أضيفي:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (نفس القيم الموجودة في `.env.example`)
4. اضغطي **Deploy**.

---

## التقنيات المستخدمة

| الطبقة | التقنية |
|---|---|
| واجهة المستخدم | React 18 + TypeScript + Vite |
| التصميم | Tailwind CSS + Radix UI |
| قاعدة البيانات | PostgreSQL عبر Supabase |
| المزامنة الفورية | Supabase Realtime |
| النشر | Vercel |

---

## في حال واجهتِ مشكلة

| المشكلة | الحل |
|---|---|
| `npm install` يفشل | احذفي `node_modules` و `package-lock.json` ثم نفّذي `npm install` مرة أخرى |
| الموقع يفتح لكن لا تظهر بيانات | تأكّدي أنّ ملف `.env` موجود وأنّ القيم بداخله صحيحة |
| خطأ بخصوص port 5173 مشغول | شغّلي `npm run dev -- --port 3000` |
| الطلبات لا تُحفظ | افتحي Console في المتصفح (F12) وراجعي الأخطاء — على الأرجح إعدادات RLS في Supabase |

---

## ملفات التوثيق الإضافية

- `QUICK_START.md` — دليل البدء السريع بالإنجليزية
- `DATABASE_INTEGRATION_COMPLETE.md` — تفاصيل التكامل مع قاعدة البيانات
- `FIELD_MAPPING_GUIDE.md` — دليل تطابق الحقول
- `SUPABASE_SETUP_GUIDE.md` — إعداد Supabase من الصفر
- `supabase_simple_schema.sql` — مخطّط قاعدة البيانات (للتثبيت اليدوي)
- `supabase_seed_data.sql` — بيانات تجريبية أوّليّة

---

تم تطوير المشروع بواسطة **فريق كاريزما** — Charisma Team

WhatsApp: [+201002455834](https://wa.me/201002455834)
