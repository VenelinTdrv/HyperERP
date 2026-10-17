import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, Info, MapPin, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/settlements')({
  head:()=>({meta:[{title:'HyperERP · Населени места'},{name:'description',content:'Управление на населени места — държава, име, област и пощенски код в HyperERP.'},{property:'og:title',content:'HyperERP · Населени места'},{property:'og:description',content:'Списък с населени места, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
  component:Settlements,
});

type Form={country:string;name:string;region:string;postalCode:string};
type Settlement=Form&{id:number};
const countries=['България','Германия','Румъния','Гърция','Турция'] as const;
const blank:Form={country:'България',name:'',region:'',postalCode:''};
const initial:Settlement[]=[
 {id:1,country:'България',name:'Ямбол',region:'Ямбол',postalCode:'8600'},
 {id:2,country:'България',name:'София',region:'София (столица)',postalCode:'1000'},
 {id:3,country:'България',name:'Пловдив',region:'Пловдив',postalCode:'4000'},
 {id:4,country:'България',name:'Варна',region:'Варна',postalCode:'9000'},
 {id:5,country:'България',name:'Бургас',region:'Бургас',postalCode:'8000'},
 {id:6,country:'България',name:'Стралджа',region:'Ямбол',postalCode:'8680'},
 {id:7,country:'България',name:'Ловеч',region:'Ловеч',postalCode:'5500'},
 {id:8,country:'България',name:'Шумен',region:'Шумен',postalCode:'9700'},
 {id:9,country:'България',name:'Казанлък',region:'Стара Загора',postalCode:'6100'},
 {id:10,country:'България',name:'Велинград',region:'Пазарджик',postalCode:'4600'},
];

function Settlements(){
 const [rows,setRows]=useState(initial);
 const [nameQ,setNameQ]=useState('');const [regionQ,setRegionQ]=useState('');
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(10);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Settlement|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Settlement|null>(null);const [deleting,setDeleting]=useState<Settlement|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const q=nameQ.trim().toLocaleLowerCase('bg-BG');const rg=regionQ.trim().toLocaleLowerCase('bg-BG');
 const regions=[...new Set(rows.map(r=>r.region))].sort((a,b)=>a.localeCompare(b,'bg-BG'));
 const filtered=rows.filter(r=>(!q||r.name.toLocaleLowerCase('bg-BG').includes(q))&&(!rg||r.region===regionQ));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*pageSize,cur*pageSize);
 const clear=()=>{setNameQ('');setRegionQ('');setPage(1);};
 const open=(s:Settlement|null)=>{setSelected(null);setEditing(s);setErrors({});setForm(s?{country:s.country,name:s.name,region:s.region,postalCode:s.postalCode}:{...blank});setEditor(true);};
 const set=(k:keyof Form,v:string)=>{setForm(f=>({...f,[k]:v}));setErrors(x=>{const n={...x};delete n[k];return n;});};
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Record<string,string>={};
  if(!form.country)er['country']='Изберете държава';
  if(!form.name.trim())er['name']='Въведете име на населено място';
  else if(rows.some(r=>r.id!==editing?.id&&r.country===form.country&&r.name.toLocaleLowerCase('bg-BG')===form.name.trim().toLocaleLowerCase('bg-BG')))er['name']='Вече има такова населено място в тази държава';
  if(!form.region.trim())er['region']='Въведете област';
  if(form.postalCode.trim()&&!/^[0-9A-Za-z -]{3,10}$/.test(form.postalCode.trim()))er['postalCode']='Невалиден пощенски код';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`stl-${Object.keys(er)[0]}`)?.focus();return;}
  const data={country:form.country,name:form.name.trim(),region:form.region.trim(),postalCode:form.postalCode.trim()};
  if(editing)setRows(p=>p.map(r=>r.id===editing.id?{...r,...data}:r));
  else setRows(p=>[...p,{...data,id:Math.max(0,...p.map(r=>r.id))+1}]);
  setEditor(false);setAnnouncement(`${data.name} · ${editing?'Промените са приложени':'Населеното място е добавено'} само в демонстрацията.`);
 };
 const remove=()=>{if(!deleting)return;setRows(p=>p.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.name} · Населеното място е изтрито само в демонстрацията.`);setDeleting(null);};
 const f=(k:'name'|'region'|'postalCode',label:string,o:{req?:boolean;ph?:string;max?:number;hint?:string}={})=><div className="field"><label htmlFor={`stl-${k}`}>{label}{o.req&&<span className="required">*</span>}</label><input id={`stl-${k}`} type="text" placeholder={o.ph} maxLength={o.max??100} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`stl-${k}-error`:o.hint?`stl-${k}-hint`:undefined} onChange={ev=>set(k,ev.target.value)}/>{errors[k]?<p id={`stl-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>:o.hint?<p id={`stl-${k}-hint`} className="text-xs text-muted-foreground">{o.hint}</p>:null}</div>;
 return <WorkspaceShell active="Населени места"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Населени места<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Населени места с област и пощенски код за адресите на клиенти, доставчици и доставки. Търси по име и филтрирай по област.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави населено място</Button></div>
  <div className="suppliers-filters transfers-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Населено място" placeholder="Населено място…" value={nameQ} onChange={ev=>{setNameQ(ev.target.value);setPage(1);}}/></div><div className="field"><select aria-label="Област" value={regionQ} onChange={ev=>{setRegionQ(ev.target.value);setPage(1);}}><option value="">Всички области</option>{regions.map(r=><option key={r} value={r}>{r}</option>)}</select></div><Button variant="outline" disabled={!nameQ&&!regionQ} onClick={clear}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с населени места"><div className="delivery-list-heading"><h2>Всички населени места <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>ID</th><th>Населено място</th><th>Област</th><th>Пощенски код</th><th>Държава</th><th className="text-right">Действия</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}>
    <td><span className="delivery-id">#{r.id}</span></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(r)}>{r.name}</Button></td>
    <td>{r.region}</td>
    <td>{r.postalCode||'—'}</td>
    <td>{r.country}</td>
    <td className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${r.name}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(r)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><MapPin size={32}/><h3>{rows.length?'Няма намерени населени места':'Все още няма населени места'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави населено място</Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="settlements-page-size" />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни населени места · без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на населено място':'Добавяне на населено място'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    <div className="field"><label htmlFor="stl-country">Държава<span className="required">*</span></label><select id="stl-country" value={form.country} aria-invalid={Boolean(errors['country'])} aria-describedby={errors['country']?'stl-country-error':undefined} onChange={ev=>set('country',ev.target.value)}>{countries.map(cn=><option key={cn} value={cn}>{cn}</option>)}</select>{errors['country']&&<p id="stl-country-error" className="text-xs text-destructive" role="alert">{errors['country']}</p>}</div>
    {f('postalCode','Пощенски код',{ph:'8600',max:10,hint:'Незадължително'})}
    {f('name','Населено място',{req:true,ph:'Ямбол',max:100})}
    {f('region','Област',{req:true,ph:'Ямбол',max:100})}
   </div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?.name}</DialogTitle><DialogDescription>Детайли за населеното място · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>Държава</dt><dd>{selected.country}</dd></div>
  <div><dt>Област</dt><dd>{selected.region}</dd></div>
  <div><dt>Пощенски код</dt><dd>{selected.postalCode||'—'}</dd></div>
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на населено място?</DialogTitle><DialogDescription>„{deleting?.name}“ ще бъде премахнато само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий населеното място</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
