import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import SplashScreen from './components/ui/SplashScreen';

// Lazy-load pages
const Meetings    = lazy(() => import('./pages/Meetings'));
const Invoices    = lazy(() => import('./pages/Invoices'));
const Tasks       = lazy(() => import('./pages/Tasks'));
const CvOptimizer = lazy(() => import('./pages/CvOptimizer'));
const Templates   = lazy(() => import('./pages/Templates'));
const Login       = lazy(() => import('./pages/Login'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Upgrade     = lazy(() => import('./pages/Upgrade'));
const Calendar    = lazy(() => import('./pages/Calendar'));

const TimeTrack = lazy(() => import('./pages/TimeTrack'));
const KpiDashboard = lazy(() => import('./pages/KpiDashboard'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Catalog = lazy(() => import('./pages/Catalog'));
const CompetitorMonitor = lazy(() => import('./pages/CompetitorMonitor'));
const SuppliersMap = lazy(() => import('./pages/SuppliersMap'));

function Loading() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg)', gap: 20,
    }}>
      <svg width="80" height="80" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>{`
          @keyframes spin-outer  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
          @keyframes spin-inner  { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
          @keyframes pulse-hub   { 0%,100% { opacity:1; } 50% { opacity:.5; } }
          @keyframes fade-spoke  { 0%,100% { opacity:.25; } 50% { opacity:1; } }
          .outer-ring { transform-origin: 32px 32px; animation: spin-outer 3s linear infinite; }
          .inner-ring { transform-origin: 32px 32px; animation: spin-inner 2s linear infinite; }
          .hub-dot    { animation: pulse-hub 1.5s ease-in-out infinite; }
          .s1 { animation: fade-spoke 1.5s ease-in-out infinite 0s;    }
          .s2 { animation: fade-spoke 1.5s ease-in-out infinite 0.25s; }
          .s3 { animation: fade-spoke 1.5s ease-in-out infinite 0.5s;  }
          .s4 { animation: fade-spoke 1.5s ease-in-out infinite 0.75s; }
          .s5 { animation: fade-spoke 1.5s ease-in-out infinite 1s;    }
          .s6 { animation: fade-spoke 1.5s ease-in-out infinite 1.25s; }
        `}</style>

        {/* Outer ring — spins clockwise */}
        <g className="outer-ring">
          <circle cx="32" cy="32" r="29" stroke="#FCF5EB" strokeWidth="2" fill="none" strokeOpacity="0.2"/>
          <circle cx="32"  cy="3"    r="2.5" fill="#FCF5EB" fillOpacity="0.35"/>
          <circle cx="57"  cy="17.5" r="2.5" fill="#FCF5EB" fillOpacity="0.35"/>
          <circle cx="57"  cy="46.5" r="2.5" fill="#FCF5EB" fillOpacity="0.35"/>
          <circle cx="32"  cy="61"   r="2.5" fill="#FCF5EB" fillOpacity="0.35"/>
          <circle cx="7"   cy="46.5" r="2.5" fill="#FCF5EB" fillOpacity="0.35"/>
          <circle cx="7"   cy="17.5" r="2.5" fill="#FCF5EB" fillOpacity="0.35"/>
        </g>

        {/* Inner ring — spins counter-clockwise */}
        <g className="inner-ring">
          <circle cx="32" cy="32" r="18.5" stroke="#D7641C" strokeWidth="2.2" fill="none"/>
          <circle cx="32"   cy="13.5" r="3.2" fill="#D7641C" className="s1"/>
          <circle cx="49.6" cy="23"   r="3.2" fill="#EB8C3C" className="s2"/>
          <circle cx="49.6" cy="41"   r="3.2" fill="#D7641C" className="s3"/>
          <circle cx="32"   cy="50.5" r="3.2" fill="#EB8C3C" className="s4"/>
          <circle cx="14.4" cy="41"   r="3.2" fill="#D7641C" className="s5"/>
          <circle cx="14.4" cy="23"   r="3.2" fill="#EB8C3C" className="s6"/>
        </g>

        {/* Spokes */}
        <line x1="32"  y1="26.5" x2="32"   y2="14"   stroke="#D7641C" strokeWidth="1.8" strokeLinecap="round" className="s1"/>
        <line x1="36.3" y1="29.5" x2="47.6" y2="23"  stroke="#EB8C3C" strokeWidth="1.8" strokeLinecap="round" className="s2"/>
        <line x1="36.3" y1="34.5" x2="47.6" y2="41"  stroke="#D7641C" strokeWidth="1.8" strokeLinecap="round" className="s3"/>
        <line x1="32"   y1="37.5" x2="32"   y2="50"  stroke="#EB8C3C" strokeWidth="1.8" strokeLinecap="round" className="s4"/>
        <line x1="27.7" y1="34.5" x2="16.4" y2="41"  stroke="#D7641C" strokeWidth="1.8" strokeLinecap="round" className="s5"/>
        <line x1="27.7" y1="29.5" x2="16.4" y2="23"  stroke="#EB8C3C" strokeWidth="1.8" strokeLinecap="round" className="s6"/>

        {/* Hub */}
        <circle cx="32" cy="32" r="5.5" fill="#1C2337"/>
        <circle cx="32" cy="32" r="3.2" fill="#D7641C" className="hub-dot"/>
      </svg>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)',  fontFamily: 'Tajawal, sans-serif' }}>Work</span>
        <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#D7641C',      fontFamily: 'Tajawal, sans-serif' }}>Hub</span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#D7641C', opacity: 0.4,
            animation: 'fade-spoke 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}/>
        ))}
      </div>
    </div>
  );
}

// Auth guard — redirects to /login if not authenticated
function PrivateRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/meetings" replace />} />
      <Route path="/meetings"  element={<Meetings />} />
      <Route path="/invoices"  element={<Invoices />} />
      <Route path="/tasks"     element={<Tasks />} />
      <Route path="/cv"        element={<CvOptimizer />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/upgrade"   element={<Upgrade />} />
      <Route path="/calendar"  element={<Calendar />} />
      <Route path="/timetrack" element={<TimeTrack />} />
      <Route path="/kpi"       element={<KpiDashboard />} />
      <Route path="/chatbot"   element={<Chatbot />} />
      <Route path="/catalog"   element={<Catalog />} />
      <Route path="/monitor"   element={<CompetitorMonitor />} />
      <Route path="/suppliers" element={<SuppliersMap />} />
      <Route path="*" element={<Navigate to="/meetings" replace />} />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      <AppProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
            <BrowserRouter>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/*"     element={<PrivateRoutes />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </div>
        )}
      </AppProvider>
    </AuthProvider>
  );
}
