import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Ban, Check, Eye, Info, MapPin, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, Undo2, Users, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientEditorDialog, type ClientFormData } from '@/components/client-editor';
import { addrText, clientName, clearClientNotice, createClient, deleteClient, primaryOf, setClientBlacklist, setClientNotice, updateClient, useClientNotice, useClients, type Client } from '@/lib/clients-store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/_workspace/clients')({
 head:()=>({meta:[{title:'HyperERP · Клиенти'},{name:'description',content:'Управление на клиенти, телефони и адреси за доставка в HyperERP.'},{property:'og:title',content:'HyperERP · Клиенти'},{property:'og:description',content:'Списък с клиенти, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Clients,
});

function Clients(){
 const rows=useClients();const announcement=useClientNotice();
 const [name,setName]=useState('');const [phone,setPhone]=useState('');const [status,setStatus]=useState('');const [kind,setKind]=useState('');
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(25);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Client|null>(null);
  const [selected,setSelected]=useState<Client|null>(null);const [deleting,setDeleting]=useState<Client|null>(null);
  const [blacklisting,setBlacklisting]=useState<Client|null>(null);
 const q=name.trim().toLocaleLowerCase('bg-BG');const p=phone.replace(/\D/g,'');
 const filtered=rows.filter(r=>(!q||clientName(r).toLocaleLowerCase('bg-BG').includes(q))&&(!p||r.phone.includes(p))&&(!status||(status==='Черен списък'?r.blacklisted:!r.blacklisted))&&(!kind||(kind==='company'?r.kind==='company':r.kind==='person')));
 const pages=Math.max(1,Math.ceil(filtered.length/(pageSize||filtered.length||1)));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*(pageSize||filtered.length),(cur-1)*(pageSize||filtered.length)+pageSize||filtered.length);
 const open=(c:Client|null)=>{setSelected(null);setEditing(c);setEditor(true);};
 const saveClient=(data:ClientFormData)=>{
  if(editing)updateClient(editing.id,data);
  else createClient(data);
  setEditor(false);setClientNotice(`${clientName(data)} · ${editing?'Промените са приложени':'Клиентът е добавен'} само в демонстрацията.`);
 };
   const applyStatus=(c:Client,blacklisted:boolean)=>{
    if(c.blacklisted===blacklisted)return;
    setClientBlacklist(c.id,blacklisted);
    setSelected(prev=>prev&&prev.id===c.id?{...prev,blacklisted}:prev);
    setClientNotice(`${clientName(c)} · ${blacklisted?'Клиентът е отбелязан в черния списък':'Клиентът е премахнат от черния списък'} само в демонстрацията.`);
  };
  const toggleBlack=(c:Client)=>applyStatus(c,!c.blacklisted);
 return <WorkspaceShell active="Клиенти"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Клиенти<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Контакти и адреси за доставка. Търси по име или телефон и отвори клиент за детайли.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button asChild className="delivery-add"><Link to="/clients/new"><Plus/>Добави клиент</Link></Button></div>
  <div className="clients-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Име или фамилия" placeholder="Име или фамилия…" value={name} onChange={e=>{setName(e.target.value);setPage(1);}}/></div><div className="search-box"><Search/><input className="search-input" inputMode="tel" aria-label="Телефон" placeholder="Телефон…" value={phone} onChange={e=>{setPhone(e.target.value);setPage(1);}}/></div><div className="field"><label htmlFor="clients-status" className="sr-only">Статус</label><select id="clients-status" aria-label="Статус" title="Статус" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">Всички статуси</option><option>Активен</option><option>Черен списък</option></select></div><div className="field"><label htmlFor="clients-kind" className="sr-only">Вид на клиента</label><select id="clients-kind" aria-label="Вид на клиента" title="Вид на клиента" value={kind} onChange={e=>{setKind(e.target.value);setPage(1);}}><option value="">Всички клиенти</option><option value="person">Физически лица</option><option value="company">Юридически лица</option></select></div><Button variant="outline" disabled={!name&&!phone&&!status&&!kind} onClick={()=>{setName('');setPhone('');setStatus('');setKind('');setPage(1);}}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>clearClientNotice()}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с клиенти"><div className="delivery-list-heading"><h2>Всички клиенти <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Статус</th><th>Основен адрес</th><th>Бележки</th><th>Създаден</th><th>Редактиран</th><th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{shown.map(c=>{const a=primaryOf(c);return <tr key={c.id}>
    <td><span className="delivery-id">#{c.id}</span></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(c)}>{clientName(c)}</Button>{c.kind==='company'&&<span className="delivery-cell-sub block">ЕИК {c.eik}</span>}</td>
     <td className="whitespace-nowrap">{c.phone}</td>
    <td><select className={`client-status-select${c.blacklisted?' client-status-select-black':''}`} value={c.blacklisted?'black':'active'} onChange={e=>applyStatus(c,e.target.value==='black')} aria-label={`Статус на ${clientName(c)}`}><option value="active">Активен</option><option value="black">Черен списък</option></select></td>
    <td><strong className="block text-xs">{a?.city}</strong><span className="delivery-cell-sub">{addrText(a)}{c.addresses.length>1&&` · +${c.addresses.length-1}`}</span></td>
    <td className="client-notes">{c.notes||'—'}</td>
    <td><span className="block text-xs">{c.createdBy}</span><span className="delivery-cell-sub">{c.createdAt}</span></td>
    <td>{c.editedBy?<><span className="block text-xs">{c.editedBy}</span><span className="delivery-cell-sub">{c.editedAt}</span></>:'—'}</td>
    <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-primary" aria-label={`Действия за ${clientName(c)}`} title="Действия за клиента"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>open(c)}><Pencil/>Редактирай</DropdownMenuItem>{c.blacklisted?<DropdownMenuItem onSelect={()=>toggleBlack(c)}><Undo2/>Премахни от черния списък</DropdownMenuItem>:<DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setBlacklisting(c)}><Ban/>В черен списък</DropdownMenuItem>}<DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(c)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
    <td className="text-right"><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${clientName(c)}`} title="Преглед на клиента" onClick={()=>setSelected(c)}><Eye/></Button></div></td>
   </tr>;})}</tbody></table></div>:<div className="delivery-empty"><Users size={32}/><h3>{rows.length?'Няма намерени клиенти':'Все още няма клиенти'}</h3>{rows.length?<Button variant="outline" onClick={()=>{setName('');setPhone('');setStatus('');setKind('');}}><X/>Изчисти търсенето</Button>:<Button asChild className="mt-4"><Link to="/clients/new"><Plus/>Добави клиент</Link></Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="clients-page-size" />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни клиенти · без реално записване</div>
 </div>

 <ClientEditorDialog open={editor} onOpenChange={setEditor} editing={editing?{kind:editing.kind,first:editing.first,last:editing.last,company:editing.company,eik:editing.eik,vat:editing.vat,mol:editing.mol,email:editing.email,iban:editing.iban,phone:editing.phone,notes:editing.notes,addresses:editing.addresses,primary:editing.primary}:null} phones={rows.filter(r=>r.id!==editing?.id).map(r=>r.phone)} onSave={saveClient}/>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{selected&&clientName(selected)}</DialogTitle><DialogDescription>Детайли за клиента · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details"><div><dt>Вид</dt><dd>{selected.kind==='company'?'Юридическо лице':'Физическо лице'}</dd></div><div><dt>Телефон</dt><dd>{selected.phone}</dd></div><div><dt>ID</dt><dd>#{selected.id}</dd></div>{selected.kind==='company'&&<><div><dt>ЕИК</dt><dd>{selected.eik}</dd></div><div><dt>ДДС номер</dt><dd>{selected.vat||'—'}</dd></div><div><dt>МОЛ / контакт</dt><dd>{selected.mol||'—'}</dd></div><div><dt>Имейл</dt><dd>{selected.email||'—'}</dd></div><div className="col-span-2"><dt>Банкова сметка</dt><dd>{selected.iban||'—'}</dd></div></>}<div><dt>Статус</dt><dd><select className={`client-status-select${selected.blacklisted?' client-status-select-black':''}`} value={selected.blacklisted?'black':'active'} onChange={e=>applyStatus(selected,e.target.value==='black')} aria-label="Статус на клиента"><option value="active">Активен</option><option value="black">Черен списък</option></select></dd></div><div className="col-span-2"><dt>Бележки</dt><dd>{selected.notes||'—'}</dd></div><div><dt>Създаден от</dt><dd>{selected.createdBy}<br/><span className="delivery-cell-sub">{selected.createdAt}</span></dd></div><div><dt>Редактиран от</dt><dd>{selected.editedBy||'—'}{selected.editedAt&&<><br/><span className="delivery-cell-sub">{selected.editedAt}</span></>}</dd></div><div className="col-span-2"><dt>Адреси</dt><dd><ul className="client-address-list">{selected.addresses.map(a=><li key={a.id}><MapPin size={14}/><span>{a.city}, {addrText(a)}</span>{a.id===selected.primary&&<span className="client-badge">Основен</span>}</li>)}</ul></dd></div></dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на клиент?</DialogTitle><DialogDescription>„{deleting&&clientName(deleting)}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={()=>{if(!deleting)return;deleteClient(deleting.id);setClientNotice(`${clientName(deleting)} · Клиентът е изтрит само в демонстрацията.`);setDeleting(null);}}><Trash2/>Изтрий клиента</Button></div></DialogContent></Dialog>
 <Dialog open={blacklisting!==null} onOpenChange={o=>{if(!o)setBlacklisting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Черен списък на клиент?</DialogTitle><DialogDescription>„{blacklisting&&clientName(blacklisting)}“ ще бъде отбелязан като в черен списък и статусът ще се вижда в таблицата.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setBlacklisting(null)}>Отказ</Button><Button variant="destructive" onClick={()=>{if(!blacklisting)return;toggleBlack(blacklisting);setBlacklisting(null);}}><Ban/>В черен списък</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
