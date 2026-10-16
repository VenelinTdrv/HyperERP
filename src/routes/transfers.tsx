import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Info, Minus, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { comboProducts } from '@/lib/combo-data';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/transfers')({
  head:()=>({meta:[{title:'HyperERP · Трансфер на стоки'},{name:'description',content:'Трансфери на стока между складове със статуси, артикули, количества и експорт в PDF и XLS.'},{property:'og:title',content:'HyperERP · Трансфер на стоки'},{property:'og:description',content:'Преместване на стока от един склад в друг в HyperERP.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Transfers,
});

const warehouses=['Склад Главен','Склад София','Склад Варна','Виртуален — Ема','Виртуален — Виктория','Виртуален — Връщания'];
const statuses=['Необработен','Потвърден','Завършен','Отказан'] as const;
type Status=typeof statuses[number];
const users=['Венелин Тодоров','Виктория Григорова','Елена Петрова'];
type Item={productId:number;quantity:number};
type Transfer={id:number;doc:string;created:string;createdBy:string;from:string;to:string;status:Status;description:string;items:Item[]};
type Stock=Record<string,Record<number,number>>;
const initialStock:Stock=Object.fromEntries(warehouses.map((w,wi)=>[w,Object.fromEntries(comboProducts.map(p=>[p.id,wi<3?40-wi*10+p.id:5+p.id]))]));
const initial:Transfer[]=[
 {id:10,doc:'TR-0000010',created:'2026-10-16T09:10',createdBy:'Елена Петрова',from:'Склад Главен',to:'Склад Варна',status:'Необработен',description:'Презареждане на варненския склад.',items:[{productId:2,quantity:8}]},
 {id:9,doc:'TR-0000009',created:'2026-10-15T15:45',createdBy:'Виктория Григорова',from:'Склад София',to:'Виртуален — Ема',status:'Потвърден',description:'Подаръци за кампания.',items:[{productId:1,quantity:3},{productId:5,quantity:4}]},
 {id:8,doc:'TR-0000008',created:'2026-10-15T11:25',createdBy:'Венелин Тодоров',from:'Склад Варна',to:'Виртуален — Връщания',status:'Завършен',description:'Връщане на непродадена стока.',items:[{productId:4,quantity:5}]},
 {id:7,doc:'TR-0000007',created:'2026-10-14T18:05',createdBy:'Елена Петрова',from:'Склад Главен',to:'Склад София',status:'Отказан',description:'Отменено зареждане.',items:[{productId:9,quantity:2}]},
 {id:1,doc:'TR-0000006',created:'2026-10-14T10:20',createdBy:'Венелин Тодоров',from:'Склад Главен',to:'Склад София',status:'Необработен',description:'Зареждане на столичния склад.',items:[{productId:1,quantity:5},{productId:4,quantity:10}]},
 {id:2,doc:'TR-0000005',created:'2026-10-13T16:05',createdBy:'Виктория Григорова',from:'Склад Главен',to:'Виртуален — Виктория',status:'Потвърден',description:'Мостри за кампания.',items:[{productId:2,quantity:3}]},
 {id:3,doc:'TR-0000004',created:'2026-10-12T09:40',createdBy:'Венелин Тодоров',from:'Склад София',to:'Склад Варна',status:'Завършен',description:'',items:[{productId:7,quantity:2},{productId:8,quantity:1}]},
 {id:4,doc:'TR-0000003',created:'2026-10-10T14:12',createdBy:'Елена Петрова',from:'Виртуален — Ема',to:'Виртуален — Връщания',status:'Отказан',description:'Грешно избран склад.',items:[{productId:3,quantity:1}]},
 {id:5,doc:'TR-0000002',created:'2026-10-08T11:00',createdBy:'Венелин Тодоров',from:'Склад Варна',to:'Склад Главен',status:'Завършен',description:'Връщане на излишък.',items:[{productId:5,quantity:6}]},
 {id:6,doc:'TR-0000001',created:'2026-10-05T08:30',createdBy:'Виктория Григорова',from:'Склад Главен',to:'Склад Варна',status:'Завършен',description:'',items:[{productId:6,quantity:4},{productId:9,quantity:2}]},
];
const PAGE=10;
const fmt=(v:string)=>new Date(v).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const cls:Record<Status,string>={'Необработен':'','Потвърден':'neutral','Завършен':'received','Отказан':'cancelled'};
const product=(id:number)=>comboProducts.find(p=>p.id===id);
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]??c));

function tableHtml(rows:Transfer[]){
 const head=['Документ номер','Дата на създаване','От склад','Към склад','Статус','Създаден от','Артикули'];
 return `<table border="1" cellpadding="4" style="border-collapse:collapse;font-family:sans-serif;font-size:11px"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.doc)}</td><td>${fmt(r.created)}</td><td>${esc(r.from)}</td><td>${esc(r.to)}</td><td>${r.status}</td><td>${esc(r.createdBy)}</td><td>${r.items.map(i=>`${esc(product(i.productId)?.sku??'')} ${esc(product(i.productId)?.name??'')} × ${i.quantity}`).join('<br>')}</td></tr>`).join('')}</tbody></table>`;
}

function Transfers(){
 const [rows,setRows]=useState(initial);const [stock,setStock]=useState(initialStock);
 const [docQ,setDocQ]=useState('');const [dateFrom,setDateFrom]=useState('');const [dateTo,setDateTo]=useState('');const [statusQ,setStatusQ]=useState('');const [userQ,setUserQ]=useState('');
 const [page,setPage]=useState(1);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Transfer|null>(null);
 const [form,setForm]=useState({from:'',to:'',description:'',items:[] as Item[]});const [errors,setErrors]=useState<Record<string,string>>({});
 const [picker,setPicker]=useState(false);const [pq,setPq]=useState('');
 const [selected,setSelected]=useState<Transfer|null>(null);const [deleting,setDeleting]=useState<Transfer|null>(null);
 const [selection,setSelection]=useState<number[]>([]);
 const [announcement,setAnnouncement]=useState('');
 const q=docQ.trim().toLowerCase();
 const filtered=rows.filter(r=>(!q||r.doc.toLowerCase().includes(q))&&(!dateFrom||r.created.slice(0,10)>=dateFrom)&&(!dateTo||r.created.slice(0,10)<=dateTo)&&(!statusQ||r.status===statusQ)&&(!userQ||r.createdBy===userQ));
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*PAGE,cur*PAGE);
 const pageIds=shown.map(r=>r.id);
 const allSelected=pageIds.length>0&&pageIds.every(id=>selection.includes(id));
 const someSelected=pageIds.some(id=>selection.includes(id));
 const toggleAll=(on:boolean)=>setSelection(p=>on?[...new Set([...p,...pageIds])]:p.filter(id=>!pageIds.includes(id)));
 const toggleRow=(id:number,on:boolean)=>setSelection(p=>on?[...new Set([...p,id])]:p.filter(x=>x!==id));
 const anyFilter=Boolean(docQ||dateFrom||dateTo||statusQ||userQ);
 const clear=()=>{setDocQ('');setDateFrom('');setDateTo('');setStatusQ('');setUserQ('');setPage(1);};
 const open=(t:Transfer|null)=>{setSelected(null);setEditing(t);setErrors({});setForm(t?{from:t.from,to:t.to,description:t.description,items:t.items.map(i=>({...i}))}:{from:'',to:'',description:'',items:[]});setEditor(true);};
 const clearErr=(k:string)=>setErrors(x=>{const n={...x};delete n[k];return n;});
 const avail=(w:string,id:number)=>stock[w]?.[id]??0;
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Record<string,string>={};
  if(!form.from)er['from']='Изберете склад, от който се изпраща';
  if(!form.to)er['to']='Изберете склад, който приема';
  else if(form.to===form.from)er['to']='Складовете трябва да са различни';
  if(!form.items.length)er['items']='Добавете поне един артикул';
  else if(form.from&&form.items.some(i=>i.quantity>avail(form.from,i.productId)))er['items']='Количеството надвишава наличността в изпращащия склад';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`tr-${Object.keys(er)[0]}`)?.focus();return;}
  const data={from:form.from,to:form.to,description:form.description.trim(),items:form.items};
  if(editing){setRows(p=>p.map(r=>r.id===editing.id?{...r,...data}:r));setAnnouncement(`${editing.doc} · Промените са приложени само в демонстрацията.`);}
  else{const id=Math.max(0,...rows.map(r=>r.id))+1;const doc=`TR-${String(id).padStart(7,'0')}`;setRows(p=>[{...data,id,doc,created:new Date().toISOString().slice(0,16),createdBy:'Венелин Тодоров',status:'Необработен'},...p]);setAnnouncement(`${doc} · Трансферът е създаден със статус „Необработен“ само в демонстрацията.`);}
  setEditor(false);
 };
 const changeStatus=(t:Transfer,s:Status)=>{
  if(s==='Завършен'){
   const short=t.items.find(i=>i.quantity>avail(t.from,i.productId));
   if(short){setAnnouncement(`${t.doc} · Недостатъчна наличност на ${product(short.productId)?.name} в ${t.from}.`);return;}
   setStock(st=>{const n:Stock=JSON.parse(JSON.stringify(st));t.items.forEach(i=>{n[t.from]![i.productId]=(n[t.from]![i.productId]??0)-i.quantity;n[t.to]![i.productId]=(n[t.to]![i.productId]??0)+i.quantity;});return n;});
   setAnnouncement(`${t.doc} · Завършен: наличността е намалена в „${t.from}“ и заприходена в „${t.to}“ (само в демонстрацията).`);
  } else setAnnouncement(`${t.doc} · Статусът е променен на „${s}“ само в демонстрацията.`);
  setRows(p=>p.map(r=>r.id===t.id?{...r,status:s}:r));setSelected(null);
 };
 const remove=()=>{if(!deleting)return;const id=deleting.id;setRows(p=>p.filter(r=>r.id!==id));setSelection(p=>p.filter(x=>x!==id));setAnnouncement(`${deleting.doc} · Трансферът е изтрит само в демонстрацията.`);setDeleting(null);};
 const exportXls=()=>{const html=`<html><head><meta charset="utf-8"></head><body>${tableHtml(filtered)}</body></html>`;const blob=new Blob(['\ufeff'+html],{type:'application/vnd.ms-excel'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='transferi.xls';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);};
 const exportPdf=()=>{const w=window.open('','_blank');if(!w)return;w.document.write(`<html><head><meta charset="utf-8"><title>Трансфер на стоки</title><style>@page{size:A4 landscape;margin:12mm}</style></head><body><h2 style="font-family:sans-serif">Трансфер на стоки</h2>${tableHtml(filtered)}<script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();};
 const plist=comboProducts.filter(p=>{const s=pq.trim().toLocaleLowerCase('bg-BG');return !s||p.name.toLocaleLowerCase('bg-BG').includes(s)||p.sku.includes(s);});
 const editable=(t:Transfer)=>t.status==='Необработен';
 return <WorkspaceShell active="Трансфер на стоки"><div className="page-content deliveries-content">
  <div className="page-heading"><div><h1>Трансфер на стоки</h1><p>Преместване на стока между складове — изпращащият склад се намалява, приемащият се заприходява при „Завършен“</p></div><div className="flex gap-2 flex-wrap"><Button variant="outline" size="icon" aria-label="Експорт в PDF" title="Експорт в PDF" onClick={exportPdf}><FileText className="text-destructive"/></Button><Button variant="outline" size="icon" aria-label="Експорт в XLS" title="Експорт в XLS" onClick={exportXls}><FileSpreadsheet className="text-primary"/></Button><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Нов трансфер</Button></div></div>
  <div className="suppliers-filters">
   <div className="search-box"><Search/><input className="search-input" aria-label="Документ номер" placeholder="Документ номер…" value={docQ} onChange={e=>{setDocQ(e.target.value);setPage(1);}}/></div>
   <div className="field"><input type="date" aria-label="Създаден от дата" title="От дата" value={dateFrom} onChange={e=>{setDateFrom(e.target.value);setPage(1);}}/></div>
   <div className="field"><input type="date" aria-label="Създаден до дата" title="До дата" value={dateTo} onChange={e=>{setDateTo(e.target.value);setPage(1);}}/></div>
   <div className="field"><select aria-label="Статус" value={statusQ} onChange={e=>{setStatusQ(e.target.value);setPage(1);}}><option value="">Всички статуси</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
   <div className="field"><select aria-label="Създаден от" value={userQ} onChange={e=>{setUserQ(e.target.value);setPage(1);}}><option value="">Създаден от: всички</option>{users.map(s=><option key={s}>{s}</option>)}</select></div>
   <Button variant="outline" disabled={!anyFilter} onClick={clear}><X/>Изчисти</Button>
  </div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с трансфери"><div className="delivery-list-heading"><h2>Всички трансфери <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th className="row-select-cell"><Checkbox aria-label="Избери всички на страницата" checked={allSelected?true:someSelected?'indeterminate':false} onCheckedChange={c=>toggleAll(Boolean(c))}/></th><th>Документ номер</th><th>Дата на създаване</th><th>От склад</th><th>Към склад</th><th>Артикули</th><th>Статус</th><th>Създаден от</th><th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{shown.map(r=><tr key={r.id} data-selected={selection.includes(r.id)}>
    <td className="row-select-cell"><Checkbox aria-label={`Избери ${r.doc}`} checked={selection.includes(r.id)} onCheckedChange={c=>toggleRow(r.id,Boolean(c))}/></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(r)}>{r.doc}</Button></td>
    <td>{fmt(r.created)}</td><td>{r.from}</td><td>{r.to}</td>
    <td>{r.items.reduce((s,i)=>s+i.quantity,0)} бр.</td>
    <td><span className={`delivery-status ${cls[r.status]}`}>{r.status}</span></td>
    <td>{r.createdBy}</td>
    <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${r.doc}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end">
     {editable(r)&&<DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem>}
     {r.status==='Необработен'&&<DropdownMenuItem onSelect={()=>changeStatus(r,'Потвърден')}><Check/>Потвърди</DropdownMenuItem>}
     {r.status==='Потвърден'&&<DropdownMenuItem onSelect={()=>changeStatus(r,'Завършен')}><ArrowLeftRight/>Завърши</DropdownMenuItem>}
     {(r.status==='Необработен'||r.status==='Потвърден')&&<DropdownMenuItem onSelect={()=>changeStatus(r,'Отказан')}><X/>Откажи</DropdownMenuItem>}
     {editable(r)&&<><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></>}
    </DropdownMenuContent></DropdownMenu></div></td><td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${r.doc}`} title="Преглед" onClick={()=>setSelected(r)}><Eye/></Button></div></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><ArrowLeftRight size={32}/><h3>Няма намерени трансфери</h3>{anyFilter&&<Button variant="outline" onClick={clear}><X/>Изчисти филтрите</Button>}</div>}
   {selection.length>0&&<div className="article-selection"><span>{selection.length} {selection.length===1?'избран трансфер':'избрани трансфера'}</span><Button variant="ghost" size="sm" onClick={()=>setSelection([])}><X/>Изчисти избора</Button></div>}
   <div className="delivery-pagination"><span>{filtered.length?`${(cur-1)*PAGE+1}–${Math.min(cur*PAGE,filtered.length)} от ${filtered.length}`:'0 резултата'}</span><div className="delivery-pagination-controls"><Button variant="ghost" size="icon" aria-label="Предишна страница" disabled={cur<=1} onClick={()=>setPage(cur-1)}><ChevronLeft/></Button><span>{cur} / {pages}</span><Button variant="ghost" size="icon" aria-label="Следваща страница" disabled={cur>=pages} onClick={()=>setPage(cur+1)}><ChevronRight/></Button></div></div>
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни трансфери · наличностите се променят само в демонстрацията</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="article-dialog-title">{editing?`Редактиране на ${editing.doc}`:'Нов трансфер'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    {(['from','to'] as const).map(k=><div key={k} className="field"><label htmlFor={`tr-${k}`}>{k==='from'?'От склад (изпраща)':'Към склад (приема)'}<span className="required">*</span></label><select id={`tr-${k}`} value={form[k]} aria-invalid={Boolean(errors[k])} onChange={e=>{setForm(f=>({...f,[k]:e.target.value}));clearErr(k);clearErr('items');}}><option value="">Изберете склад</option>{warehouses.map(w=><option key={w} disabled={k==='to'&&w===form.from}>{w}</option>)}</select>{errors[k]&&<p className="text-xs text-destructive" role="alert">{errors[k]}</p>}</div>)}
   </div>
   <div className="field"><div className="flex items-center justify-between"><label>Артикули<span className="required">*</span></label><Button id="tr-items" type="button" variant="outline" size="sm" onClick={()=>{setPq('');setPicker(true);}}><Plus/>Добави артикули</Button></div>
    {form.items.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>SKU</th><th>Артикул</th><th>Наличност</th><th>Количество</th><th/></tr></thead><tbody>{form.items.map(i=>{const p=product(i.productId);const a=form.from?avail(form.from,i.productId):null;return <tr key={i.productId}><td>{p?.sku}</td><td>{p?.name}</td><td className={a!==null&&i.quantity>a?'text-destructive':''}>{a??'—'}</td><td><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Намали" onClick={()=>setForm(f=>({...f,items:f.items.map(x=>x.productId===i.productId?{...x,quantity:Math.max(1,x.quantity-1)}:x)}))}><Minus/></Button><input className="w-16 text-center" type="number" min={1} max={999} aria-label={`Количество ${p?.name}`} value={i.quantity} onChange={e=>{const v=Math.min(999,Math.max(1,Number(e.target.value)||1));setForm(f=>({...f,items:f.items.map(x=>x.productId===i.productId?{...x,quantity:v}:x)}));clearErr('items');}}/><Button type="button" variant="ghost" size="icon" aria-label="Увеличи" onClick={()=>setForm(f=>({...f,items:f.items.map(x=>x.productId===i.productId?{...x,quantity:Math.min(999,x.quantity+1)}:x)}))}><Plus/></Button></div></td><td><Button type="button" variant="ghost" size="icon" aria-label={`Премахни ${p?.name}`} onClick={()=>setForm(f=>({...f,items:f.items.filter(x=>x.productId!==i.productId)}))}><Trash2/></Button></td></tr>;})}</tbody></table></div>:<p className="text-xs text-muted-foreground">Няма добавени артикули.</p>}
    {errors['items']&&<p className="text-xs text-destructive" role="alert">{errors['items']}</p>}
   </div>
   <div className="field"><label htmlFor="tr-description">Описание на трансфера</label><textarea id="tr-description" maxLength={500} rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/><p className="text-xs text-muted-foreground">{form.description.length}/500</p></div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={picker} onOpenChange={setPicker}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Избор на артикули</DialogTitle><DialogDescription>Търсете по SKU или име на артикул</DialogDescription></DialogHeader>
  <div className="search-box"><Search/><input className="search-input" autoFocus aria-label="Търсене по SKU или име" placeholder="SKU / Име на артикул…" value={pq} onChange={e=>setPq(e.target.value)}/></div>
  <div className="delivery-table-scroll max-h-80 overflow-y-auto">{plist.length?<table className="delivery-table"><thead><tr><th>SKU</th><th>Артикул</th><th>Наличност</th><th/></tr></thead><tbody>{plist.map(p=>{const added=form.items.some(i=>i.productId===p.id);return <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{form.from?avail(form.from,p.id):'—'}</td><td className="text-right"><Button type="button" size="sm" variant={added?'outline':'default'} onClick={()=>{setForm(f=>({...f,items:added?f.items.filter(i=>i.productId!==p.id):[...f.items,{productId:p.id,quantity:1}]}));clearErr('items');}}>{added?<><Check/>Добавен</>:<><Plus/>Добави</>}</Button></td></tr>;})}</tbody></table>:<p className="text-sm text-muted-foreground p-4">Няма намерени артикули.</p>}</div>
  <div className="flex justify-end"><Button onClick={()=>setPicker(false)}>Готово</Button></div>
 </DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle className="article-dialog-title">{selected?.doc}</DialogTitle><DialogDescription>Детайли за трансфера · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>Статус</dt><dd><span className={`delivery-status ${cls[selected.status]}`}>{selected.status}</span></dd></div>
  <div><dt>Създаден</dt><dd>{fmt(selected.created)} · {selected.createdBy}</dd></div>
  <div><dt>От склад</dt><dd>{selected.from}</dd></div>
  <div><dt>Към склад</dt><dd>{selected.to}</dd></div>
  <div className="col-span-2"><dt>Описание</dt><dd>{selected.description||'—'}</dd></div>
 </dl>
 <div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>SKU</th><th>Артикул</th><th>Количество</th><th>Налично в {selected.from}</th><th>Налично в {selected.to}</th></tr></thead><tbody>{selected.items.map(i=><tr key={i.productId}><td>{product(i.productId)?.sku}</td><td>{product(i.productId)?.name}</td><td>{i.quantity}</td><td>{avail(selected.from,i.productId)}</td><td>{avail(selected.to,i.productId)}</td></tr>)}</tbody></table></div>
 <div className="flex justify-end gap-2 flex-wrap"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button>
  {selected.status==='Необработен'&&<><Button variant="outline" onClick={()=>open(selected)}><Pencil/>Редактирай</Button><Button onClick={()=>changeStatus(selected,'Потвърден')}><Check/>Потвърди</Button></>}
  {selected.status==='Потвърден'&&<Button onClick={()=>changeStatus(selected,'Завършен')}><ArrowLeftRight/>Завърши</Button>}
  {(selected.status==='Необработен'||selected.status==='Потвърден')&&<Button variant="destructive" onClick={()=>changeStatus(selected,'Отказан')}><X/>Откажи</Button>}
 </div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на трансфер?</DialogTitle><DialogDescription>„{deleting?.doc}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
