import React, { useState, useEffect } from 'react';
import styles from './SmartFloatingCalc.module.css';

interface HistoryRecord {
  expression: string;
  result: string;
  time: string;
}

export const SmartFloatingCalc: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [iqdRate, setIqdRate] = useState(153000);
  const [mode, setMode] = useState<'general' | 'finance' | 'convert'>('convert');
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [diffType, setDiffType] = useState<'plus' | 'minus'>('plus');
  const [diffAmount, setDiffAmount] = useState(0);
  const [primaryCurrency, setPrimaryCurrency] = useState<'IQD' | 'USD'>('IQD');
  
  // Dynamic financial values
  const [bonusPercent, setBonusPercent] = useState(10);
  const [taxPercent, setTaxPercent] = useState(15);

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' && num !== '.') ? num : prev + num);
  };

  const calculate = () => {
    try {
      const sanitized = display.replace('×', '*').replace('÷', '/').replace(/,/g, '');
      // eslint-disable-next-line no-eval
      const result = eval(sanitized);
      const formattedResult = String(Number(result).toLocaleString('en-US'));
      
      const newRecord: HistoryRecord = {
        expression: display,
        result: formattedResult,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };
      
      setHistory(prev => [newRecord, ...prev].slice(0, 10));
      setDisplay(formattedResult);
    } catch {
      setDisplay('Error');
    }
  };

  const clear = () => setDisplay('0');
  const backspace = () => setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // PREVENT CONFLICT: If typing inside any input field, ignore calculator shortcuts
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '.') handleNumber('.');
      if (e.key === '+') handleNumber('+');
      if (e.key === '-') handleNumber('-');
      if (e.key === '*') handleNumber('×');
      if (e.key === '/') handleNumber('÷');
      if (e.key === 'Enter') { e.preventDefault(); calculate(); }
      if (e.key === 'Backspace') backspace();
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display]);

  const getConvertedValue = () => {
    let numericVal = parseFloat(display.replace(/,/g, '')) || 0;
    
    // Apply Price Difference logic
    if (primaryCurrency === 'IQD') {
      const adjustedRate = diffType === 'plus' ? iqdRate + diffAmount : iqdRate - diffAmount;
      return (numericVal / (adjustedRate / 100)).toFixed(2);
    } else {
      const adjustedRate = diffType === 'plus' ? iqdRate + diffAmount : iqdRate - diffAmount;
      return Math.round(numericVal * (adjustedRate / 100)).toLocaleString();
    }
  };

  const iqdVal = primaryCurrency === 'IQD' ? display : getConvertedValue();
  const usdVal = primaryCurrency === 'USD' ? display : getConvertedValue();

  return (
    <div className={styles.container}>
      {isOpen && (
        <div className={styles.window}>
          {/* Header */}
          <div className={styles.header} style={{background: 'var(--bg3)', borderBottom: '1px solid var(--border)'}}>
            <div className={styles.modes} style={{width: '100%', justifyContent: 'center'}}>
              <button onClick={() => setMode('general')} className={`${styles.modeBtn} ${mode === 'general' ? styles.modeBtnActive : ''}`}>عام</button>
              <button onClick={() => setMode('finance')} className={`${styles.modeBtn} ${mode === 'finance' ? styles.modeBtnActive : ''}`}>مالي</button>
              <button onClick={() => setMode('convert')} className={`${styles.modeBtn} ${mode === 'convert' ? styles.modeBtnActive : ''}`}>تحويلات $</button>
            </div>
          </div>

          {/* MODE: CONVERSIONS ($) */}
          {mode === 'convert' && (
            <>
              <div className={styles.modeHeader}>
                 <span className={styles.modeHeaderTitle}>الدولار اليوم</span>
              </div>

              <div className={styles.display}>
                {/* Dynamic Row Swapping: Primary is always on top */}
                {primaryCurrency === 'IQD' ? (
                  <>
                    <div className={styles.currencyRow}>
                      <div className={`${styles.currencyLabel} ${styles.labelPrimary}`}>د.ع</div>
                      <div className={styles.currencyValue}>{iqdVal}</div>
                    </div>
                    <div className={styles.currencyRow}>
                      <div className={`${styles.currencyLabel} ${styles.labelSecondary}`}>$</div>
                      <div className={styles.currencyValue}>{usdVal}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.currencyRow}>
                      <div className={`${styles.currencyLabel} ${styles.labelPrimary}`}>$</div>
                      <div className={styles.currencyValue}>{usdVal}</div>
                    </div>
                    <div className={styles.currencyRow}>
                      <div className={`${styles.currencyLabel} ${styles.labelSecondary}`}>د.ع</div>
                      <div className={styles.currencyValue}>{iqdVal}</div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.diffSection}>
                <div className={styles.rateHeader}>
                  <span>سعر الصرف:</span>
                  <input 
                    className={styles.rateInput} 
                    value={iqdRate.toLocaleString()} 
                    onChange={(e) => setIqdRate(parseInt(e.target.value.replace(/,/g, '')) || 0)} 
                  />
                </div>
                <div className={styles.diffControls}>
                   <div className={`${styles.diffRadio} ${diffType === 'plus' ? styles.radioActive : ''}`} onClick={() => setDiffType('plus')}>
                     <div className={styles.radioCircle}>{diffType === 'plus' && <div className={styles.radioDot} />}</div>
                     <span>زيادة</span>
                   </div>
                   <div className={`${styles.diffRadio} ${diffType === 'minus' ? styles.radioActive : ''}`} onClick={() => setDiffType('minus')}>
                     <div className={styles.radioCircle}>{diffType === 'minus' && <div className={styles.radioDot} />}</div>
                     <span>انقاص</span>
                   </div>
                   <input 
                    type="number" 
                    className={styles.diffValInput} 
                    value={diffAmount} 
                    onChange={(e) => setDiffAmount(parseInt(e.target.value) || 0)} 
                   />
                   <span style={{fontSize: '11px', color: 'var(--muted)'}}>فرق السعر</span>
                </div>
                
                {/* Displaying Effective Rate for transparency */}
                <div style={{marginTop: '10px', textAlign: 'center', fontSize: '11px', color: 'var(--accent)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px'}}>
                  السعر الفعلي: {(diffType === 'plus' ? iqdRate + diffAmount : iqdRate - diffAmount).toLocaleString()} د.ع
                </div>
              </div>
            </>
          )}

          {/* MODE: GENERAL */}
          {mode === 'general' && (
            <div className={styles.display} style={{padding: '24px', background: 'var(--bg4)', textAlign: 'right', borderBottom: '1px solid var(--border)'}}>
              <div className={styles.value} style={{fontSize: '42px', color: 'var(--text)'}}>{display}</div>
            </div>
          )}

          {/* MODE: FINANCIAL */}
          {mode === 'finance' && (
            <div className={styles.display} style={{padding: '20px', background: 'var(--bg4)', borderBottom: '1px solid var(--accent)'}}>
              <div className={styles.value} style={{color: 'var(--gold)'}}>{display}</div>
              <div style={{display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap'}}>
                 <button 
                  onClick={() => setDisplay(prev => String(parseFloat(prev.replace(/,/g, '')) * (1 - bonusPercent/100)))} 
                  className={styles.modeBtn} 
                  style={{background: 'var(--bg3)', border: '1px solid var(--border2)', flex: 1}}
                 >
                   تذويب بونص 
                   <input className={styles.finInput} value={bonusPercent} onChange={(e) => setBonusPercent(parseInt(e.target.value) || 0)} />%
                 </button>
                 <button 
                  onClick={() => setDisplay(prev => String(parseFloat(prev.replace(/,/g, '')) * (1 + taxPercent/100)))} 
                  className={styles.modeBtn} 
                  style={{background: 'var(--bg3)', border: '1px solid var(--border2)', flex: 1}}
                 >
                   ضريبة 
                   <input className={styles.finInput} value={taxPercent} onChange={(e) => setTaxPercent(parseInt(e.target.value) || 0)} />%
                 </button>
              </div>
            </div>
          )}

          <div className={styles.grid}>
            <div style={{gridColumn: 'span 3', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, '.', 0].map(n => (
                <button key={n} onClick={() => handleNumber(String(n))} className={`${styles.btn} ${styles.numBtn}`}>{n}</button>
              ))}
              <button onClick={backspace} className={`${styles.btn} ${styles.numBtn}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6"/></svg>
              </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button className={`${styles.btn} ${styles.sideCol}`} onClick={() => setPrimaryCurrency(prev => prev === 'IQD' ? 'USD' : 'IQD')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 21l-4-4m0 0l4-4m-4 4h18M17 3l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
              <button className={`${styles.btn} ${styles.sideCol}`} onClick={() => setShowHistory(!showHistory)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
              </button>
              <button className={`${styles.btn} ${styles.sideCol}`} onClick={calculate} style={{background: 'var(--accent)', flex: 1}}>
                 <span style={{fontSize: '24px', fontWeight: 'bold'}}>=</span>
              </button>
            </div>

            <div style={{gridColumn: 'span 4', display: 'flex'}}>
               <button onClick={() => handleNumber('+')} className={styles.btn} style={{flex: 1, background: 'var(--bg3)', color: 'var(--gold)'}}>+</button>
               <button onClick={() => handleNumber('-')} className={styles.btn} style={{flex: 1, background: 'var(--bg3)', color: 'var(--gold)'}}>-</button>
               <button onClick={() => handleNumber('×')} className={styles.btn} style={{flex: 1, background: 'var(--bg3)', color: 'var(--gold)'}}>×</button>
               <button className={styles.btn} onClick={clear} style={{flex: 1, background: '#e67e22', color: 'white'}}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
               </button>
            </div>
          </div>
          
          {showHistory && (
            <div className={styles.historyPanel}>
              {history.map((item, i) => (
                <div key={i} className={styles.historyItem}>
                  <span>{item.expression} = {item.result}</span>
                  <span style={{fontSize: '10px'}}>{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`${styles.toggle} ${isOpen ? styles.toggleActive : ''}`}
        title="الحاسبة الذكية"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="8" y1="6" x2="16" y2="6"></line>
            <line x1="16" y1="14" x2="16" y2="18"></line>
            <path d="M16 10h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M8 10h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M8 14h.01"></path>
            <path d="M12 18h.01"></path>
            <path d="M8 18h.01"></path>
          </svg>
        )}
      </button>
    </div>
  );
};
