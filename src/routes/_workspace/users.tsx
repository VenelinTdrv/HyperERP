import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, Eye, EyeOff, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, UserCog, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { USER_ROLES, assistantAssignmentError, hasAssignedAssistants, type UserRole } from '@/lib/demo-users';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export const Route = createFileRoute('/_workspace/users')({
 head:()=>({meta:[{title:'HyperERP · Потребители'},{name:'description',content:'Управление на потребители и роли — администратори, инфлуенсъри и търговци на едро в HyperERP.'},{property:'og:title',content:'HyperERP · Потребители'},{property:'og:description',content:'Списък с потребители, създаване, редакция, роли и статус.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Users,
});

const ROLES=USER_ROLES;
type Role=UserRole;
type Form={email:string;firstName:string;lastName:string;role:Role|'';influencerId:string;active:boolean;password:string;confirm:string};
type User={id:number;email:string;firstName:string;lastName:string;role:Role;influencerId?:number|undefined;active:boolean};
const blank:Form={email:'',firstName:'',lastName:'',role:'',influencerId:'',active:true,password:'',confirm:''};
const initial:User[]=[
 {id:1,email:'admin@codeatelier.io',firstName:'Венелин',lastName:'Тодоров',role:'Администратор',active:true},
 {id:2,email:'grigorovaaaaa@gmail.com',firstName:'Виктория',lastName:'Григорова',role:'Инфлуенсър',active:true},
 {id:3,email:'office@aromag.bg',firstName:'Арома',lastName:'Груп',role:'Търговец на едро',active:true},
 {id:4,email:'influencer@codeatelier.io',firstName:'Елена',lastName:'Петрова',role:'Инфлуенсър',active:true},
 {id:5,email:'testuser@abv.bg',firstName:'Тест',lastName:'Потребител',role:'Администратор',active:false},
 {id:6,email:'aivan_2001@abv.bg',firstName:'Мария',lastName:'Иванова',role:'Инфлуенсър',active:true},
];
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Users(){
 const [rows,setRows]=useState(initial);
 const [q,setQ]=useState('');const [role,setRole]=useState('');const [status,setStatus]=useState('');
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(25);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<User|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [showPw,setShowPw]=useState(false);
 const [selected,setSelected]=useState<User|null>(null);const [deleting,setDeleting]=useState<User|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const influencers=rows.filter(r=>r.role==='Инфлуенсър'&&r.id!==editing?.id);
 const influencerName=(id?:number)=>{const u=rows.find(r=>r.id===id);return u?`${u.firstName} ${u.lastName}`:'—';};
 const t=q.trim().toLocaleLowerCase('bg-BG');
 const filtered=rows.filter(r=>(!t||`${r.firstName} ${r.lastName} ${r.email}`.toLocaleLowerCase('bg-BG').includes(t))&&(!role||r.role===role)&&(!status||(status==='active')===r.active));
 const pages=Math.max(1,Math.ceil(filtered.length/(pageSize||filtered.length||1)));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*(pageSize||filtered.length),(cur-1)*(pageSize||filtered.length)+pageSize||filtered.length);
 const clear=()=>{setQ('');setRole('');setStatus('');setPage(1);};
 const open=(u:User|null)=>{setSelected(null);setEditing(u);setErrors({});setShowPw(false);setForm(u?{...blank,email:u.email,firstName:u.firstName,lastName:u.lastName,role:u.role,influencerId:u.influencerId?String(u.influencerId):'',active:u.active}:{...blank});setEditor(true);};
 const set=<K extends keyof Form>(k:K,v:Form[K])=>{setForm(f=>({...f,[k]:v,...(k==='role'&&v!=='Асистент'?{influencerId:''}:{})}));setErrors(x=>{const n={...x};delete n[k];if(k==='role')delete n['influencerId'];return n;});};
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Partial<Record<'email'|'firstName'|'lastName'|'role'|'influencerId'|'password'|'confirm',string>>={};const email=form.email.trim().toLowerCase();
  if(!email)er.email='Въведете имейл';else if(!EMAIL.test(email))er.email='Невалиден имейл адрес';
  else if(rows.some(r=>r.id!==editing?.id&&r.email===email))er.email='Вече има потребител с този имейл';
  if(!form.firstName.trim())er.firstName='Въведете име';
  if(!form.lastName.trim())er.lastName='Въведете фамилия';
  if(!form.role)er.role='Изберете роля';
  const assignmentError=assistantAssignmentError(form.role,form.influencerId?Number(form.influencerId):undefined,rows,editing?.id);
  if(assignmentError)er.influencerId=assignmentError;
  if(editing&&hasAssignedAssistants(editing.id,rows)&&form.role!=='Инфлуенсър')er.role='Първо прехвърлете асистентите към друг инфлуенсър';
  const needPw=!editing||form.password||form.confirm;
  if(needPw){
   if(!form.password)er.password='Въведете парола';else if(form.password.length<8)er.password='Паролата трябва да е поне 8 символа';
   if(!form.confirm)er.confirm='Повторете паролата';else if(form.password&&form.confirm!==form.password)er.confirm='Паролите не съвпадат';
  }
  if(editing&&editing.id===1&&(!form.active||form.role!=='Администратор'))er.role='Основният администратор трябва да остане активен администратор';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`usr-${Object.keys(er)[0]}`)?.focus();return;}
  const data={email,firstName:form.firstName.trim(),lastName:form.lastName.trim(),role:form.role as Role,influencerId:form.role==='Асистент'?Number(form.influencerId):undefined,active:form.active};
  if(editing)setRows(p=>p.map(r=>r.id===editing.id?{...r,...data}:r));
  else setRows(p=>[...p,{...data,id:Math.max(0,...p.map(r=>r.id))+1}]);
  setEditor(false);setAnnouncement(`${data.email} · ${editing?'Промените са приложени':'Потребителят е добавен'} само в демонстрацията.`);
 };
 const remove=()=>{if(!deleting)return;if(hasAssignedAssistants(deleting.id,rows)){setAnnouncement('Първо прехвърлете асистентите към друг инфлуенсър.');setDeleting(null);return;}setRows(p=>p.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.email} · Потребителят е изтрит само в демонстрацията.`);setDeleting(null);};
 const err=(k:string,hint?:string)=>errors[k]?<p id={`usr-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>:hint?<p id={`usr-${k}-hint`} className="text-xs text-muted-foreground">{hint}</p>:null;
 const aria=(k:string,hint?:boolean)=>({'aria-invalid':Boolean(errors[k]),'aria-describedby':errors[k]?`usr-${k}-error`:hint?`usr-${k}-hint`:undefined});
 const txt=(k:'email'|'firstName'|'lastName',label:string,o:{wide?:boolean;type?:string;ph?:string}={})=><div className={`field ${o.wide?'col-span-2':''}`}><label htmlFor={`usr-${k}`}>{label}<span className="required">*</span></label><input id={`usr-${k}`} type={o.type??'text'} placeholder={o.ph} maxLength={k==='email'?255:60} autoComplete="off" value={form[k]} {...aria(k)} onChange={ev=>set(k,ev.target.value)}/>{err(k)}</div>;
 const pw=(k:'password'|'confirm',label:string,hint?:string)=><div className="field"><label htmlFor={`usr-${k}`}>{label}{!editing&&<span className="required">*</span>}</label><div className="relative"><input id={`usr-${k}`} className="w-full pr-9" type={showPw?'text':'password'} maxLength={72} autoComplete="new-password" value={form[k]} {...aria(k,Boolean(hint))} onChange={ev=>set(k,ev.target.value)}/>{k==='password'&&<Button type="button" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8" aria-label={showPw?'Скрий паролата':'Покажи паролата'} onClick={()=>setShowPw(s=>!s)}>{showPw?<EyeOff/>:<Eye/>}</Button>}</div>{err(k,hint)}</div>;
 return <WorkspaceShell active="Потребители"><div className="page-content deliveries-content">
  <div className="page-heading"><div><h1>Потребители</h1><p>Достъп до системата и роли</p></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави потребител</Button></div>
  <div className="suppliers-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Име или имейл" placeholder="Име или имейл…" value={q} onChange={ev=>{setQ(ev.target.value);setPage(1);}}/></div>
   <select className="search-input" style={{maxWidth:'13rem'}} aria-label="Роля" value={role} onChange={ev=>{setRole(ev.target.value);setPage(1);}}><option value="">Всички роли</option>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
   <select className="search-input" style={{maxWidth:'13rem'}} aria-label="Статус" value={status} onChange={ev=>{setStatus(ev.target.value);setPage(1);}}><option value="">Всички статуси</option><option value="active">Активен</option><option value="inactive">Неактивен</option></select>
   <Button variant="outline" disabled={!q&&!role&&!status} onClick={clear}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с потребители"><div className="delivery-list-heading"><h2>Всички потребители <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th>Имейл</th><th>Име</th><th>Фамилия</th><th>Роля</th><th>Статус</th><th className="delivery-head-center">Действия</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(r)}>{r.email}</Button></td>
    <td>{r.firstName}</td><td>{r.lastName}</td>
    <td><span className={`delivery-status ${r.role==='Администратор'?'neutral':''}`}>{r.role}</span>{r.role==='Асистент'&&<div className="mt-1 text-xs text-muted-foreground">Към: {influencerName(r.influencerId)}</div>}</td>
    <td><span className={`delivery-status ${r.active?'received':'cancelled'}`}>{r.active?'Активен':'Неактивен'}</span></td>
    <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-primary" aria-label={`Действия за ${r.email}`} title="Действия за потребителя"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(r)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>open(r)}><Pencil/>Редактирай</DropdownMenuItem>{r.id!==1&&<><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(r)}><Trash2/>Изтрий</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu></div></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><UserCog size={32}/><h3>{rows.length?'Няма намерени потребители':'Все още няма потребители'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави потребител</Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="users-page-size" />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни потребители · без реално записване и без реален вход</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на потребител':'Добавяне на потребител'}</DialogTitle><DialogDescription>Примерни данни · паролата не се записва</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="supplier-grid">
    {txt('email','Имейл',{wide:true,type:'email',ph:'name@example.com'})}
    {txt('firstName','Име')}
    {txt('lastName','Фамилия')}
    <div className="field col-span-2"><label htmlFor="usr-role">Роля<span className="required">*</span></label><select id="usr-role" value={form.role} {...aria('role')} onChange={ev=>set('role',ev.target.value as Role)}><option value="">Изберете роля</option>{ROLES.map(r=><option key={r}>{r}</option>)}</select>{err('role')}</div>
    {form.role==='Асистент'&&<div className="field col-span-2"><label htmlFor="usr-influencerId">Инфлуенсър<span className="required">*</span></label><select id="usr-influencerId" value={form.influencerId} {...aria('influencerId')} onChange={ev=>set('influencerId',ev.target.value)}><option value="">Изберете инфлуенсър</option>{influencers.map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}</select>{err('influencerId',influencers.length?undefined:'Няма налични инфлуенсъри')}</div>}
    {pw('password',editing?'Нова парола':'Парола',editing?'Оставете празно, за да не се променя':'Поне 8 символа')}
    {pw('confirm','Повторете паролата')}
    <label className="col-span-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={ev=>set('active',ev.target.checked)}/>Активен потребител</label>
   </div>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запиши</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">{selected?`${selected.firstName} ${selected.lastName}`:''}</DialogTitle><DialogDescription>Детайли за потребителя · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div className="col-span-2"><dt>Имейл</dt><dd>{selected.email}</dd></div>
  <div><dt>Роля</dt><dd>{selected.role}</dd></div>
  {selected.role==='Асистент'&&<div><dt>Инфлуенсър</dt><dd>{influencerName(selected.influencerId)}</dd></div>}
  <div><dt>Статус</dt><dd>{selected.active?'Активен':'Неактивен'}</dd></div>
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на потребител?</DialogTitle><DialogDescription>„{deleting?.email}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={remove}><Trash2/>Изтрий потребителя</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
