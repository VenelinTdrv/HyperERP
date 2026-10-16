import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, Globe2, Info, Lock, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/countries')({
  head:()=>({meta:[{title:'HyperERP · Държави'},{name:'description',content:'Управление на държави — код, име и име на местния език в HyperERP.'},{property:'og:title',content:'HyperERP · Държави'},{property:'og:description',content:'Списък с държави, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Countries,
});

type Form={code:string;name:string;localName:string};
type Country=Form&{id:number;locked?:boolean};
const blank:Form={code:'',name:'',localName:''};
const initial:Country[]=[
 {id:1,code:'BG',name:'Bulgaria',localName:'България',locked:true},
 {id:2,code:'DE',name:'Germany',localName:'Deutschland'},
 {id:3,code:'RO',name:'Romania',localName:'România'},
 {id:4,code:'GR',name:'Greece',localName:'Ελλάδα'},
 {id:5,code:'TR',name:'Turkey',localName:'Türkiye'},
 {id:6,code:'RS',name:'Serbia',localName:'Србија'},
 {id:7,code:'MK',name:'North Macedonia',localName:'Северна Македонија'},
 {id:8,code:'MD',name:'Moldova',localName:'Republica Moldova'},
 {id:9,code:'HU',name:'Hungary',localName:'Magyarország'},
 {id:10,code:'AT',name:'Austria',localName:'Österreich'},
];
const PAGE=10;

function Countries(){
 const [rows,setRows]=useState(initial);
 const [code,setCode]=useState('');const [nameQ,setNameQ]=useState('');
 const [page,setPage]=useState(1);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Country|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Country|null>(null);const [deleting,setDeleting]=useState<Country|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const c=code.trim().toLocaleUpperCase('bg-BG');const q=nameQ.trim().toLocaleLowerCase('bg-BG');
 const filtered=rows.filter(r=>(!c||r.code.includes(c))&&(!q||r.name.toLocaleLowerCase('bg-BG').includes(q)||r.localName.toLocaleLowerCase('bg-BG').includes(q)));
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*PAGE,cur*PAGE);
 const clear=()=>{setCode('');setNameQ('');setPage(1);};
 const open=(s:Country|null)=>{setSelected(null);setEditing(s);setErrors({});setForm(s?{code:s.code,name:s.name,localName:s.localName}:{...blank});setEditor(true);};
 const set=(k:keyof Form,v:string)=>{setForm(f=>({...f,[k]:k==='code'?v.toLocaleUpperCase('bg-BG').replace(/[^A-Z]/g,''):v}));setErrors(x=>{const n={...x};delete n[k];return n;});};
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Record<string,string>={};
  if(!form.code.trim())er['code']='Въведете код';else if(!/^[A-Z]{2}$/.test(form.code))er['code']='Кодът трябва да е 2 латински букви (напр. BG)';
  else if(rows.some(r=>r.id!==editing?.id&&r.code===form.code))er['code']='Вече има държава с този код';
  if(!form.name.trim())er['name']='Въведете име на държава';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`ctr-${Object.keys(er)[0]}`)?.focus();return;}
  const data={code:form.code.trim().toUpperCase(),name:form.name.trim(),localName:form.localName.trim()};
  if(editing)setRows(p=>p.map(r=>r.id===editing.id?{...r,...data}:r));
  else setRows(p=>[...p,{...data,id:Math.max(0,...p.map(r=>r.id))+1}]);
  setEditor(false);setAnnouncement(`${data.name} · ${editing?'Промените са приложени':'Държавата е добавена'} само в демонстрацията.`);
 };
 const remove=()=>{if(!deleting)return;setRows(p=>p.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.name} · Държавата е изтрита само в демонстрацията.`);setDeleting(null);};
 const f=(k:keyof Form,label:string,o:{req?:boolean;ph?:string;max?:number;wide?:boolean;hint?:string}={})=><div className={`field ${o.wide?'col-span-2':''}`}><label htmlFor={`ctr-${k}`}>{label}{o.req&&<span className="required">*</span>}</label><input id={`ctr-${k}`} type="text" placeholder={o.ph} maxLength={o.max??100} value={form[k]} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`ctr-${k}-error`:o.hint?`ctr-${k}-hint`:undefined} onChange={ev=>set(k,ev.target.value)}/>{errors[k]?<p id={`ctr-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>:o.hint?<p id={`ctr-${k}-hint`} className="text-xs text-muted-foreground">{o.hint}</p>:null}</div>;
 return <WorkspaceShell active="Държави"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Държави<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Номенклатура за адреси на клиенти и доставчици. Търси по код или име и отвори държава за детайли.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави държава</Button></div>
  <div className="suppliers-filters transfers-filters"><div className="search-box"><input className="search-input" aria-label="Код" placeholder="Код…" value={code} onChange={ev=>{setCode(ev.target.value);setPage(1);}}/></div><div className="search-box"><Search/><input className="search-input" aria-label="Име на държава" placeholder="Име на държава…" value={nameQ} onChange={ev=>{setNameQ(ev.target.value);setPage(1);}}/></div><Button variant="outline" disabled={!code&&!nameQ} onClick={clear}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с държави"><div className="delivery-list-heading"><h2>Всички държави <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>ID</th><th>Код</th><th>Име на държава</th><th>Име на местния език</th><th className="text-right">Действия</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}>
    <td><span className="delivery-id">#{r.id}</span></td>
    <td><strong className="block text-xs">{r.code}</strong></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(r)}>{r.name}</Button></td>
    <td>{r.localName||'—'}</td>
    <td className="text-right">{r.locked?<Button variant="ghost" size="icon" aria-label={`${r.name} е системна държава и не може да се променя`} title="Системна държава — не може да се редактира или изтрива"><Lock/></Button>:<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${r.name}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(r)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}</td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><Globe2 size={32}/><h3>{rows.length?'Няма намерени държави':'Все още няма държави'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави държава</Button>}</div>}
   <div className="delivery-pagination"><span>{filtered.length?`${(cur-1)*PAGE+1}–${Math.min(cur*PAGE,filtered.length)} от ${filtered.length}`:'0 резултата'}</span><div className="delivery-pagination-controls"><Button variant="ghost" size="icon" aria-label="Предишна страница" disabled={cur<=1} onClick={()=>setPage(cur-1)}><ChevronLeft/></Button><span>{cur} / {pages}</span><Button variant="ghost" size="icon" aria-label="Следваща страница" disabled={cur>=pages} onClick={()=>setPage(cur+1)}><ChevronRight/></Button></div></div>
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни държави · без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на държава':'Добавяне на държава'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    {f('code','Код',{req:true,ph:'BG',max:2,hint:'2 латински букви, например BG'})}
    {f('name','Име на държава',{req:true,ph:'Bulgaria',max:100})}
    {f('localName','Име на местния език',{wide:true,ph:'България',max:100,hint:'Незадължително, например Deutschland за Германия'})}
   </div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?.name}</DialogTitle><DialogDescription>Детайли за държавата · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>Код</dt><dd>{selected.code}</dd></div>
  <div><dt>Име на местния език</dt><dd>{selected.localName||'—'}</dd></div>
  {selected.locked&&<div className="col-span-2"><dt>Защита</dt><dd>Системна държава — не може да се редактира или изтрива</dd></div>}
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button>{!selected.locked&&<Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button>}</div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на държава?</DialogTitle><DialogDescription>„{deleting?.name}“ ще бъде премахната само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий държавата</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
