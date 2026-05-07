import React from 'react';
import type { InvoiceItem, InvoiceStatus } from '../../types';

interface InvoiceDesignProps {
  invNum: string;
  invDate: string;
  myName: string;
  myEmail: string;
  clientName: string;
  clientDet: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountRate: number;
  grand: number;
  currencySym: string;
  logoUrl?: string;
  notes?: string;
  storeId?: string;
  dealerNo?: string;
  offsets?: Record<string, { x: number; y: number }>;
  designMode?: boolean;
  onTextEdit?: (key: string, oldVal: string) => void;
  onMoveStart?: (section: string, e: React.MouseEvent) => void;
  onToggleField?: (key: string) => void;
  customText?: Record<string, string>;
  hiddenFields?: string[];
}



export const InvoiceDesign: React.FC<InvoiceDesignProps> = ({
  invNum,
  invDate,
  myName,
  myEmail,
  clientName,
  clientDet,
  status,
  items,
  subtotal,
  tax,
  taxRate,
  discount,
  discountRate,
  grand,
  currencySym,
  logoUrl,
  notes,
  storeId = 'S1',
  dealerNo = '242',
  offsets = {},
  designMode = false,
  onTextEdit,
  onMoveStart,
  onToggleField,
  customText = {},
  hiddenFields = [],
}) => {

  const t = (key: string, defaultValue: string) => customText[key] || defaultValue;
  const getPos = (key: string, bx: number, by: number) => {
    const o = offsets[key] || { x: 0, y: 0 };
    return `translate(${bx + o.x}, ${by + o.y})`;
  };

  const navy = '#1C2337';
  const orange = '#D7641C';
  const gold = '#FFB950';

  const groupStyle: React.CSSProperties = designMode ? { cursor: 'move', pointerEvents: 'all' } : {};
  const textStyle: React.CSSProperties = designMode ? { cursor: 'pointer', outline: '1px dashed rgba(108,99,255,0.3)' } : {};

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 794 1123" 
      width="100%" 
      height="100%" 
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', background: '#fff', userSelect: designMode ? 'none' : 'auto' }}
    >


      {/* BACKGROUND & OUTER BORDER */}
      <rect width="794" height="1123" fill="#ffffff"/>
      <rect width="774" height="1103" x="10" y="10" fill="none" stroke={navy} strokeWidth="0.5"/>
      
      {/* TOP STRIP */}
      <rect x="0" y="0" width="794" height="4" fill={orange}/>

      {/* HEADER SECTION */}
      {/* Left: Contact Info */}
      <g transform={getPos('header_left', 50, 50)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('header_left', e); }}>
        <text x="0" y="0" transform={getPos('comp_name_pos', 0, 0)} fontSize="16" fontWeight="800" fill={navy} fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('comp_name_pos', e); }} onClick={() => onTextEdit?.('company_name', t('company_name', 'WorkHub Platform'))}>{t('company_name', 'WorkHub Platform')}</text>
        <g transform="translate(0, 25)" fontSize="10" fill={navy} fontFamily="Tajawal, sans-serif">
          
          <g transform="translate(0, 0)">
            <text x="140" y="10" transform={getPos('h_addr_lbl', 0, 0)} textAnchor="end" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_addr_lbl', e); }} onClick={() => onTextEdit?.('label_addr', t('label_addr', 'العنوان / Addr:'))}>{t('label_addr', 'العنوان / Addr:')}</text>
            <text x="0" y="10" transform={getPos('h_addr_val', 0, 0)} fontWeight="600" fill="#666" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_addr_val', e); }} onClick={() => onTextEdit?.('val_addr', t('val_addr', 'Baghdad, Iraq'))}>{t('val_addr', 'Baghdad, Iraq')}</text>
          </g>
          
          <g transform="translate(0, 20)">
            <text x="140" y="10" transform={getPos('h_tel_lbl', 0, 0)} textAnchor="end" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_tel_lbl', e); }} onClick={() => onTextEdit?.('label_tel', t('label_tel', 'هاتف / Tel:'))}>{t('label_tel', 'هاتف / Tel:')}</text>
            <text x="0" y="10" transform={getPos('h_tel_val', 0, 0)} fontWeight="600" fill="#666" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_tel_val', e); }} onClick={() => onTextEdit?.('val_tel', t('val_tel', '+964 770 000 0000'))}>{t('val_tel', '+964 770 000 0000')}</text>
          </g>
          
          <g transform="translate(0, 40)">
            <text x="140" y="10" transform={getPos('h_web_lbl', 0, 0)} textAnchor="end" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_web_lbl', e); }} onClick={() => onTextEdit?.('label_web', t('label_web', 'الموقع / Web:'))}>{t('label_web', 'الموقع / Web:')}</text>
            <text x="0" y="10" transform={getPos('h_web_val', 0, 0)} fontWeight="600" fill="#666" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_web_val', e); }} onClick={() => onTextEdit?.('val_web', t('val_web', 'workhub.io'))}>{t('val_web', 'workhub.io')}</text>
          </g>
          
          <g transform="translate(0, 60)">
            <text x="140" y="10" transform={getPos('h_email_lbl', 0, 0)} textAnchor="end" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_email_lbl', e); }} onClick={() => onTextEdit?.('label_email', t('label_email', 'البريد / Email:'))}>{t('label_email', 'البريد / Email:')}</text>
            <text x="0" y="10" transform={getPos('h_email_val', 0, 0)} fontWeight="600" fill="#666" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('h_email_val', e); }} onClick={() => onTextEdit?.('val_email', t('val_email', 'info@workhub.io'))}>{t('val_email', 'info@workhub.io')}</text>
          </g>
        </g>
      </g>


      {/* Center: Title & Invoice Box */}
      <g transform={getPos('header_center', 397, 65)} style={groupStyle} onMouseDown={e => onMoveStart?.('header_center', e)}>
        <text x="0" y="0" fontSize="32" fontWeight="900" fill={navy} textAnchor="middle" fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('inv_title_ar', t('inv_title_ar', 'فاتورة مبيعات'))}>{t('inv_title_ar', 'فاتورة مبيعات')}</text>
        <text x="0" y="20" fontSize="12" fill={orange} textAnchor="middle" fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('inv_title_en', t('inv_title_en', 'Sales Invoice'))}>{t('inv_title_en', 'Sales Invoice')}</text>
        
        <g transform={getPos('inv_box', 0, 45)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('inv_box', e); }}>
          <rect x="-100" y="0" width="200" height="40" rx="4" fill="none" stroke={navy} strokeWidth="1.2"/>
          <text x="0" y="26" fontSize="18" fontWeight="700" fill={navy} textAnchor="middle" letterSpacing="1" fontFamily="monospace">{invNum}</text>
        </g>
      </g>

      {/* Right: Logo */}
      <g transform={getPos('logo_group', 600, 50)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('logo_group', e); }}>
        {logoUrl ? (
          <image href={logoUrl} x="0" y="0" width="160" height="80" preserveAspectRatio="xMidYMid meet" />
        ) : (
          <g>
            {/* Icon */}
            <g transform="translate(0, 35)">
               <circle cx="0" cy="0" r="28" fill="none" stroke={navy} strokeWidth="2"/>
               <circle cx="0" cy="3" r="21" fill="none" stroke={orange} strokeWidth="1"/>
               {[0, 60, 120, 180, 240, 300].map(deg => (
                 <g key={deg} transform={`rotate(${deg})`}>
                   <line x1="0" y1="0" x2="0" y2="-21" stroke={orange} strokeWidth="1"/>
                   <circle cx="0" cy="-21" r="3" fill={orange}/>
                   <circle cx="0" cy="-28" r="2.5" fill={navy}/>
                 </g>
               ))}
               <circle cx="0" cy="0" r="4" fill={navy} stroke={orange} strokeWidth="0.8"/>
            </g>
            {/* Text Area */}
            <g transform="translate(45, 35)">
              <text x="0" y="0" fontSize="22" fontWeight="900" fill={navy} fontFamily="Tajawal, sans-serif">Work <tspan fill={orange}>Hub</tspan></text>
              <line x1="0" y1="6" x2="130" y2="6" stroke={orange} strokeWidth="2.5"/>
              <text x="0" y="22" fontSize="8" fill="#88967b" textAnchor="start" fontFamily="Tajawal, sans-serif">Business Management Platform</text>
              <text x="0" y="35" fontSize="9" fill={navy} textAnchor="start" fontFamily="Tajawal, sans-serif" fontWeight="700">منصة إدارة الأعمال المتكاملة</text>
            </g>
          </g>
        )}
      </g>






      {/* BORDER LINE */}
      <line x1="20" y1="160" x2="774" y2="160" stroke={orange} strokeWidth="2.5"/>

      {/* INFO BLOCKS */}
      {/* Right: Invoice Meta */}
      {!hiddenFields.includes('invoice_title_sec') && (
        <>
          <g transform={getPos('invoice_title', 30, 185)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('invoice_title', e); }}>
            <text x="0" y="0" fontSize="13" fontWeight="800" fill={navy} fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('inv_info_title', t('inv_info_title', 'بيانات الفاتورة - INVOICE INFO'))}>{t('inv_info_title', 'بيانات الفاتورة - INVOICE INFO')}</text>
            {designMode && <text x="-15" y="-5" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('invoice_title_sec')}>×</text>}
          </g>
          <g transform={getPos('invoice_line', 30, 193)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('invoice_line', e); }}>
            <line x1="0" y1="0" x2="330" y2="0" stroke={navy} strokeWidth="0.8"/>
            {designMode && <text x="-15" y="3" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('invoice_title_sec')}>×</text>}
          </g>
        </>
      )}

      <g transform="translate(30, 215)" fontSize="11" fontFamily="Tajawal, sans-serif">
          {/* Row 1: Date */}
          {!hiddenFields.includes('date_row') && (
            <>
              <g transform={getPos('date_val', 0, 0)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('date_val', e); }}>
                <rect x="0" y="0" width="230" height="28" rx="4" fill="#fcfcfc" stroke="#eee" strokeWidth="1"/>
                <text x="115" y="19" fontWeight="700" fill={navy} textAnchor="middle" fontFamily="monospace">{invDate}</text>
                {designMode && <text x="-10" y="10" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('date_row')}>×</text>}
              </g>
              <text x="240" y="18" transform={getPos('date_label', 0, 0)} fill="#555" textAnchor="start" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('date_label', e); }} onClick={() => onTextEdit?.('label_date', t('label_date', 'التاريخ / Date'))}>{t('label_date', 'التاريخ / Date')}</text>
            </>
          )}
          
          {/* Row 2: Store */}
          {!hiddenFields.includes('store_row') && (
            <>
              <g transform={getPos('store_val', 0, 38)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('store_val', e); }}>
                <rect x="0" y="0" width="230" height="28" rx="4" fill="#fcfcfc" stroke="#eee" strokeWidth="1"/>
                <text x="115" y="19" fontWeight="700" fill={navy} textAnchor="middle">{storeId}</text>
                {designMode && <text x="-10" y="10" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('store_row')}>×</text>}
              </g>
              <text x="240" y="56" transform={getPos('store_label', 0, 0)} fill="#555" textAnchor="start" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('store_label', e); }} onClick={() => onTextEdit?.('label_store', t('label_store', 'رقم المخزن / Store ID'))}>{t('label_store', 'رقم المخزن / Store ID')}</text>
            </>
          )}

          {/* Row 3: Currency */}
          {!hiddenFields.includes('curr_row') && (
            <>
              <g transform={getPos('curr_val', 0, 76)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('curr_val', e); }}>
                <rect x="0" y="0" width="230" height="28" rx="4" fill="#fcfcfc" stroke="#eee" strokeWidth="1"/>
                <text x="115" y="19" fontWeight="700" fill={navy} textAnchor="middle">{currencySym}</text>
                {designMode && <text x="-10" y="10" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('curr_row')}>×</text>}
              </g>
              <text x="240" y="94" transform={getPos('curr_label', 0, 0)} fill="#555" textAnchor="start" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('curr_label', e); }} onClick={() => onTextEdit?.('label_currency', t('label_currency', 'العملة / Currency'))}>{t('label_currency', 'العملة / Currency')}</text>
            </>
          )}
      </g>

      {/* Left: Client Meta */}
      {!hiddenFields.includes('client_title_sec') && (
        <>
          <g transform={getPos('client_title', 430, 185)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('client_title', e); }}>
            <text x="0" y="0" fontSize="13" fontWeight="800" fill={navy} fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('client_info_title', t('client_info_title', 'بيانات العميل - CLIENT INFO'))}>{t('client_info_title', 'بيانات العميل - CLIENT INFO')}</text>
            {designMode && <text x="-15" y="-5" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('client_title_sec')}>×</text>}
          </g>
          <g transform={getPos('client_line', 430, 193)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('client_line', e); }}>
            <line x1="0" y1="0" x2="330" y2="0" stroke={navy} strokeWidth="0.8"/>
            {designMode && <text x="-15" y="3" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('client_title_sec')}>×</text>}
          </g>
        </>
      )}

      <g transform="translate(430, 215)" fontSize="11" fontFamily="Tajawal, sans-serif">
          {/* Row 1: Name */}
          {!hiddenFields.includes('name_row') && (
            <>
              <g transform={getPos('name_val', 0, 0)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('name_val', e); }}>
                <rect x="0" y="0" width="230" height="28" rx="4" fill="#fcfcfc" stroke="#eee" strokeWidth="1"/>
                <text x="115" y="19" fontWeight="700" fill={navy} textAnchor="middle">{clientName}</text>
                {designMode && <text x="-10" y="10" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('name_row')}>×</text>}
              </g>
              <text x="240" y="18" transform={getPos('name_label', 0, 0)} fill="#555" textAnchor="start" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('name_label', e); }} onClick={() => onTextEdit?.('label_client_name', t('label_client_name', 'الاسم / Name'))}>{t('label_client_name', 'الاسم / Name')}</text>
            </>
          )}
          
          {/* Row 2: Address */}
          {!hiddenFields.includes('addr_row') && (
            <>
              <g transform={getPos('addr_val', 0, 38)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('addr_val', e); }}>
                <rect x="0" y="0" width="230" height="28" rx="4" fill="#fcfcfc" stroke="#eee" strokeWidth="1"/>
                <text x="115" y="19" fontWeight="500" fill={navy} textAnchor="middle" fontSize="10">{clientDet}</text>
                {designMode && <text x="-10" y="10" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('addr_row')}>×</text>}
              </g>
              <text x="240" y="56" transform={getPos('addr_label', 0, 0)} fill="#555" textAnchor="start" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('addr_label', e); }} onClick={() => onTextEdit?.('label_client_addr', t('label_client_addr', 'العنوان / Address'))}>{t('label_client_addr', 'العنوان / Address')}</text>
            </>
          )}

          {/* Row 3: Dealer No */}
          {!hiddenFields.includes('id_row') && (
            <>
              <g transform={getPos('id_val', 0, 76)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('id_val', e); }}>
                <rect x="0" y="0" width="230" height="28" rx="4" fill="none" stroke={orange} strokeWidth="1.5"/>
                <text x="115" y="19" fontWeight="800" fill={orange} textAnchor="middle" fontFamily="monospace">{dealerNo}</text>
                {designMode && <text x="-10" y="10" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('id_row')}>×</text>}
              </g>
              <text x="240" y="94" transform={getPos('id_label', 0, 0)} fill="#555" textAnchor="start" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('id_label', e); }} onClick={() => onTextEdit?.('label_client_id', t('label_client_id', 'رمز العميل / Dealer No.'))}>{t('label_client_id', 'رمز العميل / Dealer No.')}</text>
            </>
          )}
      </g>

      {/* TABLE TITLE SECTION */}
      {!hiddenFields.includes('table_title_sec') && (
        <>
          <g transform={getPos('table_title_bar', 50, 330)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('table_title_bar', e); }}>
            <rect x="0" y="0" width="754" height="30" fill="#f8f8f8" stroke="#eee" strokeWidth="0.5"/>
            {designMode && <text x="760" y="20" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('table_title_sec')}>×</text>}
          </g>
          <text x="744" y="350" transform={getPos('table_title_ar_pos', 0, 0)} fontSize="12" fontWeight="800" fill={navy} textAnchor="end" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('table_title_ar_pos', e); }} onClick={() => onTextEdit?.('table_title_ar', t('table_title_ar', 'تفاصيل الأصناف'))}>{t('table_title_ar', 'تفاصيل الأصناف')}</text>
          <text x="10" y="350" transform={getPos('table_title_en_pos', 0, 0)} fontSize="10" fill="#888" textAnchor="start" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('table_title_en_pos', e); }} onClick={() => onTextEdit?.('table_title_en', t('table_title_en', 'Items Details'))}>{t('table_title_en', 'Items Details')}</text>
        </>
      )}



      {/* TABLE SECTION */}
      {!hiddenFields.includes('table_section') && (
        <g transform={getPos('table_group', 20, 360)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('table_group', e); }}>
          {/* Table Header Row */}
          <rect x="0" y="0" width="754" height="40" fill={navy}/>
          <g fontSize="11" fontWeight="800" fill="#ffffff" fontFamily="Tajawal, sans-serif" textAnchor="middle">
            <g transform={getPos('th_id', 734, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_id', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_id', t('col_id', 'رقم'))}>{t('col_id', 'رقم')}</text>
            </g>
            <g transform={getPos('th_desc', 604, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_desc', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_desc', t('col_desc', 'اسم الصنف'))}>{t('col_desc', 'اسم الصنف')}</text>
            </g>
            <g transform={getPos('th_store', 469, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_store', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_store', t('col_store', 'المخزن'))}>{t('col_store', 'المخزن')}</text>
            </g>
            <g transform={getPos('th_exp', 409, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_exp', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_exp', t('col_exp', 'انتهاء'))}>{t('col_exp', 'انتهاء')}</text>
            </g>
            <g transform={getPos('th_comp', 334, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_comp', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_comp', t('col_comp', 'الشركة'))}>{t('col_comp', 'الشركة')}</text>
            </g>
            <g transform={getPos('th_qty', 269, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_qty', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_qty', t('col_qty', 'الكمية'))}>{t('col_qty', 'الكمية')}</text>
            </g>
            <g transform={getPos('th_bonus', 219, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_bonus', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_bonus', t('col_bonus', 'بونص'))}>{t('col_bonus', 'بونص')}</text>
            </g>
            <g transform={getPos('th_price', 149, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_price', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_price', t('col_price', 'سعر الوحدة'))}>{t('col_price', 'سعر الوحدة')}</text>
            </g>
            <g transform={getPos('th_total', 52, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('th_total', e); }}>
              <text x="0" y="0" style={textStyle} onClick={() => onTextEdit?.('col_total', t('col_total', 'الإجمالي'))}>{t('col_total', 'الإجمالي')}</text>
            </g>
          </g>

          {/* Table Rows */}
          {Array.from({ length: 12 }).map((_, idx) => {
            const item = items[idx];
            const y = 40 + idx * 30;
            return (
              <g key={idx}>
                <rect x="0" y={y} width="754" height="30" fill={idx % 2 === 0 ? "#fff" : "#fcfcfc"} stroke="#eee" strokeWidth="0.5"/>
                {item && (
                  <g fontSize="10" fill={navy} textAnchor="middle" fontFamily="Tajawal, sans-serif">
                    <text x="734" y={y + 19}>{item.id}</text>
                    <text x="604" y={y + 19} textAnchor="middle">{item.description}</text>
                    <text x="469" y={y + 19}>{item.store || 'S1'}</text>
                    <text x="409" y={y + 19}>{item.expiry || '-'}</text>
                    <text x="334" y={y + 19}>{item.company || '-'}</text>
                    <text x="269" y={y + 19}>{item.qty}</text>
                    <text x="219" y={y + 19}>{item.bonus || 0}</text>
                    <text x="149" y={y + 19}>{item.price.toLocaleString()}</text>
                    <text x="52" y={y + 19} fontWeight="800">{(item.qty * item.price).toLocaleString()}</text>
                  </g>
                )}
                <g stroke="#eee" strokeWidth="0.5">
                  {[714, 494, 444, 374, 294, 244, 194, 104].map(x => <line key={x} x1={x} y1={y} x2={x} y2={y + 30}/>)}
                </g>
              </g>
            );
          })}

          {/* Summary Line */}
          <g transform="translate(0, 400)">
            <rect x="0" y="0" width="754" height="32" fill="#f8f9fa" stroke="#eee" strokeWidth="1"/>
            <g fontSize="10" fontWeight="800" fill={navy} fontFamily="Tajawal, sans-serif" textAnchor="middle">
              {/* Count under ID column */}
              <text x="734" y="21">{items.length}</text>
              <text x="660" y="21" fontSize="9" fill="#888" textAnchor="start">عدد الأصناف / Count</text>
              
              {/* SUM under Qty column */}
              <text x="269" y="21">{items.reduce((s,i)=>s+i.qty,0)}</text>
              <text x="310" y="21" fontSize="9" fill="#888" textAnchor="end">المجموع</text>

              {/* Grand Total under Total column */}
              <text x="52" y="21" fontSize="11" fontWeight="900" fill={orange}>{subtotal.toLocaleString()}</text>
            </g>
          </g>
        </g>
      )}

      {/* TOTALS SECTION */}
      <g transform={getPos('totals_group', 30, 810)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('totals_group', e); }}>
        <g transform="translate(0, 0)" fontSize="12" fontFamily="Tajawal, sans-serif">
          <rect x="0" y="-10" width="340" height="160" rx="10" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
          
          <g transform="translate(15, 20)">
            <text x="310" y="0" transform={getPos('subtotal_label', 0, 0)} fontWeight="800" fill={navy} textAnchor="end" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('subtotal_label', e); }} onClick={() => onTextEdit?.('label_subtotal', t('label_subtotal', 'المجموع الفرعي / Subtotal'))}>{t('label_subtotal', 'المجموع الفرعي / Subtotal')}</text>
            <text x="0" y="0" transform={getPos('subtotal_val', 0, 0)} fontWeight="700" fill={navy} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('subtotal_val', e); }}>{subtotal.toLocaleString()}</text>
            <line x1="0" y1="8" x2="310" y2="8" stroke="#eee" strokeWidth="0.5" strokeDasharray="3,2"/>
          </g>

          <g transform="translate(15, 50)">
            <text x="310" y="0" transform={getPos('tax_label', 0, 0)} fontWeight="800" fill={navy} textAnchor="end" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('tax_label', e); }} onClick={() => onTextEdit?.('label_tax', t('label_tax', 'الضريبة'))}>
              {`${t('label_tax', 'الضريبة')} (${taxRate}%) / Tax`}
            </text>
            <text x="0" y="0" transform={getPos('tax_val', 0, 0)} fontWeight="700" fill={navy} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('tax_val', e); }}>{tax.toLocaleString()}</text>
            <line x1="0" y1="8" x2="310" y2="8" stroke="#eee" strokeWidth="0.5" strokeDasharray="3,2"/>
          </g>
          
          <g transform="translate(15, 80)">
            <text x="310" y="0" transform={getPos('disc_label', 0, 0)} fontWeight="800" fill={navy} textAnchor="end" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('disc_label', e); }} onClick={() => onTextEdit?.('label_discount', t('label_discount', 'الخصم'))}>
              {`${t('label_discount', 'الخصم')} (${discountRate}%) / Discount`}
            </text>
            <text x="0" y="0" transform={getPos('disc_val', 0, 0)} fontWeight="700" fill="#ef4444" style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('disc_val', e); }}>{discount.toLocaleString()}</text>
            <line x1="0" y1="8" x2="310" y2="8" stroke="#eee" strokeWidth="0.5" strokeDasharray="3,2"/>
          </g>







          <g transform={getPos('total_box', 10, 100)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('total_box', e); }}>
             <rect x="0" y="0" width="320" height="45" rx="6" fill={navy}/>
             <text x="305" y="28" transform={getPos('grand_label', 0, 0)} fontSize="14" fontWeight="900" fill="#ffffff" textAnchor="end" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('grand_label', e); }} onClick={() => onTextEdit?.('label_grand_total', t('label_grand_total', 'الإجمالي / Total'))}>{t('label_grand_total', 'الإجمالي / Total')}</text>
             <text x="15" y="28" transform={getPos('grand_val', 0, 0)} fontSize="20" fontWeight="900" fill={gold} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('grand_val', e); }}>{grand.toLocaleString()} {currencySym}</text>
          </g>
        </g>
      </g>

      {/* NOTES BLOCK - Now independent */}
      {/* NOTES BLOCK - Decoupled */}
      {!hiddenFields.includes('notes_sec') && (
        <>
          <text x="744" y="820" transform={getPos('notes_title_ar', 0, 0)} fontSize="13" fontWeight="800" fill={navy} textAnchor="end" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('notes_title_ar', e); }} onClick={() => onTextEdit?.('notes_title_ar', t('notes_title_ar', 'ملاحظات'))}>{t('notes_title_ar', 'ملاحظات')}</text>
          <text x="680" y="820" transform={getPos('notes_title_en', 0, 0)} fontSize="11" fill="#888" textAnchor="end" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('notes_title_en', e); }} onClick={() => onTextEdit?.('notes_title_en', t('notes_title_en', 'Notes'))}>{t('notes_title_en', 'Notes')}</text>
          
          <g transform={getPos('notes_line', 380, 828)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('notes_line', e); }}>
            <line x1="0" y1="0" x2="364" y2="0" stroke={orange} strokeWidth="2"/>
          </g>

          <g transform={getPos('notes_box_group', 380, 850)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('notes_box_group', e); }}>
            <rect x="0" y="0" width="364" height="110" rx="8" fill="#fcfcfc" stroke="#eee" strokeWidth="1"/>
            {[1, 2, 3, 4].map(i => <line key={i} x1="10" y1={i * 22} x2="354" y2={i * 22} stroke="#eee" strokeWidth="0.5" strokeDasharray="4,2"/>)}
            <foreignObject x="10" y="5" width="344" height="100">
              {/* @ts-ignore - xmlns is required for foreignObject html to render in SVG */}
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ 
                fontSize: '10px', 
                color: '#555', 
                textAlign: 'right', 
                fontFamily: 'Tajawal, sans-serif', 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: '1.6'
              }}>
                {notes}
              </div>
            </foreignObject>
            {designMode && <text x="375" y="0" fontSize="10" fill="#ef4444" style={{cursor:'pointer'}} onClick={() => onToggleField?.('notes_sec')}>×</text>}
          </g>

        </>
      )}



      {/* FOOTER */}
      <g transform={getPos('footer_group', 30, 1020)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('footer_group', e); }}>
        <line x1="0" y1="0" x2="734" y2="0" stroke="#eee" strokeWidth="1"/>
        
        <g transform={getPos('footer_text', 0, 25)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('footer_text', e); }}>
          <text x="0" y="0" fontSize="12" fontWeight="800" fill={navy} fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('footer_company', t('footer_company', 'WorkHub Platform'))}>{t('footer_company', 'WorkHub Platform')}</text>
          <text x="0" y="16" fontSize="10" fill={orange} fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('footer_subtitle', t('footer_subtitle', 'منصة إدارة الأعمال المتكاملة'))}>{t('footer_subtitle', 'منصة إدارة الأعمال المتكاملة')}</text>
          <text x="0" y="32" fontSize="9" fill="#aaa" fontFamily="Tajawal, sans-serif">طبع بتاريخ: {new Date().toLocaleDateString()}</text>
        </g>
        
        <g transform={getPos('footer_sig_box', 367, 55)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('footer_sig_box', e); }}>
          <line x1="-100" y1="0" x2="100" y2="0" stroke="#ccc" strokeWidth="1"/>
          <text x="0" y="18" fontSize="11" fill={navy} textAnchor="middle" fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('label_receiver', t('label_receiver', 'اسم وتوقيع المستلم / Receiver'))}>{t('label_receiver', 'اسم وتوقيع المستلم / Receiver')}</text>
        </g>
        
        <g transform={getPos('footer_stamp_box', 670, 45)} style={groupStyle} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('footer_stamp_box', e); }}>
          <circle cx="0" cy="0" r="38" fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="5,3"/>
          <text x="0" y="5" fontSize="10" fontWeight="800" fill="#ccc" textAnchor="middle" fontFamily="Tajawal, sans-serif" style={textStyle} onClick={() => onTextEdit?.('label_stamp', t('label_stamp', 'ختم الشركة'))}>{t('label_stamp', 'ختم الشركة')}</text>
          <text x="0" y="18" fontSize="9" fill="#ccc" textAnchor="middle" fontFamily="Tajawal, sans-serif">Stamp</text>
        </g>
      </g>

      {/* THANK YOU MESSAGE - Independent */}
      <text x="367" y="990" transform={getPos('thanks_pos', 0, 0)} fontSize="11" fontWeight="700" fill={navy} textAnchor="middle" fontFamily="Tajawal, sans-serif" style={{...textStyle, ...groupStyle}} onMouseDown={e => { e.stopPropagation(); onMoveStart?.('thanks_pos', e); }} onClick={() => onTextEdit?.('thanks_text', t('thanks_text', 'شكراً لتعاملكم معنا. يُرجى سداد الفاتورة في الموعد المحدد.'))}>{t('thanks_text', 'شكراً لتعاملكم معنا. يُرجى سداد الفاتورة في الموعد المحدد.')}</text>

      
      <rect x="0" y="1119" width="794" height="4" fill={orange}/>
    </svg>
  );
};
