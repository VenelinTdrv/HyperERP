import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Ban, Check, Eye, Info, MapPin, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, Undo2, Users, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientEditorDialog, type ClientFormData } from '@/components/client-editor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/clients')({
 head:()=>({meta:[{title:'HyperERP · Клиенти'},{name:'description',content:'Управление на клиенти, телефони и адреси за доставка в HyperERP.'},{property:'og:title',content:'HyperERP · Клиенти'},{property:'og:description',content:'Списък с клиенти, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Clients,
});

const cities=['София','Пловдив','Варна','Бургас','Ямбол','Стара Загора','Русе'];
type Address={id:number;city:string;kind:'street'|'place';street:string;number:string;place:string};
type Client={id:number;first:string;last:string;phone:string;blacklisted:boolean;notes:string;addresses:Address[];primary:number;createdBy:string;createdAt:string;editedBy:string;editedAt:string};
const initial:Client[]=[
 {id:1,first:'Мария',last:'Георгиева',phone:'0891234567',blacklisted:false,notes:'Предпочита доставка следобед',addresses:[{id:1,city:'Ямбол',kind:'street',street:'Стара планина',number:'1А',place:''}],primary:1,createdBy:'Master Admin',createdAt:'14.10.2026, 11:03',editedBy:'',editedAt:''},
 {id:2,first:'Иван',last:'Иванов',phone:'0895055199',blacklisted:false,notes:'Спешно',addresses:[{id:1,city:'Ямбол',kind:'street',street:'Ангел Кънчев',number:'10',place:''},{id:2,city:'София',kind:'place',street:'',number:'',place:'Бизнес парк, сграда 4'}],primary:1,createdBy:'Виктория Григорова',createdAt:'14.10.2026, 11:21',editedBy:'',editedAt:''},
 {id:3,first:'Елена',last:'Петрова',phone:'0887112233',blacklisted:false,notes:'',addresses:[{id:1,city:'Пловдив',kind:'street',street:'Капитан Райчо',number:'56',place:''}],primary:1,createdBy:'Master Admin',createdAt:'13.10.2026, 16:40',editedBy:'Master Admin',editedAt:'14.10.2026, 09:12'},
 {id:4,first:'Георги',last:'Димитров',phone:'0897654321',blacklisted:false,notes:'Плаща с банков превод',addresses:[{id:1,city:'София',kind:'street',street:'Витоша',number:'15',place:''}],primary:1,createdBy:'Виктория Григорова',createdAt:'13.10.2026, 10:15',editedBy:'',editedAt:''},
 {id:5,first:'Николина',last:'Стефанова',phone:'0888222333',blacklisted:false,notes:'',addresses:[{id:1,city:'Варна',kind:'street',street:'Княз Борис I',number:'8',place:''}],primary:1,createdBy:'Master Admin',createdAt:'12.10.2026, 14:05',editedBy:'',editedAt:''},
 {id:6,first:'Петя',last:'Колева',phone:'0879111222',blacklisted:false,notes:'Доставка до офис',addresses:[{id:1,city:'Пловдив',kind:'place',street:'',number:'',place:'Бизнес център, етаж 3'}],primary:1,createdBy:'Виктория Григорова',createdAt:'12.10.2026, 09:30',editedBy:'',editedAt:''},
 {id:7,first:'Десислава',last:'Радева',phone:'0895555666',blacklisted:false,notes:'',addresses:[{id:1,city:'Бургас',kind:'street',street:'Александър Батенберг',number:'22',place:''}],primary:1,createdBy:'Master Admin',createdAt:'11.10.2026, 17:45',editedBy:'',editedAt:''},
 {id:8,first:'Христо',last:'Янев',phone:'0888444555',blacklisted:true,notes:'Предпочита наложен платеж',addresses:[{id:1,city:'Ямбол',kind:'street',street:'Цар Иван Асень II',number:'7',place:''},{id:2,city:'София',kind:'street',street:'Пиротска',number:'40',place:''}],primary:1,createdBy:'Венелин Тодоров',createdAt:'11.10.2026, 12:20',editedBy:'Венелин Тодоров',editedAt:'13.10.2026, 08:40'},
 {id:9,first:'Саня',last:'Тодорова',phone:'0877888999',blacklisted:false,notes:'',addresses:[{id:1,city:'Стара Загора',kind:'street',street:'Г. С. Раковски',number:'33',place:''}],primary:1,createdBy:'Виктория Григорова',createdAt:'10.10.2026, 15:10',editedBy:'',editedAt:''},
 {id:10,first:'Мирослав',last:'Киров',phone:'0896333444',blacklisted:false,notes:'Променен адрес за празниците',addresses:[{id:1,city:'Русе',kind:'street',street:'Цар Освободител',number:'4',place:''}],primary:1,createdBy:'Master Admin',createdAt:'09.10.2026, 11:00',editedBy:'',editedAt:''},
];
const addrText=(a?:Address)=>!a?'—':a.kind==='street'?`ул. ${a.street} ${a.number}`:a.place;
const now=()=>'14.10.2026, '+new Date().toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'});

function Clients(){
 const [rows,setRows]=useState(initial);
 const [name,setName]=useState('');const [phone,setPhone]=useState('');
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(10);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Client|null>(null);
  const [selected,setSelected]=useState<Client|null>(null);const [deleting,setDeleting]=useState<Client|null>(null);
  const [blacklisting,setBlacklisting]=useState<Client|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const q=name.trim().toLocaleLowerCase('bg-BG');const p=phone.replace(/\D/g,'');
 const filtered=rows.filter(r=>(!q||`${r.first} ${r.last}`.toLocaleLowerCase('bg-BG').includes(q))&&(!p||r.phone.includes(p)));
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*pageSize,cur*pageSize);
 const open=(c:Client|null)=>{setSelected(null);setEditing(c);setEditor(true);};
 const saveClient=(data:ClientFormData)=>{
  if(editing)setRows(prev=>prev.map(r=>r.id===editing.id?{...r,...data,editedBy:'Венелин Тодоров',editedAt:now()}:r));
  else setRows(prev=>[...prev,{id:Math.max(0,...prev.map(r=>r.id))+1,blacklisted:false,...data,createdBy:'Венелин Тодоров',createdAt:now(),editedBy:'',editedAt:''}]);
  setEditor(false);setAnnouncement(`${data.first} ${data.last} · ${editing?'Промените са приложени':'Клиентът е добавен'} само в демонстрацията.`);
 };
  const primaryOf=(c:Client)=>c.addresses.find(a=>a.id===c.primary)??c.addresses[0];
  const toggleBlack=(c:Client)=>{setRows(prev=>prev.map(r=>r.id===c.id?{...r,blacklisted:!r.blacklisted}:r));setAnnouncement(`${c.first} ${c.last} · ${!c.blacklisted?'Клиентът е отбелязан в черния списък':'Клиентът е премахнат от черния списък'} само в демонстрацията.`);};
 return <WorkspaceShell active="Клиенти"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Клиенти<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Контакти и адреси за доставка. Търси по име или телефон и отвори клиент за детайли.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави клиент</Button></div>
  <div className="clients-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Име или фамилия" placeholder="Име или фамилия…" value={name} onChange={e=>{setName(e.target.value);setPage(1);}}/></div><div className="search-box"><Search/><input className="search-input" inputMode="tel" aria-label="Телефон" placeholder="Телефон…" value={phone} onChange={e=>{setPhone(e.target.value);setPage(1);}}/></div><Button variant="outline" disabled={!name&&!phone} onClick={()=>{setName('');setPhone('');setPage(1);}}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с клиенти"><div className="delivery-list-heading"><h2>Всички клиенти <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table"><thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Статус</th><th>Основен адрес</th><th>Бележки</th><th>Създаден</th><th>Редактиран</th><th className="text-right">Действия</th></tr></thead><tbody>{shown.map(c=>{const a=primaryOf(c);return <tr key={c.id}>
    <td><span className="delivery-id">#{c.id}</span></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(c)}>{c.first} {c.last}</Button></td>
    <td className="whitespace-nowrap">{c.phone}</td>
    <td>{c.blacklisted?<span className="client-badge client-badge-black">Черен списък</span>:<span className="client-badge client-badge-active">Активен</span>}</td>
    <td><strong className="block text-xs">{a?.city}</strong><span className="delivery-cell-sub">{addrText(a)}{c.addresses.length>1&&` · +${c.addresses.length-1}`}</span></td>
    <td className="client-notes">{c.notes||'—'}</td>
    <td><span className="block text-xs">{c.createdBy}</span><span className="delivery-cell-sub">{c.createdAt}</span></td>
    <td>{c.editedBy?<><span className="block text-xs">{c.editedBy}</span><span className="delivery-cell-sub">{c.editedAt}</span></>:'—'}</td>
    <td className="text-right"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Действия за ${c.first} ${c.last}`}><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>setSelected(c)}><Eye/>Детайли</DropdownMenuItem><DropdownMenuItem onSelect={()=>open(c)}><Pencil/>Редактирай</DropdownMenuItem>{c.blacklisted?<DropdownMenuItem onSelect={()=>toggleBlack(c)}><Undo2/>Премахни от черния списък</DropdownMenuItem>:<DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setBlacklisting(c)}><Ban/>В черен списък</DropdownMenuItem>}<DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(c)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td>
   </tr>;})}</tbody></table></div>:<div className="delivery-empty"><Users size={32}/><h3>{rows.length?'Няма намерени клиенти':'Все още няма клиенти'}</h3>{rows.length?<Button variant="outline" onClick={()=>{setName('');setPhone('');}}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави клиент</Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="clients-page-size" />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни клиенти · без реално записване</div>
 </div>

 <ClientEditorDialog open={editor} onOpenChange={setEditor} editing={editing?{first:editing.first,last:editing.last,phone:editing.phone,notes:editing.notes,addresses:editing.addresses,primary:editing.primary}:null} phones={rows.filter(r=>r.id!==editing?.id).map(r=>r.phone)} onSave={saveClient}/>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{selected?.first} {selected?.last}</DialogTitle><DialogDescription>Детайли за клиента · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details"><div><dt>Телефон</dt><dd>{selected.phone}</dd></div><div><dt>ID</dt><dd>#{selected.id}</dd></div><div><dt>Статус</dt><dd>{selected.blacklisted?<span className="client-badge client-badge-black">Черен списък</span>:<span className="client-badge client-badge-active">Активен</span>}</dd></div><div className="col-span-2"><dt>Бележки</dt><dd>{selected.notes||'—'}</dd></div><div><dt>Създаден от</dt><dd>{selected.createdBy}<br/><span className="delivery-cell-sub">{selected.createdAt}</span></dd></div><div><dt>Редактиран от</dt><dd>{selected.editedBy||'—'}{selected.editedAt&&<><br/><span className="delivery-cell-sub">{selected.editedAt}</span></>}</dd></div><div className="col-span-2"><dt>Адреси</dt><dd><ul className="client-address-list">{selected.addresses.map(a=><li key={a.id}><MapPin size={14}/><span>{a.city}, {addrText(a)}</span>{a.id===selected.primary&&<span className="client-badge">Основен</span>}</li>)}</ul></dd></div></dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на клиент?</DialogTitle><DialogDescription>„{deleting?.first} {deleting?.last}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={()=>{if(!deleting)return;setRows(prev=>prev.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.first} ${deleting.last} · Клиентът е изтрит само в демонстрацията.`);setDeleting(null);}}><Trash2/>Изтрий клиента</Button></div></DialogContent></Dialog>
 <Dialog open={blacklisting!==null} onOpenChange={o=>{if(!o)setBlacklisting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Черен списък на клиент?</DialogTitle><DialogDescription>„{blacklisting?.first} {blacklisting?.last}“ ще бъде отбелязан като в черен списък и статусът ще се вижда в таблицата.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setBlacklisting(null)}>Отказ</Button><Button variant="destructive" onClick={()=>{if(!blacklisting)return;toggleBlack(blacklisting);setBlacklisting(null);}}><Ban/>В черен списък</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
