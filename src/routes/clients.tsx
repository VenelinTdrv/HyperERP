import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, ChevronLeft, ChevronRight, Eye, Info, MapPin, MoreVertical, Pencil, Plus, Search, ShieldCheck, Star, Trash2, Users, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/clients')({
 head:()=>({meta:[{title:'HyperERP · Клиенти'},{name:'description',content:'Управление на клиенти, телефони и адреси за доставка в HyperERP.'},{property:'og:title',content:'HyperERP · Клиенти'},{property:'og:description',content:'Списък с клиенти, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Clients,
});

const cities=['София','Пловдив','Варна','Бургас','Ямбол','Стара Загора','Русе'];
type Address={id:number;city:string;kind:'street'|'place';street:string;number:string;place:string};
type Client={id:number;first:string;last:string;phone:string;notes:string;addresses:Address[];primary:number;createdBy:string;createdAt:string;editedBy:string;editedAt:string};
const initial:Client[]=[
 {id:1,first:'Мария',last:'Георгиева',phone:'0891234567',notes:'Предпочита доставка следобед',addresses:[{id:1,city:'Ямбол',kind:'street',street:'Стара планина',number:'1А',place:''}],primary:1,createdBy:'Master Admin',createdAt:'14.10.2026, 11:03',editedBy:'',editedAt:''},
 {id:2,first:'Иван',last:'Иванов',phone:'0895055199',notes:'Спешно',addresses:[{id:1,city:'Ямбол',kind:'street',street:'Ангел Кънчев',number:'10',place:''},{id:2,city:'София',kind:'place',street:'',number:'',place:'Бизнес парк, сграда 4'}],primary:1,createdBy:'Виктория Григорова',createdAt:'14.10.2026, 11:21',editedBy:'',editedAt:''},
 {id:3,first:'Елена',last:'Петрова',phone:'0887112233',notes:'',addresses:[{id:1,city:'Пловдив',kind:'street',street:'Капитан Райчо',number:'56',place:''}],primary:1,createdBy:'Master Admin',createdAt:'13.10.2026, 16:40',editedBy:'Master Admin',editedAt:'14.10.2026, 09:12'},
 {id:4,first:'Георги',last:'Димитров',phone:'0897654321',notes:'Плаща с банков превод',addresses:[{id:1,city:'София',kind:'street',street:'Витоша',number:'15',place:''}],primary:1,createdBy:'Виктория Григорова',createdAt:'13.10.2026, 10:15',editedBy:'',editedAt:''},
 {id:5,first:'Николина',last:'Стефанова',phone:'0888222333',notes:'',addresses:[{id:1,city:'Варна',kind:'street',street:'Княз Борис I',number:'8',place:''}],primary:1,createdBy:'Master Admin',createdAt:'12.10.2026, 14:05',editedBy:'',editedAt:''},
 {id:6,first:'Петя',last:'Колева',phone:'0879111222',notes:'Доставка до офис',addresses:[{id:1,city:'Пловдив',kind:'place',street:'',number:'',place:'Бизнес център, етаж 3'}],primary:1,createdBy:'Виктория Григорова',createdAt:'12.10.2026, 09:30',editedBy:'',editedAt:''},
 {id:7,first:'Десислава',last:'Радева',phone:'0895555666',notes:'',addresses:[{id:1,city:'Бургас',kind:'street',street:'Александър Батенберг',number:'22',place:''}],primary:1,createdBy:'Master Admin',createdAt:'11.10.2026, 17:45',editedBy:'',editedAt:''},
 {id:8,first:'Христо',last:'Янев',phone:'0888444555',notes:'Предпочита наложен платеж',addresses:[{id:1,city:'Ямбол',kind:'street',street:'Цар Иван Асень II',number:'7',place:''},{id:2,city:'София',kind:'street',street:'Пиротска',number:'40',place:''}],primary:1,createdBy:'Венелин Тодоров',createdAt:'11.10.2026, 12:20',editedBy:'Венелин Тодоров',editedAt:'13.10.2026, 08:40'},
 {id:9,first:'Саня',last:'Тодорова',phone:'0877888999',notes:'',addresses:[{id:1,city:'Стара Загора',kind:'street',street:'Г. С. Раковски',number:'33',place:''}],primary:1,createdBy:'Виктория Григорова',createdAt:'10.10.2026, 15:10',editedBy:'',editedAt:''},
 {id:10,first:'Мирослав',last:'Киров',phone:'0896333444',notes:'Променен адрес за празниците',addresses:[{id:1,city:'Русе',kind:'street',street:'Цар Освободител',number:'4',place:''}],primary:1,createdBy:'Master Admin',createdAt:'09.10.2026, 11:00',editedBy:'',editedAt:''},
];
const addrText=(a?:Address)=>!a?'—':a.kind==='street'?`ул. ${a.street} ${a.number}`:a.place;
const now=()=>'14.10.2026, '+new Date().toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'});
const blankAddr=(id:number):Address=>({id,city:'',kind:'street',street:'',number:'',place:''});
type Form={first:string;last:string;phone:string;notes:string;addresses:Address[];primary:number};
const PAGE=10;

function Clients(){
 const [rows,setRows]=useState(initial);
 const [name,setName]=useState('');const [phone,setPhone]=useState('');
 const [page,setPage]=useState(1);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Client|null>(null);
 const [form,setForm]=useState<Form>({first:'',last:'',phone:'',notes:'',addresses:[blankAddr(1)],primary:1});
 const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Client|null>(null);const [deleting,setDeleting]=useState<Client|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const q=name.trim().toLocaleLowerCase('bg-BG');const p=phone.replace(/\D/g,'');
 const filtered=rows.filter(r=>(!q||`${r.first} ${r.last}`.toLocaleLowerCase('bg-BG').includes(q))&&(!p||r.phone.includes(p)));
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*PAGE,cur*PAGE);
 const open=(c:Client|null)=>{setSelected(null);setEditing(c);setErrors({});setForm(c?{first:c.first,last:c.last,phone:c.phone,notes:c.notes,addresses:c.addresses.map(a=>({...a})),primary:c.primary}:{first:'',last:'',phone:'',notes:'',addresses:[blankAddr(1)],primary:1});setEditor(true);};
 const setA=(id:number,patch:Partial<Address>)=>{setForm(f=>({...f,addresses:f.addresses.map(a=>a.id===id?{...a,...patch}:a)}));setErrors({});};
 const save=(e:FormEvent)=>{
  e.preventDefault();const er:Record<string,string>={};
  if(!form.first.trim())er['first']='Въведете име';
  if(!form.last.trim())er['last']='Въведете фамилия';
  const ph=form.phone.replace(/[\s-]/g,'');
  if(!ph)er['phone']='Въведете телефон';else if(!/^(\+359|0)\d{8,9}$/.test(ph))er['phone']='Невалиден телефон (напр. 0888123456)';
  else if(rows.some(r=>r.id!==editing?.id&&r.phone===ph))er['phone']='Вече има клиент с този телефон';
  form.addresses.forEach(a=>{if(!a.city)er[`city-${a.id}`]='Изберете населено място';if(a.kind==='street'){if(!a.street.trim())er[`street-${a.id}`]='Въведете улица';if(!a.number.trim())er[`number-${a.id}`]='Въведете номер';}else if(!a.place.trim())er[`place-${a.id}`]='Въведете местоназначение';});
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`client-${Object.keys(er)[0]}`)?.focus();return;}
  const data={first:form.first.trim(),last:form.last.trim(),phone:ph,notes:form.notes.trim(),addresses:form.addresses,primary:form.addresses.some(a=>a.id===form.primary)?form.primary:form.addresses[0]!.id};
  if(editing)setRows(prev=>prev.map(r=>r.id===editing.id?{...r,...data,editedBy:'Венелин Тодоров',editedAt:now()}:r));
  else setRows(prev=>[...prev,{id:Math.max(0,...prev.map(r=>r.id))+1,...data,createdBy:'Венелин Тодоров',createdAt:now(),editedBy:'',editedAt:''}]);
  setEditor(false);setAnnouncement(`${data.first} ${data.last} · ${editing?'Промените са приложени':'Клиентът е добавен'} само в демонстрацията.`);
 };
 const err=(k:string)=>errors[k]&&<p id={`client-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>;
 const inv=(k:string)=>({'aria-invalid':Boolean(errors[k]),'aria-describedby':errors[k]?`client-${k}-error`:undefined});
 const primaryOf=(c:Client)=>c.addresses.find(a=>a.id===c.primary)??c.addresses[0];
 return <WorkspaceShell active="Клиенти"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Клиенти<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Контакти и адреси за доставка. Търси по име или телефон и отвори клиент за детайли.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави клиент</Button></div>
  <div className="clients-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Име или фамилия" placeholder="Име или фамилия…" value={name} onChange={e=>{setName(e.target.value);setPage(1);}}/></div><div className="search-box"><Search/><input className="search-input" inputMode="tel" aria-label="Телефон" placeholder="Телефон…" value={phone} onChange={e=>{setPhone(e.target.value);setPage(1);}}/></div><Button variant="outline" disabled={!name&&!phone} onClick={()=>{setName('');setPhone('');setPage(1);}}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с клиенти"><div className="delivery-list-heading"><h2>Всички клиенти <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Основен адрес</th><th>Бележки</th><th>Създаден</th><th>Редактиран</th><th className="text-right">Действия</th></tr></thead><tbody>{shown.map(c=>{const a=primaryOf(c);return <tr key={c.id}>
    <td><span className="delivery-id">#{c.id}</span></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(c)}>{c.first} {c.last}</Button></td>
    <td className="whitespace-nowrap">{c.phone}</td>
    <td><strong className="block text-xs">{a?.city}</strong><span className="delivery-cell-sub">{addrText(a)}{c.addresses.length>1&&` · +${c.addresses.length-1}`}</span></td>
    <td className="client-notes">{c.notes||'—'}</td>
    <td><span className="block text-xs">{c.createdBy}</span><span className="delivery-cell-sub">{c.createdAt}</span></td>
    <td>{c.editedBy?<><span className="block text-xs">{c.editedBy}</span><span className="delivery-cell-sub">{c.editedAt}</span></>:'—'}</td>
    <td className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${c.first} ${c.last}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(c)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>open(c)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(c)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
   </tr>;})}</tbody></table></div>:<div className="delivery-empty"><Users size={32}/><h3>{rows.length?'Няма намерени клиенти':'Все още няма клиенти'}</h3>{rows.length?<Button variant="outline" onClick={()=>{setName('');setPhone('');}}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави клиент</Button>}</div>}
   <div className="delivery-pagination"><span>{filtered.length?`${(cur-1)*PAGE+1}–${Math.min(cur*PAGE,filtered.length)} от ${filtered.length}`:'0 резултата'}</span><div className="delivery-pagination-controls"><Button variant="ghost" size="icon" aria-label="Предишна страница" disabled={cur<=1} onClick={()=>setPage(cur-1)}><ChevronLeft/></Button><span>{cur} / {pages}</span><Button variant="ghost" size="icon" aria-label="Следваща страница" disabled={cur>=pages} onClick={()=>setPage(cur+1)}><ChevronRight/></Button></div></div>
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни клиенти · без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на клиент':'Добавяне на клиент'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <div className="delivery-editor-grid"><div className="field"><label htmlFor="client-first">Име<span className="required">*</span></label><input id="client-first" autoComplete="given-name" maxLength={60} value={form.first} {...inv('first')} onChange={e=>{setForm(f=>({...f,first:e.target.value}));setErrors({});}}/>{err('first')}</div>
   <div className="field"><label htmlFor="client-last">Фамилия<span className="required">*</span></label><input id="client-last" autoComplete="family-name" maxLength={60} value={form.last} {...inv('last')} onChange={e=>{setForm(f=>({...f,last:e.target.value}));setErrors({});}}/>{err('last')}</div></div>
   <div className="field"><label htmlFor="client-phone">Телефон<span className="required">*</span></label><input id="client-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0888 123 456" value={form.phone} {...inv('phone')} onChange={e=>{setForm(f=>({...f,phone:e.target.value}));setErrors({});}}/>{err('phone')}</div>
   <div className="field"><label htmlFor="client-notes">Бележки <span className="text-muted-foreground font-normal">({form.notes.length}/500)</span></label><textarea id="client-notes" rows={2} maxLength={500} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></div>
   <fieldset className="client-addresses"><legend>Адреси</legend>{form.addresses.map((a,i)=><div key={a.id} className="client-address">
    <div className="client-address-head"><label className="client-primary"><input type="radio" name="primary" checked={form.primary===a.id} onChange={()=>setForm(f=>({...f,primary:a.id}))}/>{form.primary===a.id?<><Star size={13}/>Основен адрес</>:`Адрес ${i+1} · направи основен`}</label><Button type="button" variant="ghost" size="icon" aria-label={`Премахни адрес ${i+1}`} disabled={form.addresses.length===1} title={form.addresses.length===1?'Клиентът трябва да има поне един адрес':undefined} onClick={()=>setForm(f=>{const list=f.addresses.filter(x=>x.id!==a.id);return {...f,addresses:list,primary:f.primary===a.id?list[0]!.id:f.primary};})}><Trash2/></Button></div>
    <div className="field"><label htmlFor={`client-city-${a.id}`}>Населено място<span className="required">*</span></label><select id={`client-city-${a.id}`} value={a.city} {...inv(`city-${a.id}`)} onChange={e=>setA(a.id,{city:e.target.value})}><option value="">Изберете населено място</option>{cities.map(c=><option key={c}>{c}</option>)}</select>{err(`city-${a.id}`)}</div>
    <div className="segmented" role="group" aria-label="Вид адрес"><Button type="button" variant="ghost" className="segment" aria-pressed={a.kind==='street'} onClick={()=>setA(a.id,{kind:'street'})}>{a.kind==='street'&&<Check size={13}/>}Улица и номер</Button><Button type="button" variant="ghost" className="segment" aria-pressed={a.kind==='place'} onClick={()=>setA(a.id,{kind:'place'})}>{a.kind==='place'&&<Check size={13}/>}Местоназначение</Button></div>
    {a.kind==='street'?<div className="client-street"><div className="field"><label htmlFor={`client-street-${a.id}`}>Улица<span className="required">*</span></label><input id={`client-street-${a.id}`} value={a.street} {...inv(`street-${a.id}`)} onChange={e=>setA(a.id,{street:e.target.value})}/>{err(`street-${a.id}`)}</div><div className="field"><label htmlFor={`client-number-${a.id}`}>Номер<span className="required">*</span></label><input id={`client-number-${a.id}`} value={a.number} {...inv(`number-${a.id}`)} onChange={e=>setA(a.id,{number:e.target.value})}/>{err(`number-${a.id}`)}</div></div>
    :<div className="field"><label htmlFor={`client-place-${a.id}`}>Местоназначение<span className="required">*</span></label><input id={`client-place-${a.id}`} placeholder="Жк, квартал, бизнес сграда…" value={a.place} {...inv(`place-${a.id}`)} onChange={e=>setA(a.id,{place:e.target.value})}/>{err(`place-${a.id}`)}</div>}
   </div>)}
   <Button type="button" variant="ghost" className="self-start text-primary" disabled={form.addresses.length>=5} onClick={()=>setForm(f=>({...f,addresses:[...f.addresses,blankAddr(Math.max(...f.addresses.map(x=>x.id))+1)]}))}><Plus/>Добави адрес</Button></fieldset>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запази</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{selected?.first} {selected?.last}</DialogTitle><DialogDescription>Детайли за клиента · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details"><div><dt>Телефон</dt><dd>{selected.phone}</dd></div><div><dt>ID</dt><dd>#{selected.id}</dd></div><div className="col-span-2"><dt>Бележки</dt><dd>{selected.notes||'—'}</dd></div><div><dt>Създаден от</dt><dd>{selected.createdBy}<br/><span className="delivery-cell-sub">{selected.createdAt}</span></dd></div><div><dt>Редактиран от</dt><dd>{selected.editedBy||'—'}{selected.editedAt&&<><br/><span className="delivery-cell-sub">{selected.editedAt}</span></>}</dd></div><div className="col-span-2"><dt>Адреси</dt><dd><ul className="client-address-list">{selected.addresses.map(a=><li key={a.id}><MapPin size={14}/><span>{a.city}, {addrText(a)}</span>{a.id===selected.primary&&<span className="client-badge">Основен</span>}</li>)}</ul></dd></div></dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на клиент?</DialogTitle><DialogDescription>„{deleting?.first} {deleting?.last}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={()=>{if(!deleting)return;setRows(prev=>prev.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.first} ${deleting.last} · Клиентът е изтрит само в демонстрацията.`);setDeleting(null);}}><Trash2/>Изтрий клиента</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
