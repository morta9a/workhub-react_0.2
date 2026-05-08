import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import workhubIcon from '../svg/workhub-icon.svg';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Force Light Theme for Portfolio look
  useEffect(() => {
    document.body.setAttribute('data-theme', 'light');
    return () => document.body.removeAttribute('data-theme');
  }, []);

  // Handle scroll for navbar
  useEffect(() => {
    // Instead of window.scrollY, we need to listen to the scroll of the container
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrolled(target.scrollTop > 20);
    };
    const container = document.getElementById('landing-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Handle horizontal scrolling with mouse wheel for the slider
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      }
    };
    slider.addEventListener('wheel', handleWheel, { passive: false });
    return () => slider.removeEventListener('wheel', handleWheel);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginClick = () => {
    if (user) navigate('/meetings');
    else navigate('/login');
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 350;
      sliderRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="landing-container" className="portfolio-bg-cream" style={{ height: '100vh', overflowY: 'auto', fontFamily: 'var(--font-ar)', direction: 'rtl', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: scrolled ? 'rgba(253, 245, 236, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        padding: scrolled ? '15px 0' : '25px 0'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
            <img src={workhubIcon} alt="WorkHub" style={{ width: 35, height: 35 }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1a1a1a', fontFamily: 'var(--font-en)' }}>WorkHub</span>
          </div>

          <div className="landing-nav-links" style={{ display: 'flex', gap: '2rem', fontWeight: 600, color: '#555' }}>
            <span onClick={() => scrollTo('hero')} style={{ cursor: 'pointer' }}>الرئيسية</span>
            <span onClick={() => scrollTo('services')} style={{ cursor: 'pointer' }}>الخدمات</span>
            <span onClick={() => scrollTo('tech')} style={{ cursor: 'pointer' }}>التقنيات</span>
            <span onClick={() => scrollTo('contact')} style={{ cursor: 'pointer' }}>تواصل معنا</span>
          </div>

          <button onClick={handleLoginClick} className="portfolio-pill-btn">
            {user ? 'لوحة التحكم' : 'سجل الآن'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" style={{ paddingTop: 140, paddingBottom: 60, paddingLeft: '2rem', paddingRight: '2rem' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          
          {/* Text Content */}
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2, marginBottom: '1rem' }}>
              مرحباً، نحن منصة <br /> <span style={{ color: '#f08c3e' }}>WorkHub.</span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: 600 }}>
              شغفنا هو بناء تجارب مستخدم استثنائية وإدارة أعمالك بذكاء. نظام متكامل يجمع كل ما تحتاجه في مكان واحد.
            </p>
            <button onClick={handleLoginClick} className="portfolio-pill-btn" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
              سجل الآن
            </button>
          </div>
        </div>
      </section>

      {/* Services Carousel Section */}
      <section id="services" style={{ padding: '6rem 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: 30, height: 2, background: '#f08c3e' }}></div>
            <span style={{ color: '#f08c3e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Services</span>
            <div style={{ width: 30, height: 2, background: '#f08c3e' }}></div>
          </div>
          <h2 style={{ fontSize: '3rem', fontWeight: 900, color: '#1a1a1a', textAlign: 'center' }}>بعض الخدمات التي نقدمها</h2>
        </div>

        {/* Carousel Slider */}
        <div ref={sliderRef} className="portfolio-card-slider fade-in-3">
          {[
            { id: 1, title: 'إدارة الفواتير', desc: 'إنشاء وإدارة فواتير احترافية ومتابعة المدفوعات بسهولة تامة.', icon: '📄', bg: 'linear-gradient(135deg, #e6f0ff, #cce0ff)', tags: ['مالية', 'تقارير'] },
            { id: 2, title: 'جدولة الاجتماعات', desc: 'تنظيم مواعيد فريقك وتوثيق محاضر الاجتماعات في مكان واحد.', icon: '👥', bg: 'linear-gradient(135deg, #e6ffe6, #ccffcc)', tags: ['تنظيم', 'أدوات'] },
            { id: 3, title: 'إدارة المهام', desc: 'توزيع المهام بذكاء ومتابعة الإنجاز مع تحليلات دقيقة.', icon: '✓', bg: 'linear-gradient(135deg, #ffe6e6, #ffcccc)', tags: ['إنتاجية', 'فريق'] },
            { id: 4, title: 'محسن السير الذاتية', desc: 'أداة ذكية لتحليل وتقييم السير الذاتية باستخدام الذكاء الاصطناعي.', icon: '🧠', bg: 'linear-gradient(135deg, #fff0e6, #ffd6cc)', tags: ['AI', 'توظيف'] },
            { id: 5, title: 'لوحة المؤشرات', desc: 'متابعة مؤشرات الأداء الرئيسية بلمحة بصر لدعم اتخاذ القرار.', icon: '📊', bg: 'linear-gradient(135deg, #f0e6ff, #dcc6ff)', tags: ['تحليل', 'KPI'] },
          ].map(srv => (
            <div key={srv.id} className="portfolio-project-card">
              <div className="portfolio-card-image" style={{ background: srv.bg }}>
                {srv.icon}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px' }}>{srv.title}</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                {srv.tags.map(t => (
                  <span key={t} style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#f5f5f5', borderRadius: 12, color: '#666', fontWeight: 600 }}>{t}</span>
                ))}
              </div>
              <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.6, flexGrow: 1, marginBottom: '20px' }}>
                {srv.desc}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ flex: 1, padding: '12px', borderRadius: '50px', border: 'none', background: '#f08c3e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>عاين الخدمة</button>
                <button style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: '#f5f5f5', color: '#666', fontWeight: 700, cursor: 'pointer' }}>&lt;/&gt;</button>
              </div>
            </div>
          ))}
        </div>
        
      </section>

      {/* Tech / Skills Section */}
      <section id="tech" className="portfolio-bg-tech" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          {/* Tech Stats */}
          <div className="portfolio-tech-panel fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>⚙️</div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#88c0d0' }}>System Core</h3>
                <p style={{ fontSize: '0.9rem', color: '#d8dee9' }}>v0.2.1 Stable</p>
              </div>
            </div>

            <h4 style={{ color: '#8fbcbb', letterSpacing: 2, fontSize: '0.85rem', marginBottom: '15px' }}>PERFORMANCE</h4>
            
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#eceff4' }}>
                <span>Processing Speed</span> <span>98%</span>
              </div>
              <div className="portfolio-skill-bar"><div className="portfolio-skill-fill" style={{ width: '98%' }}></div></div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#eceff4' }}>
                <span>Data Sync</span> <span>92%</span>
              </div>
              <div className="portfolio-skill-bar"><div className="portfolio-skill-fill" style={{ width: '92%' }}></div></div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#eceff4' }}>
                <span>AI Efficiency</span> <span>85%</span>
              </div>
              <div className="portfolio-skill-bar"><div className="portfolio-skill-fill" style={{ width: '85%' }}></div></div>
            </div>
          </div>

          {/* Graphic / Description */}
          <div className="fade-in-2" style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', color: '#ffffff' }}>تقنيات حديثة لبناء المستقبل</h2>
            <p style={{ fontSize: '1.1rem', color: '#d8dee9', lineHeight: 1.8, marginBottom: '2rem' }}>
              نعتمد في WorkHub على أحدث التقنيات البرمجية لتوفير بيئة عمل آمنة، سريعة، ومستقرة. بفضل استخدامنا لبرمجيات متقدمة، نضمن لك مزامنة بيانات لحظية وتحليلات دقيقة خالية من التأخير.
            </p>
            <button className="portfolio-pill-btn" style={{ background: 'transparent', border: '2px solid #88c0d0', color: '#88c0d0' }}>
              اكتشف المزيد
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '6rem 2rem', background: '#fdf5ec' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
          
          {/* Form */}
          <div className="fade-in" style={{ background: 'rgba(255,255,255,0.5)', padding: '40px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: 20, height: 2, background: '#f08c3e' }}></div>
              <span style={{ color: '#f08c3e', fontWeight: 600, fontSize: '0.9rem' }}>Say hello 👋</span>
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: '2rem' }}>تواصل معنا</h2>
            
            <input type="text" placeholder="الاسم" className="portfolio-contact-input" />
            <input type="email" placeholder="البريد الإلكتروني" className="portfolio-contact-input" />
            <textarea placeholder="رسالتك" className="portfolio-contact-input" rows={4} style={{ resize: 'vertical' }}></textarea>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px', color: '#aaa', fontSize: '1.2rem' }}>
                <span>📱</span> <span>📧</span> <span>🔗</span>
              </div>
              <button className="portfolio-pill-btn" style={{ padding: '12px 30px' }}>Submit</button>
            </div>
          </div>

          {/* Logo Animation */}
          <div className="fade-in-2" style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src={workhubIcon} 
              alt="WorkHub Logo" 
              style={{ 
                width: 250, 
                height: 250, 
                filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.1))',
                animation: 'spin 20s linear infinite' 
              }} 
            />
            <style>
              {\`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              \`}
            </style>
          </div>
        </div>
      </section>

    </div>
  );
}
