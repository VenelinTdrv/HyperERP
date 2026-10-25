import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Check, CheckCheck, CircleDollarSign, Clock3, Eye, FileSpreadsheet, FileText, Info, MoreVertical, Pencil, Plus, Printer, RotateCcw, Search, ShieldCheck, Trash2, Wallet, X, XCircle } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOrders, total } from '@/lib/orders-store';
import { downloadPaymentsXls, openPaymentsPrint } from '@/lib/payments-export';
import { SELLERS, sellerType } from '@/lib/sellers';

export const Route = createFileRoute('/_workspace/payments')({
  head:()=>({meta:[{title:'HyperERP · Плащания'},{name:'description',content:'Плащания по продажбите от Еконт и Pigeon — наложен платеж и банков път, със статус и сума.'},{property:'og:title',content:'HyperERP · Плащания'},{property:'og:description',content:'Списък с плащания по продажби, филтри по вид, куриер и статус, създаване и редакция.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Payments,
});

const STATUSES=['Очаквано','Получено','Частично','Отказано','Върнато'] as const;
const METHODS=['Наложен платеж','Банков път'] as const;
const SOURCES=['Еконт','Pigeon'] as const;
const WAREHOUSES=['Склад Главен','Склад София','Склад Варна'] as const;
const CLIENT_META:Record<string,{phone:string;settlement:string;warehouse:string}>={
 'Мария Иванова':{phone:'0888214305',settlement:'Ямбол',warehouse:'Склад Главен'},
 'Иван Георгиев':{phone:'0899630112',settlement:'София',warehouse:'Склад София'},
 'Анна Стоянова':{phone:'0885472918',settlement:'Пловдив',warehouse:'Склад София'},
 'Румяна Дончева':{phone:'0877550241',settlement:'Варна',warehouse:'Склад Варна'},
 'Елена Петрова':{phone:'0898116734',settlement:'Ямбол',warehouse:'Склад Главен'},
 'Десислава Николова':{phone:'0876903552',settlement:'Бургас',warehouse:'Склад Варна'},
 'Петър Димитров':{phone:'0884276118',settlement:'София',warehouse:'Склад София'},
 'Стефан Колев':{phone:'0893641870',settlement:'Ямбол',warehouse:'Склад Главен'},
 'Кирил Атанасов':{phone:'0882308445',settlement:'Пловдив',warehouse:'Склад София'},
 'Ирина Георгиева':{phone:'0887952613',settlement:'Варна',warehouse:'Склад Варна'},
};
const meta=(c:string)=>CLIENT_META[c]??{phone:'',settlement:'',warehouse:''};
export { SELLERS, sellerType };
const todayISO=()=>new Date().toLocaleDateString('en-CA');
const day=(back:number)=>{const d=new Date();d.setDate(d.getDate()-back);return d.toLocaleDateString('en-CA');};
const ADMIN='Венелин Тодоров';
type Form={orderId:string;saleId:string;client:string;agent:string;amount:string;method:string;source:string;status:string;date:string;reference:string;note:string};
export type Payment=Form&{id:string;phone:string;settlement:string;warehouse:string;paid:string;edited?:string;editedBy?:string};
export type PaymentFilter={q:string;method:string;source:string;status:string;agent:string;from:string;to:string;orderedBy:string;phone:string;settlement:string;warehouse:string;amountFrom:string;amountTo:string;paidFrom:string;paidTo:string};
export const EXTRA_KEYS=['orderedBy','phone','settlement','warehouse','amountFrom','amountTo','paidFrom','paidTo'] as const;
export type ExtraFilter=Pick<PaymentFilter,typeof EXTRA_KEYS[number]>;
export const emptyExtra:ExtraFilter=Object.fromEntries(EXTRA_KEYS.map(k=>[k,''])) as ExtraFilter;
export const extraChanged=(draft:ExtraFilter,applied:ExtraFilter)=>EXTRA_KEYS.some(k=>draft[k]!==applied[k]);
const blank:Form={orderId:'',saleId:'',client:'',agent:'Виктория Григорова',amount:'',method:'Наложен платеж',source:'Еконт',status:'Очаквано',date:todayISO(),reference:'',note:''};
const p=(n:number,o:string,c:string,a:number,m:string,s:string,st:string,d:string,r:string,agent:string,edited?:string,editedBy?:string):Payment=>({id:`PAY-${String(n).padStart(5,'0')}`,orderId:o,saleId:o.replace('ORD','SAL'),client:c,agent,amount:a.toFixed(2),method:m,source:s,status:st,date:d,reference:r,note:'',...meta(c),paid:(st==='Получено'||st==='Частично')?d:'',edited:edited??'',editedBy:editedBy??''});
export const paymentMatches=(r:Payment,f:PaymentFilter)=>{const s=f.q.trim().toLocaleLowerCase('bg-BG');const who=f.orderedBy.trim().toLocaleLowerCase('bg-BG');const tel=f.phone.trim().replace(/\D/g,'');const town=f.settlement.trim().toLocaleLowerCase('bg-BG');const amt=Number(r.amount);return(!s||[r.id,r.orderId,r.saleId,r.client,r.reference,r.agent].some(v=>v.toLocaleLowerCase('bg-BG').includes(s)))&&(!f.method||r.method===f.method)&&(!f.source||r.source===f.source)&&(!f.agent||r.agent===f.agent)&&(!f.from||r.date>=f.from)&&(!f.to||r.date<=f.to)&&(!f.status||r.status===f.status)&&(!who||r.client.toLocaleLowerCase('bg-BG').includes(who))&&(!tel||r.phone.replace(/\D/g,'').includes(tel))&&(!town||r.settlement.toLocaleLowerCase('bg-BG').includes(town))&&(!f.warehouse||r.warehouse===f.warehouse)&&(f.amountFrom===''||amt>=Number(f.amountFrom.replace(',','.')))&&(f.amountTo===''||amt<=Number(f.amountTo.replace(',','.')))&&(!f.paidFrom||r.paid>=f.paidFrom)&&(!f.paidTo||r.paid<=f.paidTo);};
export const initial:Payment[]=[
 p(23,'ORD-0024','Мария Иванова',73.9,'Банков път','Pigeon','Получено',todayISO(),'PG-77166','Виктория Григорова',`${todayISO()}T11:20`,ADMIN),
 p(22,'ORD-0022','Иван Георгиев',88.9,'Наложен платеж','Еконт','Получено',todayISO(),'EC-1048941','Елена Петрова'),
 p(21,'ORD-0019','Анна Стоянова',56.9,'Наложен платеж','Pigeon','Очаквано',todayISO(),'PG-77163','Мария Иванова',`${day(1)}T15:42`,ADMIN),
 p(20,'ORD-0017','Румяна Дончева',112.9,'Банков път','Pigeon','Частично',todayISO(),'PG-77161','Козметик Груп ООД'),
 p(19,'ORD-0024','Мария Иванова',48.9,'Наложен платеж','Еконт','Получено',todayISO(),'EC-1048933','Виктория Григорова'),
 p(18,'ORD-0023','Елена Петрова',118.9,'Банков път','Pigeon','Очаквано',todayISO(),'PG-77160','Козметик Груп ООД'),
 p(17,'ORD-0022','Иван Георгиев',65.5,'Наложен платеж','Еконт','Частично',todayISO(),'EC-1048927','Елена Петрова',`${day(2)}T09:05`,ADMIN),
 p(16,'ORD-0021','Десислава Николова',89.9,'Банков път','Pigeon','Отказано',todayISO(),'PG-77158','Мария Иванова'),
 p(15,'ORD-0020','Петър Димитров',52.9,'Наложен платеж','Pigeon','Върнато',todayISO(),'PG-77153','Виктория Григорова'),
 p(14,'ORD-0019','Анна Стоянова',134.9,'Наложен платеж','Еконт','Получено',day(1),'EC-1048822','Козметик Груп ООД'),
 p(13,'ORD-0018','Стефан Колев',76.9,'Банков път','Pigeon','Очаквано',day(1),'PG-77119','Елена Петрова'),
 p(12,'ORD-0017','Румяна Дончева',99.9,'Наложен платеж','Еконт','Получено',day(2),'EC-1048688','Мария Иванова'),
 p(11,'ORD-0016','Кирил Атанасов',145.9,'Банков път','Pigeon','Частично',day(3),'PG-77066','Козметик Груп ООД'),
 p(10,'ORD-0024','Мария Иванова',102.9,'Наложен платеж','Еконт','Очаквано',todayISO(),'EC-1048820','Виктория Григорова'),
 p(9,'ORD-0023','Елена Петрова',73.9,'Банков път','Pigeon','Получено',day(1),'PG-77120','Мария Иванова'),
 p(8,'ORD-0022','Иван Георгиев',109.9,'Наложен платеж','Еконт','Получено',day(1),'EC-1048711','Козметик Груп ООД'),
 p(7,'ORD-0021','Десислава Николова',53.9,'Банков път','Pigeon','Частично',day(2),'PG-77098','Елена Петрова'),
 p(6,'ORD-0020','Петър Димитров',142.9,'Наложен платеж','Еконт','Отказано',day(2),'EC-1048602','Козметик Груп ООД'),
 p(5,'ORD-0019','Анна Стоянова',39.9,'Наложен платеж','Pigeon','Получено',day(3),'PG-77031','Виктория Григорова'),
 p(4,'ORD-0018','Стефан Колев',62.9,'Наложен платеж','Еконт','Върнато',day(4),'EC-1048455','Мария Иванова'),
 p(3,'ORD-0017','Румяна Дончева',82.9,'Банков път','Pigeon','Получено',day(4),'PG-76980','Елена Петрова'),
 p(2,'ORD-0016','Кирил Атанасов',211.9,'Наложен платеж','Еконт','Очаквано',day(5),'EC-1048301','Козметик Груп ООД'),
 p(1,'ORD-0015','Ирина Георгиева',123.9,'Банков път','Pigeon','Получено',day(6),'PG-76902','Козметик Груп ООД'),
];
export const paymentTotals=(rows:{amount:number|string;method:string;orderId?:string}[],shipping:Record<string,number>={})=>{const sum=(xs:{amount:number|string}[])=>Math.round(xs.reduce((a,r)=>a+Number(r.amount),0)*100)/100;const ship=Math.round(rows.reduce((a,r)=>a+Number(shipping[r.orderId??'']||0),0)*100)/100;const total=sum(rows);return{total,cash:sum(rows.filter(r=>r.method==='Наложен платеж')),shipping:ship,margin:Math.round((total-ship)*100)/100};};
// Sales per seller for the „Всички инфлуенсъри и търговци“ labels: amount and share of
// all sellers, over the same filters but ignoring the chosen person so the numbers stay stable.
export const sellerShare=(rows:Payment[],f:PaymentFilter)=>{const st=rows.filter(r=>paymentMatches(r,{...f,agent:''}));const totals=SELLERS.map(s=>({id:s.id,amount:Math.round(st.filter(r=>r.agent===s.id).reduce((a,r)=>a+Number(r.amount),0)*100)/100}));const total=Math.round(totals.reduce((a,r)=>a+r.amount,0)*100)/100;return Object.fromEntries(totals.map(r=>[r.id,{amount:r.amount,pct:total?(r.amount/total*100).toFixed(1):'0'}])) as Record<string,{amount:number;pct:string}>;};
const money=(v:number|string)=>`${Number(v).toLocaleString('bg-BG',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
const now=()=>new Date().toISOString();
const dateTime=(v:string)=>{const d=new Date(v);return `${d.toLocaleDateString('bg-BG')} · ${d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})}`;};
const tone:Record<string,string>={'Очаквано':'pending','Получено':'success','Частично':'info','Отказано':'danger','Върнато':'neutral'};
const TILE_ICONS:Record<(typeof STATUSES)[number],typeof Wallet>={'Очаквано':Clock3,'Получено':CheckCheck,'Частично':CircleDollarSign,'Отказано':XCircle,'Върнато':RotateCcw};
const TILE_TONE:Record<(typeof STATUSES)[number],string>={'Очаквано':'pending','Получено':'success','Частично':'info','Отказано':'danger','Върнато':'neutral'};

function Payments(){
 const orders=useOrders();
 const [rows,setRows]=useState(initial);
 const [q,setQ]=useState('');const [method,setMethod]=useState('');const [source,setSource]=useState('');const [status,setStatus]=useState('');const [agent,setAgent]=useState('');
 const [extra,setExtra]=useState<ExtraFilter>(emptyExtra);const [applied,setApplied]=useState<ExtraFilter>(emptyExtra);
 const setExtraKey=(k:keyof ExtraFilter,v:string)=>setExtra(prev=>({...prev,[k]:v}));
 const runSearch=()=>{setApplied(extra);setPage(1);};
 const enterToSearch=(ev:KeyboardEvent)=>{if(ev.key==='Enter'){ev.preventDefault();runSearch();}};
 const [from,setFrom]=useState(todayISO());const [to,setTo]=useState(todayISO());
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(25);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Payment|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Payment|null>(null);const [deleting,setDeleting]=useState<Payment|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const base=rows.filter(r=>paymentMatches(r,{q,method,source,status:'',agent,from,to,...applied}));
 const share=sellerShare(rows,{q,method,source,status:'',agent:'',from,to,...applied});
 const filtered=base.filter(r=>!status||r.status===status);
 const tiles=[{label:'Всички',Icon:Wallet,value:base.length,status:'',tone:'info'},...STATUSES.map(st=>({label:st,Icon:TILE_ICONS[st],value:base.filter(r=>r.status===st).length,status:st,tone:TILE_TONE[st]}))];
 const pages=Math.max(1,Math.ceil(filtered.length/(pageSize||filtered.length||1)));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*(pageSize||filtered.length),(cur-1)*(pageSize||filtered.length)+pageSize||filtered.length);
 const sum=filtered.filter(r=>r.status==='Получено').reduce((a,r)=>a+Number(r.amount),0);
 const shippingByOrder=Object.fromEntries(orders.map(o=>[o.id,o.shipping]));const { total: totalAll, cash: cashTotal, shipping: shippingTotal, margin: marginTotal } = paymentTotals(filtered, shippingByOrder);
 const datesChanged=from!==todayISO()||to!==todayISO();const extraDirty=Object.values(applied).some(Boolean)||extraChanged(extra,applied);
 const exportXls=()=>downloadPaymentsXls(filtered);
 const exportPdf=()=>openPaymentsPrint(filtered,'Плащания');
 const exportPrint=exportPdf;
 const clear=()=>{setQ('');setMethod('');setSource('');setStatus('');setAgent('');setExtra(emptyExtra);setApplied(emptyExtra);setFrom(todayISO());setTo(todayISO());setPage(1);};
 const open=(x:Payment|null)=>{setSelected(null);setEditing(x);setErrors({});setForm(x?{...x}:{...blank});setEditor(true);};
 const set=(k:keyof Form,v:string)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>{const n={...e};delete n[k];return n;});};
 const pickOrder=(id:string)=>{const o=orders.find(x=>x.id===id);const own=o?.influencer&&SELLERS.some(x=>x.id===o.influencer)?o.influencer:'';setForm(f=>({...f,orderId:id,saleId:id?id.replace('ORD','SAL'):'',client:o?.customer??f.client,agent:own||f.agent,amount:o?total(o).toFixed(2):f.amount,method:o?.payment==='Банков път'?'Банков път':o?'Наложен платеж':f.method,source:o?(o.courier==='Еконт'?'Еконт':'Pigeon'):f.source}));setErrors({});};
 const changeStatus=(id:string,st:string)=>{setRows(prev=>prev.map(r=>r.id===id?{...r,status:st,paid:(st==='Получено'||st==='Частично')?(r.paid||todayISO()):'',edited:now(),editedBy:ADMIN}:r));setAnnouncement(`${id} · Статусът е сменен на „${st}“ само в демонстрацията.`);};
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Record<string,string>={};
  if(!form.orderId.trim())er['orderId']='Въведете номер на поръчка';
  if(!form.client.trim())er['client']='Въведете клиент';
  const a=Number(form.amount.replace(',','.'));
  if(!form.amount.trim()||!Number.isFinite(a)||a<=0)er['amount']='Въведете сума по-голяма от 0';
  if(!form.date)er['date']='Изберете дата';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`pay-${Object.keys(er)[0]}`)?.focus();return;}
  const data={...form,orderId:form.orderId.trim(),saleId:form.saleId.trim()||form.orderId.trim().replace('ORD','SAL'),client:form.client.trim(),amount:a.toFixed(2),reference:form.reference.trim(),note:form.note.trim()};
  let id=editing?.id??'';
  if(editing)setRows(prev=>prev.map(r=>r.id===editing.id?{...r,...data,id:editing.id,paid:(data.status==='Получено'||data.status==='Частично')?(r.paid||data.date):'',edited:now(),editedBy:ADMIN}:r));
  else{const n=Math.max(0,...rows.map(r=>Number(r.id.slice(4))))+1;id=`PAY-${String(n).padStart(5,'0')}`;setRows(prev=>[{...data,id,phone:'',settlement:'',warehouse:'',paid:(data.status==='Получено'||data.status==='Частично')?data.date:''},...prev]);}
  setEditor(false);setAnnouncement(`${id} · ${editing?'Промените са приложени':'Плащането е добавено'} само в демонстрацията.`);
 };
 const remove=()=>{if(!deleting)return;setRows(prev=>prev.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.id} · Плащането е изтрито само в демонстрацията.`);setDeleting(null);};
 const err=(k:string)=>errors[k]?<p id={`pay-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>:null;
 const input=(k:keyof Form,label:string,o:{req?:boolean;ph?:string;type?:string}={})=><div className="field"><label htmlFor={`pay-${k}`}>{label}{o.req&&<span className="required">*</span>}</label><input id={`pay-${k}`} type={o.type??'text'} placeholder={o.ph} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`pay-${k}-error`:undefined} onChange={ev=>set(k,ev.target.value)}/>{err(k)}</div>;
 const sel=(k:keyof Form,label:string,opts:readonly string[],toneValue?:string)=><div className="field"><label htmlFor={`pay-${k}`}>{label}</label><select id={`pay-${k}`} data-tone={toneValue} value={form[k]} onChange={ev=>set(k,ev.target.value)}>{opts.map(x=><option key={x} value={x}>{x}</option>)}</select></div>;
 return <WorkspaceShell active="Плащания"><div className="page-content deliveries-content orders-content payments-content">
  <div className="page-heading deliveries-heading payments-heading"><div className="heading-title"><h1>Плащания<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Плащания по продажбите, получени от Еконт и Pigeon — наложен платеж или банков път. По подразбиране се показват само плащанията за настоящия ден — променете периода „От/До дата“, за да видите повече. Броячите горе филтрират по статус в рамките на избрания период. Филтрирай и по инфлуенсър или търговец. Статусът се сменя директно от реда.</TooltipContent></Tooltip></TooltipProvider></h1></div>
  <div className="delivery-overview" aria-label="Броячи по статус">{tiles.map(t=><Button key={t.label} variant="ghost" className={`delivery-metric payments-metric tone-${t.tone} ${status===t.status?'is-selected':''}`} aria-pressed={status===t.status} onClick={()=>{setStatus(t.status);setPage(1);}}><span className="metric-icon"><t.Icon size={14}/></span><span className="metric-copy"><span>{t.label}</span><strong>{t.value}</strong></span></Button>)}</div>
  <div className="flex gap-2 flex-wrap"><Button variant="outline" size="icon" aria-label="Печат" title="Печат" onClick={exportPrint}><Printer/></Button><Button variant="outline" size="icon" aria-label="Експорт в PDF" title="Експорт в PDF" onClick={exportPdf}><FileText className="text-destructive"/></Button><Button variant="outline" size="icon" aria-label="Експорт в XLS" title="Експорт в XLS" onClick={exportXls}><FileSpreadsheet className="text-primary"/></Button><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Ново плащане</Button></div></div>
  <div className="suppliers-filters transfers-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Търсене" placeholder="Плащане, поръчка, клиент…" value={q} onChange={ev=>{setQ(ev.target.value);setPage(1);}}/></div>
   <div className="field"><input id="pay-from" type="date" aria-label="От дата" value={from} onChange={ev=>{setFrom(ev.target.value);setPage(1);}}/></div>
   <div className="field"><input id="pay-to" type="date" aria-label="До дата" value={to} onChange={ev=>{setTo(ev.target.value);setPage(1);}}/></div>
   <div className="field"><select aria-label="Статус" value={status} onChange={ev=>{setStatus(ev.target.value);setPage(1);}}><option value="">Всички статуси</option>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><select aria-label="Инфлуенсър / Търговец" value={agent} onChange={ev=>{setAgent(ev.target.value);setPage(1);}}><option value="">Всички инфлуенсъри и търговци</option>{SELLERS.map(s=><option key={s.id} value={s.id}>{s.id} · {s.type} · {money(share[s.id]!.amount)} · {share[s.id]!.pct}%</option>)}</select></div>
   <div className="field"><select aria-label="Вид плащане" value={method} onChange={ev=>{setMethod(ev.target.value);setPage(1);}}><option value="">Всички видове</option>{METHODS.map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><select aria-label="Куриер" value={source} onChange={ev=>{setSource(ev.target.value);setPage(1);}}><option value="">Всички куриери</option>{SOURCES.map(x=><option key={x}>{x}</option>)}</select></div>
   <Button variant="outline" disabled={!q&&!method&&!source&&!status&&!agent&&!datesChanged&&!extraDirty} onClick={clear}><X/>Изчисти</Button></div>
  <div className="suppliers-filters transfers-filters payments-filters-extra">
   <div className="field"><label htmlFor="pay-f-ordered">Поръчана от</label><input id="pay-f-ordered" placeholder="Име на поръчителя" value={extra.orderedBy} onChange={ev=>setExtraKey('orderedBy',ev.target.value)} onKeyDown={enterToSearch}/></div>
   <div className="field"><label htmlFor="pay-f-phone">Телефон</label><input id="pay-f-phone" type="tel" placeholder="Телефон" value={extra.phone} onChange={ev=>setExtraKey('phone',ev.target.value)} onKeyDown={enterToSearch}/></div>
   <div className="field"><label htmlFor="pay-f-settlement">Населено място</label><input id="pay-f-settlement" placeholder="Населено място" value={extra.settlement} onChange={ev=>setExtraKey('settlement',ev.target.value)} onKeyDown={enterToSearch}/></div>
   <div className="field"><label htmlFor="pay-f-warehouse">Склад</label><select id="pay-f-warehouse" value={extra.warehouse} onChange={ev=>setExtraKey('warehouse',ev.target.value)} onKeyDown={enterToSearch}><option value="">Всички</option>{WAREHOUSES.map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><label htmlFor="pay-f-amount-from">Сума (€)</label><div className="range-group"><input id="pay-f-amount-from" type="number" min="0" step="0.01" placeholder="От" aria-label="Сума от" value={extra.amountFrom} onChange={ev=>setExtraKey('amountFrom',ev.target.value)} onKeyDown={enterToSearch}/><input type="number" min="0" step="0.01" placeholder="До" aria-label="Сума до" value={extra.amountTo} onChange={ev=>setExtraKey('amountTo',ev.target.value)} onKeyDown={enterToSearch}/></div></div>
   <div className="field"><label htmlFor="pay-f-paid-from">Платено на</label><div className="range-group"><input id="pay-f-paid-from" type="date" aria-label="Платено от" value={extra.paidFrom} onChange={ev=>setExtraKey('paidFrom',ev.target.value)} onKeyDown={enterToSearch}/><input type="date" aria-label="Платено до" value={extra.paidTo} onChange={ev=>setExtraKey('paidTo',ev.target.value)} onKeyDown={enterToSearch}/></div></div>
   <Button type="button" variant="outline" className="payments-run-search" aria-label="Търси" title="Търси — прилага филтрите от втория ред" onClick={runSearch}><Search/></Button>
  </div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с плащания"><div className="delivery-list-heading"><h2>Всички плащания <span>{filtered.length}</span></h2><span className="text-xs text-muted-foreground">Получени: <strong className="text-foreground">{money(String(sum))}</strong></span></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>Плащане</th><th>Поръчка / Продажба</th><th>Клиент</th><th>Инфлуенсър / Търговец</th><th>Вид</th><th>Куриер</th><th className="text-right">Сума</th><th>Дата</th><th>Статус</th><th>Редактирано от</th><th className="text-center">Действия</th><th className="text-center">Виж</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}>
    <td><span className="delivery-id">{r.id}</span></td>
    <td><span className="block">{r.orderId}</span><span className="text-[10px] text-muted-foreground">{r.saleId}</span></td>
    <td>{r.client}</td>
    <td><span className="block">{r.agent}</span><span className="text-[10px] text-muted-foreground">{sellerType(r.agent)}</span></td>
    <td>{r.method}</td>
    <td><span className="block">{r.source}</span>{r.reference&&<span className="text-[10px] text-muted-foreground">{r.reference}</span>}</td>
    <td className="text-right font-semibold">{money(r.amount)}</td>
    <td>{r.date.split('-').reverse().join('.')}</td>
    <td><div className="field"><select aria-label={`Статус на ${r.id}`} data-tone={tone[r.status]} value={r.status} onChange={ev=>changeStatus(r.id,ev.target.value)}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></div></td>
    <td>{r.edited?<><span className="block">{dateTime(r.edited)}</span><span className="text-[10px] text-muted-foreground">{r.editedBy||ADMIN}</span></>:<span className="text-[10px] text-muted-foreground">—</span>}</td>
    <td className="text-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${r.id}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuItem onSelect={()=>changeStatus(r.id,'Получено')} disabled={r.status==='Получено'}><Check/>Отбележи като получено</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
    <td className="text-center"><Button variant="ghost" size="icon" aria-label={`Виж ${r.id}`} onClick={()=>setSelected(r)}><Eye/></Button></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><Wallet size={32}/><h3>{rows.length?'Няма намерени плащания':'Все още няма плащания'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти филтрите</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Ново плащане</Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} className="payments-footrow" id="payments-page-size" middle={<div className="payments-summary"><div className="payments-summary-field is-info"><span>Обща сума</span><strong>{money(totalAll)}</strong><small>наложен {money(cashTotal)}</small></div><div className="payments-summary-field is-warning"><span>Сума доставни цени</span><strong>{money(shippingTotal)}</strong></div><div className="payments-summary-field is-success"><span>Горница</span><strong>{money(marginTotal)}</strong><small>обща − доставни</small></div></div>} />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни плащания · без реална връзка с Еконт и Pigeon и без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{editing?`Редактиране на ${editing.id}`:'Ново плащане'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    <div className="field"><label htmlFor="pay-orderId">Поръчка<span className="required">*</span></label><input id="pay-orderId" list="pay-orders" placeholder="ORD-0024" value={form.orderId} aria-invalid={Boolean(errors['orderId'])} aria-describedby={errors['orderId']?'pay-orderId-error':undefined} onChange={ev=>{const v=ev.target.value;orders.some(o=>o.id===v)?pickOrder(v):set('orderId',v);}}/><datalist id="pay-orders">{orders.map(o=><option key={o.id} value={o.id}>{o.customer}</option>)}</datalist>{err('orderId')}</div>
    {input('saleId','Продажба',{ph:'SAL-0024'})}
    {input('client','Клиент',{req:true,ph:'Име на клиента'})}
    {sel('agent','Инфлуенсър / Търговец',SELLERS.map(s=>s.id))}
    {input('amount','Сума (€)',{req:true,ph:'0.00'})}
    {sel('method','Вид плащане',METHODS)}
    {sel('source','Куриер',SOURCES)}
    {sel('status','Статус',STATUSES,tone[form.status])}
    {input('date','Дата',{req:true,type:'date'})}
    {input('reference','Референция от куриера',{ph:'EC-1048820'})}
    {input('note','Бележка')}
   </div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?.id}</DialogTitle><DialogDescription>Детайли за плащането · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>Поръчка</dt><dd>{selected.orderId}</dd></div><div><dt>Продажба</dt><dd>{selected.saleId}</dd></div>
  <div><dt>Клиент</dt><dd>{selected.client}</dd></div><div><dt>Инфлуенсър / Търговец</dt><dd>{selected.agent}</dd></div><div><dt>Сума</dt><dd>{money(selected.amount)}</dd></div>
  <div><dt>Вид</dt><dd>{selected.method}</dd></div><div><dt>Куриер</dt><dd>{selected.source}{selected.reference?` · ${selected.reference}`:''}</dd></div>
  <div><dt>Статус</dt><dd><span className={`pay-status tone-${tone[selected.status]}`}><span/>{selected.status}</span></dd></div><div><dt>Дата</dt><dd>{selected.date.split('-').reverse().join('.')}</dd></div><div><dt>Редактирано от</dt><dd>{selected.edited?`${dateTime(selected.edited)} · ${selected.editedBy||ADMIN}`:'—'}</dd></div>
  {selected.note&&<div><dt>Бележка</dt><dd>{selected.note}</dd></div>}
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на плащане?</DialogTitle><DialogDescription>„{deleting?.id}“ ще бъде премахнато само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий плащането</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
