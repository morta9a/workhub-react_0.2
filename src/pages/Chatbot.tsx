import React, { useState, useRef, useEffect } from 'react';
import { Shell } from '../components/layout/Shell';
import { Button, PageHeader, Card, CardBody } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { useApp } from '../contexts/AppContext';

type Message = { id: string; role: 'user' | 'ai'; content: string; time: string };

const QUICK_PROMPTS = [
  "لخص مبيعاتي هذا الشهر 📊",
  "من هم العملاء المتأخرين بالدفع؟ ⚠️",
  "صغ لي رسالة مطالبة بدين ✍️",
  "كم عدد عملائي ومورديني؟ 👥"
];

export default function Chatbot() {
  const { toast } = useToast();
  const { savedInvoices, suppliers, products } = useApp();
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'ai', content: 'مرحباً! أنا مساعدك الذكي في WorkHub. يمكنني قراءة فواتيرك وبياناتك وتزويدك بتقارير فورية، أو مساعدتك في صياغة الرسائل. كيف يمكنني مساعدتك؟', time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Pseudo-AI Engine
  const generateResponse = (userText: string) => {
    const text = userText.toLowerCase();
    
    // 1. Sales & Revenue
    if (text.includes('مبيعات') || text.includes('ارباح') || text.includes('أرباح')) {
      const total = savedInvoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
      return `إجمالي إيراداتك من الفواتير المدفوعة هو **${total.toLocaleString()} د.ع**. استمر في هذا الأداء الرائع! 🚀`;
    }
    
    // 2. Overdue Invoices
    if (text.includes('متأخر') || text.includes('ديون') || text.includes('دين')) {
      const overdue = savedInvoices.filter(i => i.status === 'overdue');
      if (overdue.length === 0) return 'خبر رائع! ليس لديك أي فواتير أو ديون متأخرة حالياً. 🎉';
      
      const totalOverdue = overdue.reduce((acc, curr) => acc + curr.amount, 0);
      let res = `لديك **${overdue.length}** فواتير متأخرة بإجمالي **${totalOverdue.toLocaleString()} د.ع**.\nالعملاء المتأخرون هم:\n`;
      overdue.forEach(i => { res += `- ${i.client} (${i.amount.toLocaleString()} د.ع)\n`; });
      return res;
    }

    // 3. Draft Email
    if (text.includes('رسالة مطالبة') || text.includes('ايميل لعميل') || text.includes('صغ لي رسالة') || text.includes('اكتب')) {
      return `إليك نموذج رسالة مطالبة مهنية ومحترفة:\n\n"السيد/ة المحترم/ة،\nتحية طيبة وبعد،\n\nنود تذكيركم بلطف بأن الفاتورة المستحقة لم يتم تسويتها بعد. نقدر جداً تعاونكم المستمر معنا ونرجو منكم مراجعة القسم المالي لإتمام عملية الدفع في أقرب وقت ممكن.\n\nإذا قمتم بالسداد بالفعل، نرجو تجاهل هذه الرسالة.\n\nمع خالص الشكر والتقدير،\nإدارة العمل"`;
    }

    // 4. General Stats
    if (text.includes('عدد عملائي') || text.includes('كم عميل') || text.includes('مورد')) {
      const uniqueClients = new Set(savedInvoices.map(i => i.client)).size;
      return `بناءً على قاعدة بياناتك:\n- لديك **${uniqueClients}** عملاء مسجلين في نظام الفواتير.\n- وتتعامل مع **${suppliers.length}** موردين مسجلين في الخريطة.\n- ولديك **${products.length}** منتجات/خدمات في الكاتالوج الخاص بك.`;
    }

    // Fallback
    return 'عذراً، أنا حالياً أتدرب على فهم المزيد من الأوامر. يمكنك استخدام الأزرار في الأسفل لسؤالي عن أرباحك، الفواتير المتأخرة، أو طلب صياغة رسائل مهنية! 🤖';
  };

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text, time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateResponse(text);
      const newAiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponse, time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // simulate thinking delay
  };

  return (
    <Shell
      topbarActions={
        <Button variant="ghost" size="sm" onClick={() => { setMessages([messages[0]]); toast('تم مسح المحادثة 🧹'); }}>مسح المحادثة 🧹</Button>
      }
    >
      <PageHeader
        icon="🤖"
        iconBg="rgba(56,189,248,.12)"
        title="المساعد الذكي (AI Chatbot)"
        subtitle="مساعدك المالي والاستراتيجي، اسأله عن أعمالك وسيجيبك ببيانات حقيقية"
      />

      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
        
        {/* Chat Area */}
        <CardBody style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-start' : 'flex-end', maxWidth: '85%', alignSelf: m.role === 'user' ? 'flex-start' : 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flexDirection: m.role === 'user' ? 'row' : 'row-reverse' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.role === 'user' ? 'var(--bg3)' : 'rgba(56,189,248,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: m.role === 'user' ? '1px solid var(--border)' : '1px solid rgba(56,189,248,.3)' }}>
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div style={{ 
                  padding: '0.8rem 1.2rem', 
                  borderRadius: '16px', 
                  borderBottomRightRadius: m.role === 'user' ? 0 : '16px',
                  borderBottomLeftRadius: m.role === 'ai' ? 0 : '16px',
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg2)', 
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  border: m.role === 'ai' ? '1px solid var(--border)' : 'none',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  {m.content}
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '0.3rem', margin: '0.3rem 2.5rem 0 2.5rem' }}>
                {m.time}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', flexDirection: 'row-reverse', alignSelf: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(56,189,248,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid rgba(56,189,248,.3)' }}>
                🤖
              </div>
              <div style={{ padding: '1rem', borderRadius: '16px', borderBottomLeftRadius: 0, background: 'var(--bg2)', border: '1px solid var(--border)', display: 'flex', gap: '0.3rem' }}>
                <span style={{ width: 6, height: 6, background: 'var(--muted)', borderRadius: '50%', animation: 'bounce 1s infinite' }} />
                <span style={{ width: 6, height: 6, background: 'var(--muted)', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }} />
                <span style={{ width: 6, height: 6, background: 'var(--muted)', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardBody>

        {/* Input Area */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--bg2)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
          
          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
            {QUICK_PROMPTS.map((p, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(p)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', borderRadius: '100px', fontSize: '0.8rem', color: 'var(--text)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg3)'}
                disabled={isTyping}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="اسألني عن أرباحك، ديونك، أو اطلب مني صياغة رسالة..." 
              style={{ flex: 1, padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.9rem' }} 
              disabled={isTyping}
            />
            <Button variant="accent" onClick={() => handleSend()} disabled={!input.trim() || isTyping} style={{ padding: '1rem 1.5rem', borderRadius: '12px' }}>
              إرسال 🚀
            </Button>
          </div>
        </div>
        
        {/* CSS for typing animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}} />
      </Card>
    </Shell>
  );
}
