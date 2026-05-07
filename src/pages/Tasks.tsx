import React, { useState, useRef } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, AiButton, ToolbarSection, ToolbarDivider, PageHeader } from '../components/ui';
import { AiPanel } from '../components/shared';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import type { Task, TaskColumn, TaskPriority } from '../types';

// ── Initial data ─────────────────────────
const INITIAL: Record<TaskColumn, Task[]> = {
  todo: [
    { id: 1, title: 'مراجعة عقد العميل الجديد وتعديل البنود', tag: 'coral',  tagLabel: 'عاجل',        priority: 'high',   aiScore: 95, date: 'اليوم',    assignee: 'أح', assigneeBg: 'rgba(108,99,255,.2)', assigneeColor: 'var(--accent2)', column: 'todo' },
    { id: 2, title: 'تحضير عرض Q3 للشركاء',                  tag: 'blue',   tagLabel: 'هذا الأسبوع', priority: 'medium', aiScore: 72, date: 'الخميس',   assignee: 'سا', assigneeBg: 'rgba(52,211,153,.15)', assigneeColor: 'var(--green)',   column: 'todo' },
    { id: 3, title: 'متابعة ردود العملاء على الكاتالوج',     tag: 'purple', tagLabel: 'متابعة',      priority: 'low',    aiScore: 45, date: 'الجمعة',   assignee: 'نو', assigneeBg: 'rgba(56,189,248,.12)', assigneeColor: 'var(--accent3)', column: 'todo' },
  ],
  doing: [
    { id: 4, title: 'تطوير واجهة لوحة KPI الجديدة',          tag: 'blue',   tagLabel: 'تطوير',        priority: 'high',   aiScore: 88, date: 'اليوم',    assignee: 'أح', assigneeBg: 'rgba(108,99,255,.2)', assigneeColor: 'var(--accent2)', column: 'doing' },
    { id: 5, title: 'اجتماع مراجعة المشروع مع TechCorp',     tag: 'gold',   tagLabel: 'اجتماع',       priority: 'medium', aiScore: 60, date: 'غداً',     assignee: 'سا', assigneeBg: 'rgba(52,211,153,.15)', assigneeColor: 'var(--green)',   column: 'doing' },
  ],
  review: [],
  done: [
    { id: 6, title: 'إرسال فاتورة مشروع التصميم',            tag: 'green',  tagLabel: 'مالي',         priority: 'low',    aiScore: 100, date: 'أمس',    assignee: 'أح', assigneeBg: 'rgba(108,99,255,.2)', assigneeColor: 'var(--accent2)', column: 'done' },
    { id: 7, title: 'تحديث بيانات الموردين في الدليل',        tag: 'purple', tagLabel: 'إداري',        priority: 'low',    aiScore: 100, date: 'أمس',    assignee: 'نو', assigneeBg: 'rgba(56,189,248,.12)', assigneeColor: 'var(--accent3)', column: 'done' },
    { id: 8, title: 'نشر تحديث التطبيق v2.1',                tag: 'blue',   tagLabel: 'تقني',         priority: 'low',    aiScore: 100, date: 'السبت',   assignee: 'سا', assigneeBg: 'rgba(52,211,153,.15)', assigneeColor: 'var(--green)',   column: 'done' },
  ],
};

const COL_CONFIG: { id: TaskColumn; label: string; dot: string }[] = [
  { id: 'todo',   label: 'للقيام به',    dot: 'var(--gold)'    },
  { id: 'doing',  label: 'جارٍ التنفيذ', dot: 'var(--accent3)' },
  { id: 'review', label: 'مراجعة',       dot: 'var(--pink)'    },
  { id: 'done',   label: 'منجز',         dot: 'var(--green)'   },
];

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  coral:  { color: 'var(--coral)',   bg: 'rgba(248,113,113,.12)' },
  blue:   { color: 'var(--accent3)', bg: 'rgba(56,189,248,.12)'  },
  purple: { color: 'var(--accent2)', bg: 'rgba(108,99,255,.12)'  },
  gold:   { color: 'var(--gold)',    bg: 'rgba(245,158,11,.12)'  },
  green:  { color: 'var(--green)',   bg: 'rgba(52,211,153,.12)'  },
  pink:   { color: 'var(--pink)',    bg: 'rgba(236,72,153,.12)'  },
};

const PRIORITY_ICON: Record<TaskPriority, string> = { high: '🔴', medium: '🟡', low: '🟢' };

// ── Toolbar ──────────────────────────────
type FilterMode = 'all' | 'urgent' | 'done';
type SortMode  = 'default' | 'priority' | 'ai';

function TasksToolbar({
  onAiPrioritize, filter, onFilter, sort, onSort,
}: {
  onAiPrioritize: () => void;
  filter: FilterMode; onFilter: (f: FilterMode) => void;
  sort: SortMode;   onSort:   (s: SortMode)   => void;
}) {
  const [view, setView] = useState('kanban');
  const { toast } = useToast();
  return (
    <>
      <ToolbarSection align="left">
        {[{ id: 'kanban', label: '📋 كانبان' }, { id: 'list', label: '☰ قائمة' }, { id: 'cal', label: '📅 تقويم' }].map(({ id, label }) => (
          <Button key={id} size="sm" variant={view === id ? 'accent' : 'ghost'}
            onClick={() => { setView(id); toast(label + '…'); }}>{label}</Button>
        ))}
        <ToolbarDivider />
        <Button size="sm" variant={filter === 'urgent' ? 'accent' : 'ghost'}
          onClick={() => onFilter(filter === 'urgent' ? 'all' : 'urgent')}>⭐ عاجل</Button>
        <Button size="sm" variant={filter === 'done' ? 'accent' : 'ghost'}
          onClick={() => onFilter(filter === 'done' ? 'all' : 'done')}>✅ مكتمل</Button>
        <ToolbarDivider />
        <Button size="sm" variant={sort !== 'default' ? 'accent' : 'ghost'}
          onClick={() => onSort(sort === 'default' ? 'priority' : sort === 'priority' ? 'ai' : 'default')}>
          ⇅ {sort === 'priority' ? 'أولوية' : sort === 'ai' ? 'AI' : 'ترتيب'}
        </Button>
      </ToolbarSection>
      <ToolbarSection align="right">
        <Button size="sm" variant="ghost" onClick={() => toast('تصدير Excel ✓')}>📊 تصدير</Button>
        <ToolbarDivider />
        <AiButton onClick={onAiPrioritize}>AI أولويات</AiButton>
      </ToolbarSection>
    </>
  );
}

// ── Main page ────────────────────────────
export default function TasksPage() {
  const { toast } = useToast();
  const { tasks: appTasks, addTask, updateTask, deleteTask: rmTask } = useApp();

  const columns: Record<TaskColumn, Task[]> = {
    todo: appTasks.filter(t => t.column === 'todo'),
    doing: appTasks.filter(t => t.column === 'doing'),
    review: appTasks.filter(t => t.column === 'review'),
    done: appTasks.filter(t => t.column === 'done'),
  };

  // Add Task Modal
  const [addOpen, setAddOpen]       = useState(false);
  const [addCol,  setAddCol]        = useState<TaskColumn>('todo');
  const [addTitle, setAddTitle]     = useState('');
  const [addPriority, setAddPriority] = useState<'high'|'medium'|'low'>('medium');
  const [addDate, setAddDate]       = useState('اليوم');

  // Filter & sort
  const [filter, setFilter] = useState<FilterMode>('all');
  const [sort,   setSort]   = useState<SortMode>('default');

  // Focus mode
  const [focusOpen, setFocusOpen] = useState(false);
  const [focusTask, setFocusTask] = useState('');
  const [timerSecs, setTimerSecs] = useState(25 * 60);
  const [running,   setRunning]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // DnD
  const dragRef = useRef<{ id: any; fromCol: TaskColumn } | null>(null);

  const totalTasks = Object.values(columns).flat().length;
  const doneTasks  = columns.done.length;
  const pct        = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const circumference = 113;
  const offset = circumference - (pct / 100) * circumference;

  function openAdd(col: TaskColumn) {
    setAddCol(col); setAddTitle(''); setAddPriority('medium'); setAddDate('اليوم');
    setAddOpen(true);
  }

  function confirmAdd() {
    const val = addTitle.trim();
    if (!val) return;
    const PRIORITY_AI: Record<string, number> = { high: 90, medium: 55, low: 25 };
    const task: Task = {
      id: Date.now() as any, title: val, tag: 'purple', tagLabel: 'جديد',
      priority: addPriority, aiScore: PRIORITY_AI[addPriority], date: addDate,
      assignee: 'أح', assigneeBg: 'rgba(108,99,255,.2)', assigneeColor: 'var(--accent2)',
      column: addCol,
    };
    addTask(task);
    setAddOpen(false);
    toast('✓ تم إضافة المهمة');
  }

  function deleteTask(id: any, col: TaskColumn) {
    rmTask(id.toString());
    toast('تم الحذف');
  }

  function onDragStart(id: any, col: TaskColumn) {
    dragRef.current = { id, fromCol: col };
  }
  function onDrop(toCol: TaskColumn) {
    if (!dragRef.current) return;
    const { id, fromCol } = dragRef.current;
    if (fromCol === toCol) { dragRef.current = null; return; }
    
    const task = columns[fromCol].find(t => t.id === id);
    if (!task) return;

    const payload: Partial<Task> = { column: toCol };
    if (toCol === 'done') { payload.aiScore = 100; payload.priority = 'low'; }
    updateTask(id.toString(), payload);

    toast(`تم النقل إلى "${COL_CONFIG.find(c => c.id === toCol)?.label}" ✓`);
    dragRef.current = null;
  }

  function aiPrioritize() {
    toast('✦ الذكاء الاصطناعي يعيد ترتيب الأولويات…');
    setTimeout(() => {
      toast('تم إعادة الترتيب حسب الأولوية الذكية ✓');
    }, 1200);
  }

  // Timer
  function toggleTimer() {
    if (running) {
      clearInterval(intervalRef.current!);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setTimerSecs(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            toast('⏱️ انتهى وقت التركيز!');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
  }
  function resetTimer(mins = 25) {
    clearInterval(intervalRef.current!);
    setRunning(false);
    setTimerSecs(mins * 60);
  }
  const timerDisplay = `${String(Math.floor(timerSecs / 60)).padStart(2, '0')}:${String(timerSecs % 60).padStart(2, '0')}`;

  return (
    <Shell
      topbarActions={
        <>
          <Button size="sm" onClick={() => toast('تصدير ✓')}>📤 تصدير</Button>
          <Button size="sm" onClick={() => toast('مشاركة مع الفريق ✓')}>👥 مشاركة</Button>
          <Button size="sm" onClick={() => { setFocusTask('مراجعة عقد العميل'); setFocusOpen(true); resetTimer(); }}>⏱️ تركيز</Button>
          <Button size="sm" variant="primary">✦ ترقية</Button>
        </>
      }
      toolbar={<TasksToolbar onAiPrioritize={aiPrioritize} filter={filter} onFilter={setFilter} sort={sort} onSort={setSort} />}
    >
      {/* Header */}
      <PageHeader
        icon="📋" iconBg="rgba(56,189,248,.12)"
        title="تتبع المهام الذكي"
        subtitle="اسحب وأفلت بين الأعمدة — الذكاء الاصطناعي يرتب أولوياتك تلقائياً"
        stats={[
          { num: String(totalTasks), label: 'إجمالي',    color: 'var(--accent2)' },
          { num: String(columns.todo.length),  label: 'للقيام', color: 'var(--gold)'    },
          { num: String(columns.doing.length), label: 'جارٍ',   color: 'var(--accent3)' },
          { num: String(doneTasks),  label: 'منجز',     color: 'var(--green)'   },
        ]}
      />

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', alignItems: 'start' }}>
        {COL_CONFIG
          .filter(col => filter === 'done' ? col.id === 'done' : true)
          .map(col => {
            let tasks = columns[col.id];
            if (filter === 'urgent') tasks = tasks.filter(t => t.priority === 'high');
            if (sort === 'priority') tasks = [...tasks].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]));
            if (sort === 'ai')       tasks = [...tasks].sort((a, b) => b.aiScore - a.aiScore);
            return (
              <KanbanColumn
                key={col.id}
                col={col}
                tasks={tasks}
                onOpenAdd={() => openAdd(col.id)}
                onDeleteTask={(id) => deleteTask(id, col.id)}
                onDragStart={(id) => onDragStart(id, col.id)}
                onDrop={() => onDrop(col.id)}
                onFocusTask={(title) => { setFocusTask(title); setFocusOpen(true); resetTimer(); }}
              />
            );
          })}
      </div>

      {/* Sidebar widgets (below kanban on narrow) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Progress ring */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <svg width="44" height="44" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="4" />
            <circle cx="22" cy="22" r="18" fill="none" stroke="var(--accent2)" strokeWidth="4"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round" transform="rotate(-90 22 22)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{doneTasks} من {totalTasks} مهام</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>{pct}% مكتمل</div>
          </div>
        </div>

        <AiPanel
          message="لديك مهمة عاجلة منذ يومين — أقترح تحريكها لـ «اليوم» وتخصيص 90 دقيقة لها."
          chips={[
            { label: '🎯 رتّب الأولويات', onClick: aiPrioritize },
            { label: '⏱️ ابدأ التركيز',   onClick: () => { setFocusTask('مراجعة عقد العميل'); setFocusOpen(true); resetTimer(); } },
            { label: '🔔 تذكيرات',         onClick: () => toast('تم جدولة التذكيرات ✓') },
          ]}
        />
      </div>

      {/* Focus Modal */}
      {focusOpen && (
        <div
          onClick={e => { if (e.target === e.currentTarget) { setFocusOpen(false); resetTimer(); } }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
            backdropFilter: 'blur(8px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '90%', position: 'relative' }}>
            <button onClick={() => { setFocusOpen(false); resetTimer(); }}
              style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent2)', marginBottom: '0.4rem' }}>⏱️ وضع التركيز — بومودورو</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>{focusTask}</div>
            <div style={{ fontFamily: 'var(--font-en)', fontSize: '3rem', fontWeight: 800, textAlign: 'center', color: 'var(--accent2)', margin: '1rem 0', letterSpacing: '0.05em' }}>{timerDisplay}</div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {[25, 50, 90].map(m => (
                <Button key={m} size="sm" onClick={() => resetTimer(m)}>{m} دق</Button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <Button variant="primary" style={{ padding: '0.55rem 1.5rem' }} onClick={toggleTimer}>
                {running ? '⏸ إيقاف' : '▶ ابدأ'}
              </Button>
              <Button onClick={() => resetTimer()}>↺ إعادة</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {addOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setAddOpen(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 20, padding: '1.8rem', width: 420, position: 'relative' }}>
            <button onClick={() => setAddOpen(false)}
              style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--muted)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem' }}>✚ إضافة مهمة جديدة</div>

            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>عنوان المهمة *</div>
            <input autoFocus value={addTitle} onChange={e => setAddTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmAdd()}
              placeholder="اكتب عنوان المهمة…"
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--text)', padding: '0.55rem 0.85rem', borderRadius: 10, fontFamily: 'var(--font-ar)', fontSize: '0.88rem', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />

            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>الأولوية</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {([['high','🔴 عالية','var(--coral)','rgba(248,113,113,.15)'], ['medium','🟡 متوسطة','var(--gold)','rgba(245,158,11,.12)'], ['low','🟢 منخفضة','var(--green)','rgba(52,211,153,.12)']] as const).map(([p, lbl, color, bg]) => (
                <button key={p} onClick={() => setAddPriority(p as 'high'|'medium'|'low')}
                  style={{ flex: 1, padding: '0.45rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-ar)', fontWeight: 600, border: `1px solid ${addPriority === p ? color : 'var(--border)'}`, background: addPriority === p ? bg : 'var(--bg3)', color: addPriority === p ? color : 'var(--muted)', transition: 'all .15s' }}>{lbl}</button>
              ))}
            </div>

            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.3rem' }}>العمود</div>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
              {COL_CONFIG.map(c => (
                <button key={c.id} onClick={() => setAddCol(c.id)}
                  style={{ flex: 1, padding: '0.38rem 0.3rem', borderRadius: 8, cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-ar)', border: `1px solid ${addCol === c.id ? c.dot : 'var(--border)'}`, background: addCol === c.id ? 'rgba(255,255,255,.05)' : 'var(--bg3)', color: addCol === c.id ? 'var(--text)' : 'var(--muted)', transition: 'all .15s' }}>{c.label}</button>
              ))}
            </div>

            <button onClick={confirmAdd}
              style={{ width: '100%', background: 'var(--accent)', border: 'none', color: '#fff', padding: '0.65rem', borderRadius: 10, fontFamily: 'var(--font-ar)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
              ✚ إضافة المهمة
            </button>
          </div>
        </div>
      )}
    </Shell>
  );
}

// ── Kanban Column ─────────────────────────
interface KanbanColumnProps {
  col: { id: TaskColumn; label: string; dot: string };
  tasks: Task[];
  onOpenAdd: () => void;
  onDeleteTask: (id: number) => void;
  onDragStart: (id: number) => void;
  onDrop: () => void;
  onFocusTask: (title: string) => void;
}

function KanbanColumn({ col, tasks, onOpenAdd, onDeleteTask, onDragStart, onDrop, onFocusTask }: KanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false);
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.dot }} />
          {col.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', background: 'var(--bg3)', padding: '0.1rem 0.45rem', borderRadius: 100, fontFamily: 'var(--font-en)' }}>{tasks.length}</div>
          <button onClick={onOpenAdd}
            style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(108,99,255,.15)', border: '1px solid rgba(108,99,255,.3)', color: 'var(--accent2)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(108,99,255,.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(108,99,255,.15)'; }}
          >+</button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        style={{ padding: '0.5rem', minHeight: 200, background: dragOver ? 'rgba(108,99,255,.04)' : 'transparent', transition: 'background 0.15s' }}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={() => { setDragOver(false); onDrop(); }}
      >
        {tasks.length === 0 && (
          <div onClick={onOpenAdd} style={{ border: '1.5px dashed var(--border)', borderRadius: 10, padding: '1.2rem', textAlign: 'center', color: 'var(--muted2)', fontSize: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted2)'; }}>
            + أضف مهمة
          </div>
        )}
        {tasks.map(task => (
          <TaskCard key={task.id} task={task}
            onDragStart={() => onDragStart(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onFocus={() => onFocusTask(task.title)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────
interface TaskCardProps {
  task: Task;
  onDragStart: () => void;
  onDelete: () => void;
  onFocus: () => void;
}

function TaskCard({ task, onDragStart, onDelete, onFocus }: TaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const tagColor = TAG_COLORS[task.tag] ?? TAG_COLORS.purple;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg3)', border: `1px solid ${hovered ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: 12, padding: '0.75rem 0.9rem', marginBottom: '0.5rem',
        cursor: 'grab', transition: 'all 0.18s', position: 'relative',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 4px 20px rgba(0,0,0,.3)' : 'none',
      }}
    >
      {/* AI score */}
      <div style={{ position: 'absolute', top: '0.55rem', left: '0.55rem', fontSize: '0.6rem', fontFamily: 'var(--font-en)', background: 'rgba(108,99,255,.15)', border: '1px solid rgba(108,99,255,.2)', color: 'var(--accent2)', padding: '0.08rem 0.4rem', borderRadius: 5, fontWeight: 600 }}>
        AI {task.aiScore}
      </div>

      {/* Title + priority */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.55rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 500, lineHeight: 1.45, flex: 1 }}>{task.title}</div>
        <div style={{ fontSize: '0.75rem', flexShrink: 0 }}>{PRIORITY_ICON[task.priority]}</div>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.62rem', padding: '0.12rem 0.5rem', borderRadius: 100, fontFamily: 'var(--font-en)', fontWeight: 600, background: tagColor.bg, color: tagColor.color, border: `1px solid ${tagColor.color}40` }}>
          {task.tagLabel}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--muted2)', fontFamily: 'var(--font-en)', marginRight: 'auto' }}>{task.date}</span>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: task.assigneeBg, color: task.assigneeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 700 }}>
          {task.assignee}
        </div>
        {task.column !== 'done' && (
          <button onClick={e => { e.stopPropagation(); onFocus(); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted2)', cursor: 'pointer', fontSize: '0.65rem', padding: '0.1rem' }}>
            ⏱️
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'transparent', border: 'none', color: 'var(--muted2)', cursor: 'pointer', fontSize: '0.65rem', padding: '0.1rem' }}>
          ✕
        </button>
      </div>
    </div>
  );
}
