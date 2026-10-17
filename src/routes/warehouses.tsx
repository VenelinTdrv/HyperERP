import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, Eye, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, Warehouse, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const Route = createFileRoute('/warehouses')({
  head:()=>({meta:[{title:'HyperERP · Складове'},{name:'description',content:'Управление на физически и виртуални складове — име, държава, град и адрес в HyperERP.'},{property:'og:title',content:'HyperERP · Складове'},{property:'og:description',content:'Списък със складове, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Warehouses,
});

type Form={name:string;kind:string;country:string;city:string;street:string;postalCode:string};
type WarehouseRow=Form&{id:number};
const countries=['България','Германия','Румъния','Гърция','Турция'] as const;
const kinds=['Физически','Виртуален'] as const;
const blank:Form={name:'',kind:'Физически',country:'България',city:'',street:'',postalCode:''};
const initial:WarehouseRow[]=[
 {id:1,name:'Склад Главен',kind:'Физически',country:'България',city:'Ямбол',street:'ул. Търговска 12',postalCode:'8600'},
 {id:2,name:'Склад София',kind:'Физически',country:'България',city:'София',street:'бул. България 45',postalCode:'1000'},
 {id:3,name:'Виртуален — Ема',kind:'Виртуален',country:'България',city:'Ямбол',street:'',postalCode:''},
 {id:4,name:'Виртуален — Виктория',kind:'Виртуален',country:'България',city:'Пловдив',street:'',postalCode:''},
 {id:5,name:'Склад Варна',kind:'Физически',country:'България',city:'Варна',street:'ул. Морска 8',postalCode:'9000'},
 {id:6,name:'Виртуален — Връщания',kind:'Виртуален',country:'България',city:'Ямбол',street:'',postalCode:''},
];

function Warehouses(){
 const [rows,setRows]=useState(initial);
 const [nameQ,setNameQ]=useState('');const [cityQ,setCityQ]=useState('');
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(25);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<WarehouseRow|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<WarehouseRow|null>(null);const [deleting,setDeleting]=useState<WarehouseRow|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const q=nameQ.trim().toLocaleLowerCase('bg-BG');const cq=cityQ.trim().toLocaleLowerCase('bg-BG');
 const filtered=rows.filter(r=>(!q||r.name.toLocaleLowerCase('bg-BG').includes(q))&&(!cq||r.city.toLocaleLowerCase('bg-BG').includes(cq)));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*pageSize,cur*pageSize);
 const clear=()=>{setNameQ('');setCityQ('');setPage(1);};
 const open=(s:WarehouseRow|null)=>{setSelected(null);setEditing(s);setErrors({});setForm(s?{name:s.name,kind:s.kind,country:s.country,city:s.city,street:s.street,postalCode:s.postalCode}:{...blank});setEditor(true);};
 const set=(k:keyof Form,v:string)=>{setForm(f=>({...f,[k]:v}));setErrors(x=>{const n={...x};delete n[k];return n;});};
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Record<string,string>={};
  if(!form.name.trim())er['name']='Въведете име на склад';
  else if(rows.some(r=>r.id!==editing?.id&&r.name.toLocaleLowerCase('bg-BG')===form.name.trim().toLocaleLowerCase('bg-BG')))er['name']='Вече има склад с това име';
  if(!form.kind)er['kind']='Изберете тип склад';
  if(!form.country)er['country']='Изберете държава';
  if(!form.city.trim())er['city']='Въведете град';
  if(form.kind==='Физически'&&!form.street.trim())er['street']='Въведете бул./ул. и номер за физически склад';
  if(form.postalCode.trim()&&!/^[0-9A-Za-z -]{3,10}$/.test(form.postalCode.trim()))er['postalCode']='Невалиден пощенски код';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`wh-${Object.keys(er)[0]}`)?.focus();return;}
  const data={name:form.name.trim(),kind:form.kind,country:form.country,city:form.city.trim(),street:form.street.trim(),postalCode:form.postalCode.trim()};
  if(editing)setRows(p=>p.map(r=>r.id===editing.id?{...r,...data}:r));
  else setRows(p=>[...p,{...data,id:Math.max(0,...p.map(r=>r.id))+1}]);
  setEditor(false);setAnnouncement(`${data.name} · ${editing?'Промените са приложени':'Складът е добавен'} само в демонстрацията.`);
 };
 const remove=()=>{if(!deleting)return;setRows(p=>p.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.name} · Складът е изтрит само в демонстрацията.`);setDeleting(null);};
 const f=(k:'name'|'city'|'street'|'postalCode',label:string,o:{req?:boolean;ph?:string;max?:number;hint?:string}={})=><div className="field"><label htmlFor={`wh-${k}`}>{label}{o.req&&<span className="required">*</span>}</label><input id={`wh-${k}`} type="text" placeholder={o.ph} maxLength={o.max??100} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`wh-${k}-error`:o.hint?`wh-${k}-hint`:undefined} onChange={ev=>set(k,ev.target.value)}/>{errors[k]?<p id={`wh-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>:o.hint?<p id={`wh-${k}-hint`} className="text-xs text-muted-foreground">{o.hint}</p>:null}</div>;
 const sel=(k:'kind'|'country',label:string,opts:readonly string[])=><div className="field"><label htmlFor={`wh-${k}`}>{label}<span className="required">*</span></label><select id={`wh-${k}`} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`wh-${k}-error`:undefined} onChange={ev=>set(k,ev.target.value)}>{opts.map(o=><option key={o} value={o}>{o}</option>)}</select>{errors[k]&&<p id={`wh-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>}</div>;
 return <WorkspaceShell active="Складове"><div className="page-content deliveries-content">
  <div className="page-heading"><div><h1>Складове</h1><p>Физически и виртуални складове за наличности и трансфери на стока</p></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави склад</Button></div>
  <div className="suppliers-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Име" placeholder="Име…" value={nameQ} onChange={ev=>{setNameQ(ev.target.value);setPage(1);}}/></div><div className="search-box"><Search/><input className="search-input" aria-label="Населено място" placeholder="Населено място…" value={cityQ} onChange={ev=>{setCityQ(ev.target.value);setPage(1);}}/></div><Button variant="outline" disabled={!nameQ&&!cityQ} onClick={clear}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък със складове"><div className="delivery-list-heading"><h2>Всички складове <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th>ID</th><th>Име</th><th>Тип</th><th>Населено място</th><th>Държава</th><th className="delivery-head-center">Действия</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}>
    <td><span className="delivery-id">#{r.id}</span></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(r)}>{r.name}</Button></td>
    <td><span className={`delivery-status ${r.kind==='Физически'?'received':'neutral'}`}>{r.kind}</span></td>
    <td>{r.city}</td>
    <td>{r.country}</td>
    <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-primary" aria-label={`Действия за ${r.name}`} title="Действия за склада"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(r)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><Warehouse size={32}/><h3>{rows.length?'Няма намерени складове':'Все още няма складове'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави склад</Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="warehouses-page-size" />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни складове · без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на склад':'Добавяне на склад'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    {f('name','Име на склад',{req:true,ph:'Склад Главен',max:100})}
    {sel('kind','Тип склад',kinds)}
    {sel('country','Държава',countries)}
    {f('city','Град',{req:true,ph:'Ямбол',max:100})}
    {f('street','Бул./ул. и номер',{ph:'ул. Търговска 12',max:150,...(form.kind==='Виртуален'?{hint:'Незадължително за виртуален склад'}:{})})}
    {f('postalCode','Пощенски код',{ph:'8600',max:10,hint:'Незадължително'})}
   </div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?.name}</DialogTitle><DialogDescription>Детайли за склада · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>Тип</dt><dd>{selected.kind}</dd></div>
  <div><dt>Държава</dt><dd>{selected.country}</dd></div>
  <div><dt>Град</dt><dd>{selected.city}</dd></div>
  <div><dt>Пощенски код</dt><dd>{selected.postalCode||'—'}</dd></div>
  <div className="col-span-2"><dt>Бул./ул. и номер</dt><dd>{selected.street||'—'}</dd></div>
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на склад?</DialogTitle><DialogDescription>„{deleting?.name}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий склада</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
