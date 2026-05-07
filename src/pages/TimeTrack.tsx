import React, { useState, useEffect } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardHeader, CardBody } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

import type { TimeSession } from '../types';

// Types for Attendance
interface AttendanceRecord {
  id: number;
  employee: string;
  checkIn: string;
  checkOut: string | null;
  duration: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  avatar: string;
}

interface BiometricDevice {
  id: number;
  name: string;
  type: 'ZKTeco' | 'Hikvision' | 'Suprema';
  ip: string;
  status: 'online' | 'offline';
  lastSync: string;
  usersCount: number;
}

const ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 1, employee: 'أحمد المطوّر', avatar: 'أح', checkIn: '08:02 ص', checkOut: '04:30 م', duration: '8h 28m', status: 'present' },
  { id: 2, employee: 'سارة علي', avatar: 'سا', checkIn: '08:45 ص', checkOut: '05:00 م', duration: '8h 15m', status: 'late' },
  { id: 3, employee: 'محمد جاسم', avatar: 'مح', checkIn: '08:10 ص', checkOut: null, duration: '6h 50m (حتى الآن)', status: 'present' },
  { id: 4, employee: 'ليلى كمال', avatar: 'لي', checkIn: '-', checkOut: '-', duration: '-', status: 'absent' },
  { id: 5, employee: 'ياسين فؤاد', avatar: 'يا', checkIn: '-', checkOut: '-', duration: '-', status: 'excused' },
];

const BIOMETRIC_DEVICES: BiometricDevice[] = [
  { id: 1, name: 'بوابة المدخل الرئيسي', type: 'ZKTeco', ip: '192.168.1.44', status: 'online', lastSync: 'منذ دقيقتين', usersCount: 125 },
  { id: 2, name: 'مكتب الإدارة (الطابق 2)', type: 'Hikvision', ip: '192.168.1.89', status: 'online', lastSync: 'منذ ساعة', usersCount: 18 },
  { id: 3, name: 'جهاز الفرع البصري', type: 'ZKTeco', ip: '10.0.5.12', status: 'offline', lastSync: 'أمس 06:00 م', usersCount: 45 },
];

export default function TimeTrack() {
  const { toast } = useToast();
  // (setSavedInvoices was removed)
  const [activeTab, setActiveTab] = useState<'manual' | 'biometric'>('manual');
  
  // Biometric States
  const [devices, setDevices] = useState<BiometricDevice[]>(BIOMETRIC_DEVICES);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'ZKTeco' | 'Hikvision' | 'Suprema'>('ZKTeco');
  const [newDeviceIp, setNewDeviceIp] = useState('');
  const [editingDeviceId, setEditingDeviceId] = useState<number | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(ATTENDANCE_RECORDS);

  useEffect(() => {
    async function fetchAttendanceLogs() {
      try {
        const { data, error } = await supabase
          .from('attendance_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(20);
          
        if (data && data.length > 0) {
          const mappedLogs = data.map(log => ({
            id: log.id,
            employee: log.employee_name,
            avatar: log.employee_name.substring(0, 2),
            checkIn: new Date(log.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
            checkOut: null,
            duration: '-',
            status: log.status as any
          }));
          setAttendanceRecords(mappedLogs);
        }
      } catch (err) {
        console.error('Error fetching attendance logs:', err);
      }
    }
    
    // Fetch logs when tab changes to biometric
    if (activeTab === 'biometric') {
      fetchAttendanceLogs();
    }
  }, [activeTab]);

  // Timer States
  const { timeSessions: sessions, addTimeSession, deleteTimeSession, lang, t } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [activeDuration, setActiveDuration] = useState(0);
  const [activeTitle, setActiveTitle] = useState('');
  const [activeProject, setActiveProject] = useState('عام');
  const [activeRate, setActiveRate] = useState(25000);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Manual Entry Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mProject, setMProject] = useState('عام');
  const [mRate, setMRate] = useState(25000);
  const [mDate, setMDate] = useState('2026-04-28');
  const [mStart, setMStart] = useState('09:00');
  const [mEnd, setMEnd] = useState('17:00');

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setActiveDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatHHMM = (date: Date) => {
    let h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12 || 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleToggleTimer = () => {
    if (isRunning) {
      if (activeDuration > 60) {
        const newSession: TimeSession = {
          id: Date.now().toString() as any,
          title: activeTitle || t('مهمة بدون اسم', 'Untitled Task'),
          project: activeProject,
          date: lang === 'ar' ? '28 أبريل' : 'April 28',
          startTime: startTime ? formatHHMM(startTime) : '12:00 ص',
          endTime: formatHHMM(new Date()),
          durationSecs: activeDuration,
          hourlyRate: activeRate,
          billed: false
        };
        addTimeSession(newSession);
        toast(t('🛑 تم حفظ الجلسة', '🛑 Session saved'));
      } else {
        toast(t('⚠️ تم إلغاء الجلسة (أقل من دقيقة)', '⚠️ Session cancelled (< 1m)'));
      }
      setIsRunning(false);
      setActiveDuration(0);
      setActiveTitle('');
      setStartTime(null);
    } else {
      setIsRunning(true);
      setStartTime(new Date());
      toast(t('⏱️ بدأ المؤقت', '⏱️ Timer started'));
    }
  };

  const handleSaveManual = () => {
    if (!mTitle) {
      toast(t('⚠️ يرجى إدخال اسم المهمة', '⚠️ Please enter task name'));
      return;
    }
    const newSession: TimeSession = {
      id: Date.now().toString() as any,
      title: mTitle,
      project: mProject,
      date: mDate,
      startTime: mStart,
      endTime: mEnd,
      durationSecs: 7200, // dummy
      hourlyRate: mRate,
      billed: false
    };
    addTimeSession(newSession);
    toast(t('✅ تم إضافة الوقت يدوياً بنجاح', '✅ Time added manually'));
    setShowManualModal(false);
  };

  const handleExportPDF = () => {
    toast(t('📑 تم تصدير سجل الحضور في ملف PDF بنجاح!', '📑 Attendance exported to PDF!'));
  };

  const handleSaveDevice = () => {
    if (!newDeviceName || !newDeviceIp) {
      toast(t('⚠️ يرجى إدخال اسم الجهاز وعنوان IP الخاص به', '⚠️ Please enter device name and IP'));
      return;
    }
    
    if (editingDeviceId) {
      setDevices(devices.map(d => d.id === editingDeviceId ? { ...d, name: newDeviceName, type: newDeviceType, ip: newDeviceIp } : d));
      toast(t('✅ تم تحديث بيانات الجهاز بنجاح!', '✅ Device updated successfully!'));
    } else {
      const newDevice: BiometricDevice = {
        id: Date.now(),
        name: newDeviceName,
        type: newDeviceType,
        ip: newDeviceIp,
        status: 'online',
        lastSync: 'الآن',
        usersCount: 0
      };
      setDevices([...devices, newDevice]);
      toast(t('🔌 تم إضافة الجهاز بنجاح!', '🔌 Device added successfully!'));
    }
    closeDeviceModal();
  };

  const closeDeviceModal = () => {
    setShowAddDeviceModal(false);
    setNewDeviceName('');
    setNewDeviceIp('');
    setEditingDeviceId(null);
  };

  const handleEditDevice = (device: BiometricDevice) => {
    setEditingDeviceId(device.id);
    setNewDeviceName(device.name);
    setNewDeviceType(device.type);
    setNewDeviceIp(device.ip);
    setShowAddDeviceModal(true);
  };

  const handleDeleteDevice = (id: number) => {
    if (window.confirm(t('هل أنت متأكد من حذف هذا الجهاز من النظام؟', 'Are you sure you want to delete this device?'))) {
      setDevices(devices.filter(d => d.id !== id));
      toast(t('🗑️ تم حذف الجهاز بنجاح', '🗑️ Device deleted successfully'));
    }
  };

  const totalSecsToday = sessions.reduce((acc, curr) => acc + curr.durationSecs, 0) + activeDuration;

  return (
    <Shell
      topbarActions={
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg3)', 
            padding: '0.25rem', 
            borderRadius: '100px',
            border: '1px solid var(--border)'
          }}>
            <button 
              onClick={() => setActiveTab('manual')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '100px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'manual' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'manual' ? '#fff' : 'var(--muted)',
                transition: 'all 0.2s'
              }}
            >{t('⏱️ مؤقت يدوي', '⏱️ Manual Timer')}</button>
            <button 
              onClick={() => setActiveTab('biometric')}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '100px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === 'biometric' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'biometric' ? '#fff' : 'var(--muted)',
                transition: 'all 0.2s'
              }}
            >{t('👆 بصمة الحضور', '👆 Biometric Attendance')}</button>
          </div>
          {activeTab === 'manual' && (
            <Button variant="ghost" size="sm" onClick={() => setShowManualModal(true)}>{t('➕ إضافة يدوية', '➕ Add Manually')}</Button>
          )}
        </div>
      }
    >
      <PageHeader
        icon={activeTab === 'manual' ? '⏱️' : '👆'}
        iconBg={activeTab === 'manual' ? 'rgba(52,211,153,.12)' : 'rgba(210,95,30,.12)'}
        title={activeTab === 'manual' ? t('ساعات العمل', 'Work Hours') : t('بصمة الحضور', 'Attendance')}
        subtitle={activeTab === 'manual' 
          ? t('تتبع أوقات عملك بدقة للحصول على تقارير تفصيلية وإنشاء الفواتير', 'Track your work hours accurately for detailed reports and billing')
          : t('مراقبة سجلات الدخول والخروج عبر أجهزة البصمة', 'Monitor check-in/out records via Biometric devices')}
        stats={activeTab === 'manual' ? [
          { num: formatTime(totalSecsToday), label: t('إجمالي اليوم', 'Today Total'), color: 'var(--green)' },
          { num: '32:15:00', label: t('إجمالي الأسبوع', 'Week Total'), color: 'var(--accent2)' },
        ] : [
          { num: '125', label: t('إجمالي الموظفين', 'Total Employees'), color: 'var(--accent)' },
          { num: '85%', label: t('نسبة الحضور', 'Attendance Rate'), color: 'var(--green)' },
        ]}
      />

      {activeTab === 'manual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
          {/* Manual Timer Content */}
          <Card style={{ border: isRunning ? '2px solid var(--accent)' : '1px solid var(--border)', transition: 'all 0.3s' }}>
            <CardBody style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
                <input 
                  type="text" 
                  value={activeTitle}
                  onChange={e => setActiveTitle(e.target.value)}
                  placeholder={t('ماذا تفعل الآن؟', 'What are you working on?')}
                  disabled={isRunning}
                  style={{ flex: 2, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                />
                <select
                  value={activeProject}
                  onChange={e => setActiveProject(e.target.value)}
                  disabled={isRunning}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
                >
                  <option value={t('عام', 'General')}>{t('عام', 'General')}</option>
                  <option value={t('تطبيق الإدارة', 'Management App')}>{t('تطبيق الإدارة', 'Management App')}</option>
                  <option value={t('موقع شركة الأفق', 'Horizon Co. Website')}>{t('موقع شركة الأفق', 'Horizon Co. Website')}</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ 
                  fontFamily: 'monospace', fontSize: '2.5rem', fontWeight: 'bold', 
                  color: isRunning ? 'var(--accent)' : 'var(--text)',
                  textShadow: isRunning ? '0 0 10px rgba(210,95,30,.3)' : 'none'
                }}>
                  {formatTime(activeDuration)}
                </div>
                <Button 
                  variant={isRunning ? 'ghost' : 'primary'} 
                  style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
                  onClick={handleToggleTimer}
                >
                  {isRunning ? t('إيقاف 🛑', 'Stop 🛑') : t('بدء ⏱️', 'Start ⏱️')}
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('سجل العمل (اليوم)', 'Work Log (Today)')} />
            <CardBody>
              {sessions.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem',
                  borderBottom: '1px solid var(--border)', background: 'var(--bg3)', borderRadius: 12, marginBottom: '0.5rem'
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>📁 {s.project} • 🕒 {s.startTime} - {s.endTime}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800 }}>{formatTime(s.durationSecs)}</div>
                    <Button variant="ghost" size="sm" onClick={() => deleteTimeSession(s.id.toString())}>{t('حذف', 'Delete')}</Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.2rem' }}>
          {/* Biometric Attendance Content */}
          <Card>
            <CardHeader 
              title={t('سجل الحضور اليومي', 'Daily Attendance Log')}
              subtitle={t('مزامنة فورية من أجهزة البصمة', 'Instant sync from Biometric devices')}
              actions={<Button variant="ghost" size="sm" onClick={handleExportPDF}>{t('تصدير PDF 📑', 'Export PDF 📑')}</Button>}
            />
            <CardBody style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'start', fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--bg2)' }}>
                    <th style={{ padding: '1rem' }}>{t('الموظف', 'Employee')}</th>
                    <th style={{ padding: '1rem' }}>{t('وقت الدخول', 'Check In')}</th>
                    <th style={{ padding: '1rem' }}>{t('وقت الخروج', 'Check Out')}</th>
                    <th style={{ padding: '1rem' }}>{t('المدة', 'Duration')}</th>
                    <th style={{ padding: '1rem' }}>{t('الحالة', 'Status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{r.avatar}</div>
                        <span style={{ fontWeight: 600 }}>{r.employee}</span>
                      </td>
                      <td style={{ padding: '1rem', fontFamily: 'var(--font-en)' }}>{r.checkIn}</td>
                      <td style={{ padding: '1rem', fontFamily: 'var(--font-en)' }}>{r.checkOut || '-'}</td>
                      <td style={{ padding: '1rem', fontFamily: 'var(--font-en)' }}>{r.duration}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: 100,
                          background: r.status === 'present' ? 'rgba(62,201,139,0.1)' : 
                                     r.status === 'late' ? 'rgba(255,185,80,0.1)' : 
                                     r.status === 'absent' ? 'rgba(240,90,90,0.1)' : 'rgba(56,189,239,0.1)',
                          color: r.status === 'present' ? 'var(--green)' : 
                                 r.status === 'late' ? 'var(--gold)' : 
                                 r.status === 'absent' ? 'var(--coral)' : 'var(--sky)'
                        }}>
                          {r.status === 'present' ? t('حاضر', 'Present') : r.status === 'late' ? t('متأخر', 'Late') : r.status === 'absent' ? t('غائب', 'Absent') : t('إجازة', 'Excused')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Devices Status */}
            <Card>
              <CardHeader title={t('الأجهزة المتصلة', 'Connected Devices')} actions={<Button variant="accent" size="sm" onClick={() => setShowAddDeviceModal(true)}>{t('إضافة جهاز 🔌', 'Add Device 🔌')}</Button>} />
              <CardBody>
                {devices.map(d => (
                  <div key={d.id} style={{
                    padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg3)', marginBottom: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {d.name}
                        <button onClick={() => handleEditDevice(d)} style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }} title="تعديل">✏️</button>
                        <button onClick={() => handleDeleteDevice(d.id)} style={{ background: 'transparent', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }} title="حذف">✖</button>
                      </div>
                      <div style={{ 
                        fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.5rem', borderRadius: 100,
                        background: d.status === 'online' ? 'rgba(62,201,139,0.1)' : 'rgba(240,90,90,0.1)',
                        color: d.status === 'online' ? 'var(--green)' : 'var(--coral)'
                      }}>{d.status === 'online' ? t('متصل', 'Online') : t('منقطع', 'Offline')}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <span>📟 {d.type}</span>
                      <span>🌐 {d.ip}</span>
                      <span>🔄 {d.lastSync}</span>
                      <span>👥 {d.usersCount} {t('موظف', 'Employees')}</span>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            {/* Quick Summary Chart placeholder */}
            <Card>
              <CardHeader title={t('الحضور الأسبوعي', 'Weekly Attendance')} />
              <CardBody>
                <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: '0.8rem', padding: '0 1rem' }}>
                  {[45, 60, 55, 80, 75, 40, 20].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--accent)', borderRadius: '4px 4px 0 0', opacity: 0.6 + (h/200) }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                  <span>{t('أحد', 'Sun')}</span><span>{t('اثنين', 'Mon')}</span><span>{t('ثلاثاء', 'Tue')}</span><span>{t('أربعاء', 'Wed')}</span><span>{t('خميس', 'Thu')}</span><span>{t('جمعة', 'Fri')}</span><span>{t('سبت', 'Sat')}</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {showManualModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 18, border: '1px solid var(--border)', width: 420, padding: '1.8rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>{t('إضافة وقت يدوياً', 'Add Time Manually')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder={t('اسم المهمة', 'Task Name')} style={{ padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="time" defaultValue="09:00" style={{ flex: 1, padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }} />
                <input type="time" defaultValue="17:00" style={{ flex: 1, padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <Button variant="primary" style={{ flex: 1 }} onClick={handleSaveManual}>{t('حفظ 💾', 'Save 💾')}</Button>
                <Button variant="ghost" onClick={() => setShowManualModal(false)}>{t('إلغاء', 'Cancel')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddDeviceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 18, border: '1px solid var(--border)', width: 420, padding: '1.8rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>{editingDeviceId ? t('تعديل بيانات الجهاز', 'Edit Device') : t('إضافة جهاز بصمة جديد', 'Add Biometric Device')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                type="text" 
                value={newDeviceName}
                onChange={e => setNewDeviceName(e.target.value)}
                placeholder={t('اسم وموقع الجهاز (مثال: مدخل الإدارة)', 'Device Name & Location (e.g. Main Gate)')} 
                style={{ padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }} 
              />
              <select 
                value={newDeviceType}
                onChange={e => setNewDeviceType(e.target.value as 'ZKTeco' | 'Hikvision' | 'Suprema')}
                style={{ padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }}
              >
                <option value="ZKTeco">ZKTeco</option>
                <option value="Hikvision">Hikvision</option>
                <option value="Suprema">Suprema</option>
              </select>
              <input 
                type="text" 
                value={newDeviceIp}
                onChange={e => setNewDeviceIp(e.target.value)}
                placeholder={t('عنوان IP الخاص بالجهاز (مثال: 192.168.1.50)', 'Device IP Address (e.g. 192.168.1.50)')} 
                style={{ padding: '0.8rem', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg2)', color: 'var(--text)' }} 
              />
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem' }}>
                <Button variant="accent" style={{ flex: 1 }} onClick={handleSaveDevice}>{editingDeviceId ? t('حفظ التعديلات 💾', 'Save Changes 💾') : t('إضافة 🔌', 'Add 🔌')}</Button>
                <Button variant="ghost" onClick={closeDeviceModal}>{t('إلغاء', 'Cancel')}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
