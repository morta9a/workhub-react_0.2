import React, { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mainSvgRef = useRef<SVGSVGElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let running = true;
    let particles: any[] = [];
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D;
    const stage = stageRef.current as HTMLDivElement;
    const wrap = wrapRef.current as HTMLDivElement;
    const mainSvg = mainSvgRef.current as SVGSVGElement;
    const textWrap = textWrapRef.current as HTMLDivElement;

    if (!ctx || !stage || !wrap || !mainSvg || !textWrap || !canvas) return;

    // Helper functions
    const setWrap = (tx: number, ty: number, sc: number, rz: number) => {
      wrap.style.transform = `translate(${tx}px,${ty}px) scale(${sc}) rotate(${rz}deg)`;
    };
    const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOut5 = (t: number) => 1 - Math.pow(1 - t, 5);
    const easeInOut = (t: number) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const growCircle = (id: string | Element, cx: number, cy: number, rFinal: number, startMs: number, dur: number) => {
      return new Promise<void>(res => {
        setTimeout(() => {
          if (!running) return res();
          const el = typeof id === 'string' ? document.getElementById(id) : id;
          if (!el) return res();
          el.setAttribute('opacity', '1');
          let t0: number | null = null;
          function step(ts: number) {
            if (!running) return res();
            if (!t0) t0 = ts;
            const t = Math.min((ts - t0) / dur, 1);
            el!.setAttribute('r', (rFinal * easeOut3(t)).toString());
            el!.setAttribute('cx', cx.toString());
            el!.setAttribute('cy', cy.toString());
            if (t < 1) requestAnimationFrame(step); else res();
          }
          requestAnimationFrame(step);
        }, startMs);
      });
    };

    const growLine = (id: string, x1: number, y1: number, x2: number, y2: number, startMs: number, dur: number) => {
      return new Promise<void>(res => {
        setTimeout(() => {
          if (!running) return res();
          const el = document.getElementById(id);
          if (!el) return res();
          el.setAttribute('opacity', '1');
          let t0: number | null = null;
          function step(ts: number) {
            if (!running) return res();
            if (!t0) t0 = ts;
            const t = Math.min((ts - t0) / dur, 1);
            const e = easeOut5(t);
            el!.setAttribute('x1', x1.toString());
            el!.setAttribute('y1', y1.toString());
            el!.setAttribute('x2', (x1 + (x2 - x1) * e).toString());
            el!.setAttribute('y2', (y1 + (y2 - y1) * e).toString());
            if (t < 1) requestAnimationFrame(step); else res();
          }
          requestAnimationFrame(step);
        }, startMs);
      });
    };

    const drawRing = (id: string, r: number, startMs: number, dur: number) => {
      return new Promise<void>(res => {
        const el = document.getElementById(id);
        if (!el) return res();
        const circ = 2 * Math.PI * r;
        el.setAttribute('stroke-dasharray', circ.toString());
        el.setAttribute('stroke-dashoffset', circ.toString());
        el.setAttribute('opacity', '1');
        setTimeout(() => {
          if (!running) return res();
          let t0: number | null = null;
          function step(ts: number) {
            if (!running) return res();
            if (!t0) t0 = ts;
            const t = Math.min((ts - t0) / dur, 1);
            el!.setAttribute('stroke-dashoffset', (circ * (1 - easeOut3(t))).toString());
            if (t < 1) requestAnimationFrame(step); else res();
          }
          requestAnimationFrame(step);
        }, startMs);
      });
    };

    async function phase1build() {
      if (!running) return;
      document.querySelectorAll('#main-svg circle, #main-svg line').forEach(e => {
        e.setAttribute('opacity', '0');
        e.removeAttribute('transform');
      });
      document.getElementById('p-outer-ring')?.removeAttribute('stroke-dasharray');
      document.getElementById('p-outer-ring')?.removeAttribute('stroke-dashoffset');
      document.getElementById('p-inner-ring')?.removeAttribute('stroke-dasharray');
      document.getElementById('p-inner-ring')?.removeAttribute('stroke-dashoffset');

      const lines = [
        ['sp0', 32, 26.5, 32, 13.5], ['sp1', 36.6, 29.3, 49.6, 21.8], ['sp2', 36.6, 34.7, 49.6, 42.2],
        ['sp3', 32, 37.5, 32, 50.5], ['sp4', 27.4, 34.7, 14.4, 42.2], ['sp5', 27.4, 29.3, 14.4, 21.8]
      ];
      lines.forEach(([id, x1, y1]) => {
        const e = document.getElementById(id as string);
        if (e) {
          e.setAttribute('x1', String(x1)); e.setAttribute('y1', String(y1));
          e.setAttribute('x2', String(x1)); e.setAttribute('y2', String(y1));
        }
      });

      ['p-hub1', 'p-hub2'].forEach(id => document.getElementById(id)?.setAttribute('r', '0'));
      document.querySelectorAll('.p-odot').forEach(e => e.setAttribute('r', '0'));
      ['sd0', 'sd1', 'sd2', 'sd3', 'sd4', 'sd5'].forEach(id => document.getElementById(id)?.setAttribute('r', '0'));

      textWrap.style.opacity = '0';
      textWrap.style.transform = 'translateY(18px)';
      mainSvg.style.opacity = '1';
      mainSvg.style.filter = 'blur(18px)';
      setWrap(0, 0, 0.08, 0);

      await new Promise<void>(res => {
        let t0: number | null = null;
        function step(ts: number) {
          if (!running) return res();
          if (!t0) t0 = ts;
          const t = Math.min((ts - t0) / 900, 1);
          const e = easeOut5(t);
          mainSvg.style.filter = `blur(${(1 - e) * 16}px)`;
          setWrap(0, 0, 0.08 + e * 0.92, 0);
          if (t < 1) requestAnimationFrame(step); else res();
        }
        requestAnimationFrame(step);
      });
      mainSvg.style.filter = 'none';

      const D = 420;
      growCircle('p-hub1', 32, 32, 5.5, 0, D);
      await growCircle('p-hub2', 32, 32, 3.2, 120, D);
      await drawRing('p-inner-ring', 18.5, 0, D + 80);

      for (let i = 0; i < lines.length; i++) {
        const [id, x1, y1, x2, y2] = lines[i];
        growLine(id as string, x1 as number, y1 as number, x2 as number, y2 as number, i * 90, D);
        if (i < lines.length - 1) await new Promise(r => setTimeout(r, 90));
      }
      await new Promise(r => setTimeout(r, D + 40));

      const sdIds = ['sd0', 'sd1', 'sd2', 'sd3', 'sd4', 'sd5'];
      const sdData = [[32, 13.5, 3.2], [49.6, 21.8, 3.2], [49.6, 42.2, 3.2], [32, 50.5, 3.2], [14.4, 42.2, 3.2], [14.4, 21.8, 3.2]];
      for (let i = 0; i < 6; i++) {
        growCircle(sdIds[i], sdData[i][0], sdData[i][1], sdData[i][2], i * 80, 280);
        if (i < 5) await new Promise(r => setTimeout(r, 80));
      }
      await new Promise(r => setTimeout(r, 300));
      await drawRing('p-outer-ring', 29, 0, D + 100);

      const odots = document.querySelectorAll('.p-odot');
      odots.forEach((e, i) => {
        setTimeout(() => {
          if (!running) return;
          e.setAttribute('opacity', '1');
          growCircle(e, parseFloat(e.getAttribute('cx') || '0'), parseFloat(e.getAttribute('cy') || '0'), 2.2, 0, 220);
        }, i * 70);
      });
      await new Promise(r => setTimeout(r, 6 * 70 + 240));
    }

    function explode() {
      return new Promise<void>(res => {
        const rect = stage.getBoundingClientRect();
        canvas.width = rect.width || window.innerWidth; 
        canvas.height = rect.height || window.innerHeight;
        mainSvg.style.opacity = '0'; 
        wrap.style.opacity = '0';
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const colors = ['#D7641C', '#EB8C3C', '#1C2337', '#2c4a7c', '#f5a623', '#fff'];
        particles = [];
        for (let i = 0; i < 80; i++) {
          const a = Math.random() * Math.PI * 2, spd = 3 + Math.random() * 11, sz = 3 + Math.random() * 14;
          particles.push({
            x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, size: sz,
            color: colors[Math.floor(Math.random() * colors.length)], alpha: 1,
            rot: Math.random() * Math.PI * 2, rotV: (Math.random() - .5) * .28,
            shape: Math.random() < .5 ? 'circle' : 'rect', grav: .13
          });
        }
        const DUR = 1500; let t0: number | null = null;
        function animP(ts: number) {
          if (!running) return res();
          if (!t0) t0 = ts;
          const t = Math.min((ts - t0) / DUR, 1);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          for (const p of particles) {
            p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.vx *= .985;
            p.rot += p.rotV; p.alpha = 1 - t;
            ctx.save(); ctx.globalAlpha = Math.max(p.alpha, 0);
            ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color;
            if (p.shape === 'circle') { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
            else ctx.fillRect(-p.size / 2, -p.size * .15, p.size, p.size * .3);
            ctx.restore();
          }
          if (t < 1) requestAnimationFrame(animP);
          else { ctx.clearRect(0, 0, canvas.width, canvas.height); res(); }
        }
        requestAnimationFrame(animP);
      });
    }

    async function phase12spin() {
      if (!running) return;
      const outerEls = [document.getElementById('p-outer-ring'), ...Array.from(document.querySelectorAll('.p-odot'))];
      const innerEls = [
        document.getElementById('p-inner-ring'),
        ...['sp0', 'sp1', 'sp2', 'sp3', 'sp4', 'sp5', 'sd0', 'sd1', 'sd2', 'sd3', 'sd4', 'sd5']
          .map(id => document.getElementById(id))
      ];
      function applyRings(od: number, id: number) {
        outerEls.forEach(e => { if (e) e.setAttribute('transform', `rotate(${od},32,32)`); });
        innerEls.forEach(e => { if (e) e.setAttribute('transform', `rotate(${id},32,32)`); });
      }
      const TOTAL = 3800; let t0: number | null = null;
      await new Promise<void>(res => {
        function step(ts: number) {
          if (!running) return res();
          if (!t0) t0 = ts;
          const t = Math.min((ts - t0) / TOTAL, 1);
          const acc = t * t;
          applyRings(acc * 1400, -acc * 1400);
          setWrap(0, 0, 1, acc * 600);
          if (t < 1) requestAnimationFrame(step); else res();
        }
        requestAnimationFrame(step);
      });
      await explode();
    }

    async function phase3() {
      if (!running) return;
      document.querySelectorAll('#main-svg circle, #main-svg line').forEach(e => {
        e.setAttribute('opacity', '1'); e.removeAttribute('transform');
      });
      document.getElementById('p-outer-ring')?.removeAttribute('stroke-dasharray');
      document.getElementById('p-outer-ring')?.removeAttribute('stroke-dashoffset');
      document.getElementById('p-inner-ring')?.removeAttribute('stroke-dasharray');
      document.getElementById('p-inner-ring')?.removeAttribute('stroke-dashoffset');

      const lines = [
        ['sp0', 32, 26.5, 32, 13.5], ['sp1', 36.6, 29.3, 49.6, 21.8], ['sp2', 36.6, 34.7, 49.6, 42.2],
        ['sp3', 32, 37.5, 32, 50.5], ['sp4', 27.4, 34.7, 14.4, 42.2], ['sp5', 27.4, 29.3, 14.4, 21.8]
      ];
      lines.forEach(([id, x1, y1, x2, y2]) => {
        const e = document.getElementById(id as string);
        if (e) {
          e.setAttribute('x1', String(x1)); e.setAttribute('y1', String(y1));
          e.setAttribute('x2', String(x2)); e.setAttribute('y2', String(y2));
        }
      });
      document.getElementById('p-hub1')?.setAttribute('r', '5.5');
      document.getElementById('p-hub2')?.setAttribute('r', '3.2');
      document.getElementById('p-outer-ring')?.setAttribute('r', '29');
      document.getElementById('p-inner-ring')?.setAttribute('r', '18.5');
      ['sd0', 'sd1', 'sd2', 'sd3', 'sd4', 'sd5'].forEach(id => document.getElementById(id)?.setAttribute('r', '3.2'));
      document.querySelectorAll('.p-odot').forEach(e => e.setAttribute('r', '2.2'));

      mainSvg.style.opacity = '1'; wrap.style.opacity = '1';
      textWrap.style.opacity = '0'; textWrap.style.transform = 'translateY(18px)';

      const stageW = stage.offsetWidth || window.innerWidth;
      const startX = stageW / 2 + 140;
      const DUR = 1700; let t0: number | null = null;

      await new Promise<void>(res => {
        function roll(ts: number) {
          if (!running) return res();
          if (!t0) t0 = ts;
          const t = Math.min((ts - t0) / DUR, 1);
          const e = easeInOut(t);
          const targetY = -60;
          setWrap(startX * (1 - e), targetY * e, 1, (1 - e) * startX * 1.1);
          if (t < 1) requestAnimationFrame(roll); else res();
        }
        requestAnimationFrame(roll);
      });

      await new Promise<void>(res => {
        const BD = 500; let t1: number | null = null;
        function bnc(ts: number) {
          if (!running) return res();
          if (!t1) t1 = ts;
          const bt = Math.min((ts - t1) / BD, 1);
          setWrap(0, -60 + Math.sin(bt * Math.PI) * -8, 1, 0);
          if (bt < 1) requestAnimationFrame(bnc); else { setWrap(0, -60, 1, 0); res(); }
        }
        requestAnimationFrame(bnc);
      });

      await new Promise(r => setTimeout(r, 150));
      const TDUR = 900; let tt0: number | null = null;
      await new Promise<void>(res => {
        function stepT(ts: number) {
          if (!running) return res();
          if (!tt0) tt0 = ts;
          const t = Math.min((ts - tt0) / TDUR, 1);
          const e = easeOut3(t);
          textWrap.style.opacity = String(e);
          textWrap.style.transform = `translateY(${18 * (1 - e)}px)`;
          if (t < 1) requestAnimationFrame(stepT); else res();
        }
        requestAnimationFrame(stepT);
      });
      
      // Animation Complete -> trigger callback
      setTimeout(() => {
         if (running) onComplete();
      }, 500);
    }

    async function startAnimation() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      wrap.style.opacity = '1';
      mainSvg.style.opacity = '0';
      textWrap.style.opacity = '0';

      await phase1build();
      await new Promise(r => setTimeout(r, 300));
      await phase12spin();
      await new Promise(r => setTimeout(r, 300));
      await phase3();
    }

    startAnimation();

    return () => {
      running = false;
    };
  }, [onComplete]);

  return (
    <div
      ref={stageRef}
      style={{
        width: '100%', height: '100vh',
        background: '#0d1117',
        position: 'fixed', top: 0, left: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', overflow: 'hidden'
      }}
    >
      <div
        ref={wrapRef}
        style={{
          position: 'absolute', width: 220, height: 220,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transformOrigin: 'center center'
        }}
      >
        <svg
          id="main-svg"
          ref={mainSvgRef}
          viewBox="0 0 64 64"
          fill="none"
          style={{ width: '220px', height: '220px', overflow: 'visible' }}
        >
          <circle id="p-outer-ring" cx="32" cy="32" r="29" stroke="#1C2337" strokeWidth="2.5" fill="none" opacity="0" />
          <circle className="p-odot" cx="32" cy="3.5" r="2.2" fill="#1C2337" opacity="0" />
          <circle className="p-odot" cx="59" cy="16.5" r="2.2" fill="#1C2337" opacity="0" />
          <circle className="p-odot" cx="59" cy="47.5" r="2.2" fill="#1C2337" opacity="0" />
          <circle className="p-odot" cx="32" cy="60.5" r="2.2" fill="#1C2337" opacity="0" />
          <circle className="p-odot" cx="5" cy="47.5" r="2.2" fill="#1C2337" opacity="0" />
          <circle className="p-odot" cx="5" cy="16.5" r="2.2" fill="#1C2337" opacity="0" />

          <circle id="p-inner-ring" cx="32" cy="32" r="18.5" stroke="#D7641C" strokeWidth="2" fill="none" opacity="0" />

          <line id="sp0" x1="32" y1="26.5" x2="32" y2="13.5" stroke="#D7641C" strokeWidth="2" strokeLinecap="round" opacity="0" />
          <line id="sp1" x1="36.6" y1="29.3" x2="49.6" y2="21.8" stroke="#EB8C3C" strokeWidth="2" strokeLinecap="round" opacity="0" />
          <line id="sp2" x1="36.6" y1="34.7" x2="49.6" y2="42.2" stroke="#D7641C" strokeWidth="2" strokeLinecap="round" opacity="0" />
          <line id="sp3" x1="32" y1="37.5" x2="32" y2="50.5" stroke="#EB8C3C" strokeWidth="2" strokeLinecap="round" opacity="0" />
          <line id="sp4" x1="27.4" y1="34.7" x2="14.4" y2="42.2" stroke="#D7641C" strokeWidth="2" strokeLinecap="round" opacity="0" />
          <line id="sp5" x1="27.4" y1="29.3" x2="14.4" y2="21.8" stroke="#EB8C3C" strokeWidth="2" strokeLinecap="round" opacity="0" />

          <circle id="sd0" cx="32" cy="13.5" r="3.2" fill="#D7641C" opacity="0" />
          <circle id="sd1" cx="49.6" cy="21.8" r="3.2" fill="#EB8C3C" opacity="0" />
          <circle id="sd2" cx="49.6" cy="42.2" r="3.2" fill="#D7641C" opacity="0" />
          <circle id="sd3" cx="32" cy="50.5" r="3.2" fill="#EB8C3C" opacity="0" />
          <circle id="sd4" cx="14.4" cy="42.2" r="3.2" fill="#D7641C" opacity="0" />
          <circle id="sd5" cx="14.4" cy="21.8" r="3.2" fill="#EB8C3C" opacity="0" />

          <circle id="p-hub1" cx="32" cy="32" r="5.5" fill="#1C2337" opacity="0" />
          <circle id="p-hub2" cx="32" cy="32" r="3.2" fill="#D7641C" opacity="0" />
        </svg>
      </div>

      <div
        ref={textWrapRef}
        style={{
          position: 'absolute', top: 'calc(50% + 70px)', left: 0, right: 0,
          textAlign: 'center', opacity: 0, transform: 'translateY(18px)',
          pointerEvents: 'none'
        }}
      >
        <span style={{ fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif', fontSize: 46, fontWeight: 700, color: '#ffffff', letterSpacing: 2 }}>Work</span>
        <span style={{ fontFamily: '"Trebuchet MS", "Segoe UI", sans-serif', fontSize: 46, fontWeight: 700, color: '#D7641C', letterSpacing: 2 }}>Hub</span>
        <span style={{ display: 'block', fontFamily: '"Segoe UI", sans-serif', fontSize: 13, color: '#6b7a99', letterSpacing: 4, textTransform: 'uppercase', marginTop: 6 }}>
          Connect · Collaborate · Create
        </span>
      </div>

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      ></canvas>
    </div>
  );
}
