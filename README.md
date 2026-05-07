# WorkHub — React Project

## Stack
- React 18 + TypeScript
- Vite (dev server + build)
- React Router v6 (client-side routing)
- CSS Variables (design tokens — no Tailwind needed)

## Setup
```bash
npm create vite@latest workhub -- --template react-ts
cd workhub
npm install react-router-dom
npm run dev
```

Then copy the `src/` folder from this project.

## Folder Structure
```
src/
├── components/
│   ├── layout/
│   │   ├── Shell.tsx          # المكوّن الرئيسي — Topbar + Sidebar + Toolbar + main slot
│   │   ├── Topbar.tsx         # شريط التنقل العلوي الثابت
│   │   ├── Sidebar.tsx        # القائمة الجانبية مع كل الأدوات
│   │   └── Toolbar.tsx        # شريط الأدوات (يتغير حسب الصفحة)
│   ├── ui/
│   │   ├── Button.tsx         # زر قابل للتخصيص
│   │   ├── Badge.tsx          # شارة الإشعارات
│   │   ├── Toast.tsx          # رسائل الإشعار
│   │   ├── NavItem.tsx        # عنصر قائمة جانبية
│   │   └── SectionLabel.tsx   # عنوان فاصل
│   └── shared/
│       ├── AiPanel.tsx        # لوحة مساعد الذكاء الاصطناعي
│       └── PlanCard.tsx       # بطاقة الخطة في أسفل الـ Sidebar
├── pages/
│   ├── Meetings.tsx           # تلخيص الاجتماعات
│   ├── Invoices.tsx           # فواتير المستقلين
│   ├── Tasks.tsx              # تتبع المهام الذكي
│   ├── CvOptimizer.tsx        # محسّن السيرة الذاتية
│   └── Templates.tsx          # النماذج الاحترافية
├── hooks/
│   ├── useToast.ts            # hook للإشعارات
│   └── useActiveNav.ts        # hook لتتبع الصفحة الحالية
├── types/
│   └── index.ts               # TypeScript interfaces
├── data/
│   └── navigation.ts          # قائمة التنقل المركزية
├── styles/
│   └── globals.css            # CSS variables + base styles
├── App.tsx                    # Router + routes
└── main.tsx                   # entry point
```

## Architecture Decisions

### Shell كـ Layout Component
```tsx
// كل صفحة تُغلَّف بـ Shell تلقائياً عبر Router
<Shell toolbar={<TasksToolbar />}>
  <TasksPage />
</Shell>
```

### Navigation مركزي
```ts
// src/data/navigation.ts
// قائمة واحدة تُغذّي الـ Sidebar + Breadcrumb + Page titles
```

### CSS Variables بدل Tailwind
```css
/* نفس المتغيرات من الـ HTML files — لا تغيير */
--accent: #6c63ff;
--green: #34d399;
```
