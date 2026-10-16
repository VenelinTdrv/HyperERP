import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, Info, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, Wallet, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOrders, total } from '@/lib/orders-store';

export const Route = createFileRoute('/payments')({
  head:()=>({meta:[{title:'HyperERP · Плащания'},{name:'description',content:'Плащания по продажбите от Еконт и Pigeon — наложен платеж и банков превод, със статус и сума.'},{property:'og:title',content:'HyperERP · Плащания'},{property:'og:description',content:'Списък с плащания по продажби, филтри по вид, източник и статус, създаване и редакция.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Payments,
});

const STATUSES=['Очаквано','Получено','Частично','Отказано','Върнато'] as const;
const METHODS=['Наложен платеж','Банков превод'] as const;
const SOURCES=['Еконт','Pigeon'] as const;
type Form={orderId:string;saleId:string;client:string;amount:string;method:string;source:string;status:string;date:string;reference:string;note:string};
type Payment=Form&{id:string};
const blank:Form={orderId:'',saleId:'',client:'',amount:'',method:'Наложен платеж',source:'Еконт',status:'Очаквано',date:'2026-10-16',reference:'',note:''};
const p=(n:number,o:string,c:string,a:number,m:string,s:string,st:string,d:string,r:string):Payment=>({id:`PAY-${String(n).padStart(5,'0')}`,orderId:o,saleId:o.replace('ORD','SAL'),client:c,amount:a.toFixed(2),method:m,source:s,status:st,date:d,reference:r,note:''});
const initial:Payment[]=[
 p(10,'ORD-0024','Мария Иванова',102.9,'Наложен платеж','Еконт','Очаквано','2026-10-16','EC-1048820'),
 p(9,'ORD-0023','Елена Петрова',73.9,'Банков превод','Pigeon','Получено','2026-10-15','PG-77120'),
 p(8,'ORD-0022','Иван Георгиев',109.9,'Наложен платеж','Еконт','Получено','2026-10-15','EC-1048711'),
 p(7,'ORD-0021','Десислава Николова',53.9,'Банков превод','Pigeon','Частично','2026-10-14','PG-77098'),
 p(6,'ORD-0020','Петър Димитров',142.9,'Наложен платеж','Еконт','Отказано','2026-10-14','EC-1048602'),
 p(5,'ORD-0019','Анна Стоянова',39.9,'Наложен платеж','Pigeon','Получено','2026-10-13','PG-77031'),
 p(4,'ORD-0018','Стефан Колев',62.9,'Наложен платеж','Еконт','Върнато','2026-10-12','EC-1048455'),
 p(3,'ORD-0017','Румяна Дончева',82.9,'Банков превод','Pigeon','Получено','2026-10-12','PG-76980'),
 p(2,'ORD-0016','Кирил Атанасов',211.9,'Наложен платеж','Еконт','Очаквано','2026-10-11','EC-1048301'),
 p(1,'ORD-0015','Ирина Георгиева',123.9,'Банков превод','Pigeon','Получено','2026-10-10','PG-76902'),
];
const PAGE=10;
const money=(v:string)=>`${Number(v).toLocaleString('bg-BG',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
const tone:Record<string,string>={'Очаквано':'pending','Получено':'success','Частично':'pending','Отказано':'danger','Върнато':'danger'};
const todayISO=()=>new Date().toLocaleDateString('en-CA');

function Payments(){
 const orders=useOrders();
 const [rows,setRows]=useState(initial);
 const [q,setQ]=useState('');const [method,setMethod]=useState('');const [source,setSource]=useState('');const [status,setStatus]=useState('');
 const [page,setPage]=useState(1);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Payment|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Payment|null>(null);const [deleting,setDeleting]=useState<Payment|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const s=q.trim().toLocaleLowerCase('bg-BG');
 const filtered=rows.filter(r=>(!s||[r.id,r.orderId,r.saleId,r.client,r.reference].some(v=>v.toLocaleLowerCase('bg-BG').includes(s)))&&(!method||r.method===method)&&(!source||r.source===source)&&(!status||r.status===status));
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*PAGE,cur*PAGE);
 const sum=filtered.filter(r=>r.status==='Получено').reduce((a,r)=>a+Number(r.amount),0);
 const clear=()=>{setQ('');setMethod('');setSource('');setStatus('');setPage(1);};
 const open=(x:Payment|null)=>{setSelected(null);setEditing(x);setErrors({});setForm(x?{...x}:{...blank});setEditor(true);};
 const set=(k:keyof Form,v:string)=>{setForm(f=>({...f,[k]:v}));setErrors(e=>{const n={...e};delete n[k];return n;});};
 const pickOrder=(id:string)=>{const o=orders.find(x=>x.id===id);setForm(f=>({...f,orderId:id,saleId:id?id.replace('ORD','SAL'):'',client:o?.customer??f.client,amount:o?total(o).toFixed(2):f.amount,method:o?.payment==='Банков превод'?'Банков превод':o?'Наложен платеж':f.method,source:o?(o.courier==='Еконт'?'Еконт':'Pigeon'):f.source}));setErrors({});};
 const changeStatus=(id:string,st:string)=>{setRows(prev=>prev.map(r=>r.id===id?{...r,status:st}:r));setAnnouncement(`${id} · Статусът е сменен на „${st}“ само в демонстрацията.`);};
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
  if(editing)setRows(prev=>prev.map(r=>r.id===editing.id?{...data,id:editing.id}:r));
  else{const n=Math.max(0,...rows.map(r=>Number(r.id.slice(4))))+1;id=`PAY-${String(n).padStart(5,'0')}`;setRows(prev=>[{...data,id},...prev]);}
  setEditor(false);setAnnouncement(`${id} · ${editing?'Промените са приложени':'Плащането е добавено'} само в демонстрацията.`);
 };
 const remove=()=>{if(!deleting)return;setRows(prev=>prev.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.id} · Плащането е изтрито само в демонстрацията.`);setDeleting(null);};
 const err=(k:string)=>errors[k]?<p id={`pay-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>:null;
 const input=(k:keyof Form,label:string,o:{req?:boolean;ph?:string;type?:string}={})=><div className="field"><label htmlFor={`pay-${k}`}>{label}{o.req&&<span className="required">*</span>}</label><input id={`pay-${k}`} type={o.type??'text'} placeholder={o.ph} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`pay-${k}-error`:undefined} onChange={ev=>set(k,ev.target.value)}/>{err(k)}</div>;
 const sel=(k:keyof Form,label:string,opts:readonly string[])=><div className="field"><label htmlFor={`pay-${k}`}>{label}</label><select id={`pay-${k}`} value={form[k]} onChange={ev=>set(k,ev.target.value)}>{opts.map(x=><option key={x} value={x}>{x}</option>)}</select></div>;
 return <WorkspaceShell active="Плащания"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Плащания<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Плащания по продажбите, получени от Еконт и Pigeon — наложен платеж или банков превод. Статусът се сменя директно от реда.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Ново плащане</Button></div>
  <div className="suppliers-filters transfers-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Търсене" placeholder="Плащане, поръчка, клиент…" value={q} onChange={ev=>{setQ(ev.target.value);setPage(1);}}/></div>
   <div className="field"><select aria-label="Вид плащане" value={method} onChange={ev=>{setMethod(ev.target.value);setPage(1);}}><option value="">Всички видове</option>{METHODS.map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><select aria-label="Източник" value={source} onChange={ev=>{setSource(ev.target.value);setPage(1);}}><option value="">Всички източници</option>{SOURCES.map(x=><option key={x}>{x}</option>)}</select></div>
   <div className="field"><select aria-label="Статус" value={status} onChange={ev=>{setStatus(ev.target.value);setPage(1);}}><option value="">Всички статуси</option>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></div>
   <Button variant="outline" disabled={!q&&!method&&!source&&!status} onClick={clear}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с плащания"><div className="delivery-list-heading"><h2>Всички плащания <span>{filtered.length}</span></h2><span className="text-xs text-muted-foreground">Получени: <strong className="text-foreground">{money(String(sum))}</strong></span></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>Плащане</th><th>Поръчка / Продажба</th><th>Клиент</th><th>Вид</th><th>Източник</th><th className="text-right">Сума</th><th>Дата</th><th>Статус</th><th className="text-center">Действия</th><th className="text-center">Виж</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}>
    <td><span className="delivery-id">{r.id}</span></td>
    <td><span className="block">{r.orderId}</span><span className="text-[10px] text-muted-foreground">{r.saleId}</span></td>
    <td>{r.client}</td>
    <td>{r.method}</td>
    <td><span className="block">{r.source}</span>{r.reference&&<span className="text-[10px] text-muted-foreground">{r.reference}</span>}</td>
    <td className="text-right font-semibold">{money(r.amount)}</td>
    <td>{r.date.split('-').reverse().join('.')}</td>
    <td><div className="field"><select aria-label={`Статус на ${r.id}`} data-tone={tone[r.status]} value={r.status} onChange={ev=>changeStatus(r.id,ev.target.value)}>{STATUSES.map(x=><option key={x}>{x}</option>)}</select></div></td>
    <td className="text-center"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${r.id}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuItem onSelect={()=>changeStatus(r.id,'Получено')} disabled={r.status==='Получено'}><Check/>Отбележи като получено</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
    <td className="text-center"><Button variant="ghost" size="icon" aria-label={`Виж ${r.id}`} onClick={()=>setSelected(r)}><Eye/></Button></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><Wallet size={32}/><h3>{rows.length?'Няма намерени плащания':'Все още няма плащания'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти филтрите</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Ново плащане</Button>}</div>}
   <div className="delivery-pagination"><span>{filtered.length?`${(cur-1)*PAGE+1}–${Math.min(cur*PAGE,filtered.length)} от ${filtered.length}`:'0 резултата'}</span><div className="delivery-pagination-controls"><Button variant="ghost" size="icon" aria-label="Предишна страница" disabled={cur<=1} onClick={()=>setPage(cur-1)}><ChevronLeft/></Button><span>{cur} / {pages}</span><Button variant="ghost" size="icon" aria-label="Следваща страница" disabled={cur>=pages} onClick={()=>setPage(cur+1)}><ChevronRight/></Button></div></div>
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни плащания · без реална връзка с Еконт и Pigeon и без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{editing?`Редактиране на ${editing.id}`:'Ново плащане'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    <div className="field"><label htmlFor="pay-orderId">Поръчка<span className="required">*</span></label><input id="pay-orderId" list="pay-orders" placeholder="ORD-0024" value={form.orderId} aria-invalid={Boolean(errors['orderId'])} aria-describedby={errors['orderId']?'pay-orderId-error':undefined} onChange={ev=>{const v=ev.target.value;orders.some(o=>o.id===v)?pickOrder(v):set('orderId',v);}}/><datalist id="pay-orders">{orders.map(o=><option key={o.id} value={o.id}>{o.customer}</option>)}</datalist>{err('orderId')}</div>
    {input('saleId','Продажба',{ph:'SAL-0024'})}
    {input('client','Клиент',{req:true,ph:'Име на клиента'})}
    {input('amount','Сума (€)',{req:true,ph:'0.00'})}
    {sel('method','Вид плащане',METHODS)}
    {sel('source','Източник',SOURCES)}
    {sel('status','Статус',STATUSES)}
    {input('date','Дата',{req:true,type:'date'})}
    {input('reference','Референция от източника',{ph:'EC-1048820'})}
    {input('note','Бележка')}
   </div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?.id}</DialogTitle><DialogDescription>Детайли за плащането · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>Поръчка</dt><dd>{selected.orderId}</dd></div><div><dt>Продажба</dt><dd>{selected.saleId}</dd></div>
  <div><dt>Клиент</dt><dd>{selected.client}</dd></div><div><dt>Сума</dt><dd>{money(selected.amount)}</dd></div>
  <div><dt>Вид</dt><dd>{selected.method}</dd></div><div><dt>Източник</dt><dd>{selected.source}{selected.reference?` · ${selected.reference}`:''}</dd></div>
  <div><dt>Статус</dt><dd>{selected.status}</dd></div><div><dt>Дата</dt><dd>{selected.date.split('-').reverse().join('.')}</dd></div>
  {selected.note&&<div><dt>Бележка</dt><dd>{selected.note}</dd></div>}
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на плащане?</DialogTitle><DialogDescription>„{deleting?.id}“ ще бъде премахнато само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий плащането</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
