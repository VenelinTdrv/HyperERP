import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Check, Eye, Info, MoreVertical, Pencil, Plus, Search, ShieldCheck, Trash2, Truck, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const Route = createFileRoute('/suppliers')({
 head:()=>({meta:[{title:'HyperERP · Доставчици'},{name:'description',content:'Управление на доставчици, ЕИК, ДДС номер, адрес и лице за контакт в HyperERP.'},{property:'og:title',content:'HyperERP · Доставчици'},{property:'og:description',content:'Списък с доставчици, създаване, преглед, редакция и изтриване.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Suppliers,
});

const countries=['България','Румъния','Гърция','Турция','Германия','Италия','Франция','Полша'];
type Form={name:string;description:string;active:boolean;eik:string;vat:string;country:string;city:string;street:string;block:string;entrance:string;floor:string;apartment:string;postcode:string;phone:string;iban:string;contactName:string;contactEmail:string;contactPhone:string};
type Supplier=Form&{id:number};
const blank:Form={name:'',description:'',active:true,eik:'',vat:'',country:'България',city:'',street:'',block:'',entrance:'',floor:'',apartment:'',postcode:'',phone:'',iban:'',contactName:'',contactEmail:'',contactPhone:''};
const initial:Supplier[]=[
 {id:1,...blank,name:'Доставчик 1',description:'тест',eik:'204567891',vat:'BG204567891',city:'София',street:'бул. Витоша 15',postcode:'1000',phone:'029876543',iban:'BG80BNBG96611020345678',contactName:'Петър Димитров',contactEmail:'petar@dostavchik1.bg',contactPhone:'0888111222'},
 {id:2,...blank,name:'Арома Дистрибуция ООД',description:'Парфюми и аромати',eik:'131234567',vat:'BG131234567',city:'Пловдив',street:'ул. Иван Вазов 8',block:'12',entrance:'Б',floor:'3',apartment:'9',postcode:'4000',phone:'032654321',iban:'BG18RZBB91550123456789',contactName:'Николина Стоянова',contactEmail:'n.stoyanova@aroma.bg',contactPhone:'0899333444'},
 {id:3,...blank,name:'Beauty Import SRL',description:'Козметика за грижа',active:false,eik:'40123456',vat:'RO40123456',country:'Румъния',city:'Букурещ',street:'Str. Lipscani 22',postcode:'030031',phone:'+40212345678',iban:'RO49AAAA1B31007593840000',contactName:'Andrei Popescu',contactEmail:'andrei@beautyimport.ro',contactPhone:'+40722111333'},
 {id:4,...blank,name:'Елеганс Козметикс ЕООД',description:'Вносни parfюми и грижа',eik:'205123456',vat:'BG205123456',city:'София',street:'бул. Цариградско шосе 115',block:'7',entrance:'А',floor:'4',apartment:'12',postcode:'1784',phone:'029711223',iban:'BG12STSA9300001234567',contactName:'Димитър Колев',contactEmail:'d.kolev@elegans.bg',contactPhone:'0898445566'},
 {id:5,...blank,name:'Aroma Hellas SA',description:'Масла и суровини за аромати',eik:'094567812',vat:'EL094567812',country:'Гърция',city:'Атина',street:'Leof. Kifisias 42',postcode:'11523',phone:'+302107234567',iban:'GR1601101250000000012300695',contactName:'Eleni Papadopoulou',contactEmail:'e.papadopoulou@aromahellas.gr',contactPhone:'+306944112233'},
 {id:6,...blank,name:'İstanbul Kozmetik Ltd. Şti.',description:'Грим и аксесоари',eik:'6123456789',vat:'TR6123456789',country:'Турция',city:'İstanbul',street:'Bağdat Cad. 214',block:'B',postcode:'34728',phone:'+902164455667',iban:'TR330006100519786457841326',contactName:'Emre Yılmaz',contactEmail:'emre@istanbulkozmetik.tr',contactPhone:'+905321112233'},
 {id:7,...blank,name:'Nordwind Beauty GmbH',description:'Натурална козметика',eik:'912345678',vat:'DE912345678',country:'Германия',city:'Берлин',street:'Schönhauser Allee 8',postcode:'10119',phone:'+493012345678',iban:'DE89370400440532013000',contactName:'Lena Hoffmann',contactEmail:'lena@nordwind-beauty.de',contactPhone:'+491701234567'},
 {id:8,...blank,name:'Bella Cosmesi SRL',description:'Парфюмерия и сапуни',eik:'02123456789',vat:'IT02123456789',country:'Италия',city:'Милано',street:'Via Montenapoleone 3',postcode:'20121',phone:'+39027654321',iban:'IT60X0542811101000000123456',contactName:'Giulia Rossi',contactEmail:'g.rossi@bellacosmesi.it',contactPhone:'+393331234567'},
 {id:9,...blank,name:'Luxe Parfum SARL',description:'Нишови аромати',active:false,eik:'552123456',vat:'FR55552123456',country:'Франция',city:'Париж',street:'Rue Saint-Honoré 18',postcode:'75001',phone:'+33142654321',iban:'FR1420041010050500013M02606',contactName:'Camille Laurent',contactEmail:'camille@luxeparfum.fr',contactPhone:'+33612345678'},
 {id:10,...blank,name:'Polena Beauty Sp. z o.o.',description:'Грижа за кожата и косата',eik:'7010056789',vat:'PL7010056789',country:'Полша',city:'Варшава',street:'ul. Marszałkowska 27',block:'5',entrance:'C',floor:'2',apartment:'8',postcode:'00-638',phone:'+48221234567',iban:'PL61109010140000071219812874',contactName:'Anna Kowalska',contactEmail:'anna@polena-beauty.pl',contactPhone:'+48501123456'},
];
const addr=(s:Form)=>[s.street,s.block&&`бл. ${s.block}`,s.entrance&&`вх. ${s.entrance}`,s.floor&&`ет. ${s.floor}`,s.apartment&&`ап. ${s.apartment}`].filter(Boolean).join(', ');

function Suppliers(){
 const [rows,setRows]=useState(initial);
 const [name,setName]=useState('');const [eik,setEik]=useState('');const [status,setStatus]=useState('');
 const [page,setPage]=useState(1);
 const [pageSize,setPageSize]=useState(25);
 const [editor,setEditor]=useState(false);const [editing,setEditing]=useState<Supplier|null>(null);
 const [form,setForm]=useState<Form>(blank);const [errors,setErrors]=useState<Record<string,string>>({});
 const [selected,setSelected]=useState<Supplier|null>(null);const [deleting,setDeleting]=useState<Supplier|null>(null);
 const [announcement,setAnnouncement]=useState('');
 const q=name.trim().toLocaleLowerCase('bg-BG');const e=eik.trim();
 const filtered=rows.filter(r=>(!q||r.name.toLocaleLowerCase('bg-BG').includes(q))&&(!e||r.eik.includes(e))&&(!status||(status==='active')===r.active));
 const pages=Math.max(1,Math.ceil(filtered.length/(pageSize||filtered.length||1)));const cur=Math.min(page,pages);
 const shown=filtered.slice((cur-1)*(pageSize||filtered.length),(cur-1)*(pageSize||filtered.length)+pageSize||filtered.length);
 const clear=()=>{setName('');setEik('');setStatus('');setPage(1);};
 const open=(s:Supplier|null)=>{setSelected(null);setEditing(s);setErrors({});setForm(s?{...s}:{...blank});setEditor(true);};
 const set=(k:keyof Form,v:string|boolean)=>{setForm(f=>({...f,[k]:v}));setErrors(x=>{const n={...x};delete n[k];return n;});};
 const save=(ev:FormEvent)=>{
  ev.preventDefault();const er:Record<string,string>={};const t=(k:keyof Form)=>String(form[k]).trim();
  if(!t('name'))er['name']='Въведете име';
  if(!t('eik'))er['eik']='Въведете ЕИК';else if(form.country==='България'&&!/^\d{9}(\d{4})?$/.test(t('eik')))er['eik']='ЕИК трябва да е 9 или 13 цифри';
  else if(rows.some(r=>r.id!==editing?.id&&r.eik===t('eik')))er['eik']='Вече има доставчик с този ЕИК';
  if(t('vat')&&!/^[A-Z]{2}[0-9A-Z]{2,13}$/.test(t('vat').toUpperCase()))er['vat']='Невалиден ДДС номер (напр. BG123456789)';
  if(!t('city'))er['city']='Въведете град';
  if(!t('street'))er['street']='Въведете бул./ул. и номер';
  if(t('postcode')&&!/^[0-9A-Za-z -]{3,10}$/.test(t('postcode')))er['postcode']='Невалиден пощенски код';
  const phoneRe=/^\+?\d{6,15}$/;
  if(t('phone')&&!phoneRe.test(t('phone').replace(/[\s-]/g,'')))er['phone']='Невалиден телефон';
  if(t('iban')&&!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(t('iban').replace(/\s/g,'').toUpperCase()))er['iban']='Невалиден IBAN';
  if(t('contactEmail')&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t('contactEmail')))er['contactEmail']='Невалиден имейл';
  if(t('contactPhone')&&!phoneRe.test(t('contactPhone').replace(/[\s-]/g,'')))er['contactPhone']='Невалиден телефон';
  setErrors(er);
  if(Object.keys(er).length){document.getElementById(`sup-${Object.keys(er)[0]}`)?.focus();return;}
  const data:Form={...form};(Object.keys(data) as (keyof Form)[]).forEach(k=>{if(typeof data[k]==='string')(data as Record<string,unknown>)[k]=(data[k] as string).trim();});
  data.vat=data.vat.toUpperCase();data.iban=data.iban.replace(/\s/g,'').toUpperCase();
  if(editing)setRows(p=>p.map(r=>r.id===editing.id?{...data,id:r.id}:r));
  else setRows(p=>[...p,{...data,id:Math.max(0,...p.map(r=>r.id))+1}]);
  setEditor(false);setAnnouncement(`${data.name} · ${editing?'Промените са приложени':'Доставчикът е добавен'} само в демонстрацията.`);
 };
 const f=(k:keyof Form,label:string,o:{req?:boolean;ph?:string;type?:string;max?:number;wide?:boolean}={})=><div className={`field ${o.wide?'col-span-2':''}`}><label htmlFor={`sup-${k}`}>{label}{o.req&&<span className="required">*</span>}</label><input id={`sup-${k}`} type={o.type??'text'} placeholder={o.ph} maxLength={o.max??100} value={String(form[k])} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k]?`sup-${k}-error`:undefined} onChange={ev=>set(k,ev.target.value)}/>{errors[k]&&<p id={`sup-${k}-error`} className="text-xs text-destructive" role="alert">{errors[k]}</p>}</div>;
 const badge=(a:boolean)=><span className={`delivery-status ${a?'received':'cancelled'}`}><span/>{a?'Активен':'Неактивен'}</span>;
 return <WorkspaceShell active="Доставчици"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Доставчици<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Какво показва списъкът"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Фирми-доставчици с данни за фактуриране и лица за контакт. Търси по име или ЕИК и филтрирай по статус.</TooltipContent></Tooltip></TooltipProvider></h1></div><Button className="delivery-add" onClick={()=>open(null)}><Plus/>Добави доставчик</Button></div>
  <div className="suppliers-filters"><div className="search-box"><Search/><input className="search-input" aria-label="Име на доставчик" placeholder="Име…" value={name} onChange={ev=>{setName(ev.target.value);setPage(1);}}/></div><div className="search-box"><Search/><input className="search-input" inputMode="numeric" aria-label="ЕИК" placeholder="ЕИК…" value={eik} onChange={ev=>{setEik(ev.target.value);setPage(1);}}/></div><select className="filter-select" aria-label="Статус" value={status} onChange={ev=>{setStatus(ev.target.value);setPage(1);}}><option value="">Всички статуси</option><option value="active">Активен</option><option value="inactive">Неактивен</option></select><Button variant="outline" disabled={!name&&!eik&&!status} onClick={clear}><X/>Изчисти</Button></div>
  {announcement&&<div className="delivery-notice" role="status"><Check size={16}/><span>{announcement}</span><Button variant="ghost" size="icon" aria-label="Затвори съобщението" onClick={()=>setAnnouncement('')}><X/></Button></div>}
  <section className="delivery-list" aria-label="Списък с доставчици"><div className="delivery-list-heading"><h2>Всички доставчици <span>{filtered.length}</span></h2></div>
   {shown.length?<div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th>ID</th><th>Име</th><th>ЕИК / ДДС</th><th>Адрес</th><th>Лице за контакт</th><th>Статус</th><th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{shown.map(s=><tr key={s.id}>
    <td><span className="delivery-id">#{s.id}</span></td>
    <td><Button variant="ghost" className="client-name" onClick={()=>setSelected(s)}>{s.name}</Button><span className="delivery-cell-sub block">{s.description||'—'}</span></td>
    <td><strong className="block text-xs">{s.eik}</strong><span className="delivery-cell-sub">{s.vat||'—'}</span></td>
    <td><strong className="block text-xs">{s.city}, {s.country}</strong><span className="delivery-cell-sub">{addr(s)}</span></td>
    <td><span className="block text-xs">{s.contactName||'—'}</span><span className="delivery-cell-sub">{s.contactPhone}</span></td>
    <td>{badge(s.active)}</td>
    <td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-primary" aria-label={`Действия за ${s.name}`} title="Действия за доставчика"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>open(s)}><Pencil/>Редактирай</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={()=>setDeleting(s)}><Trash2/>Изтрий</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td>
    <td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${s.name}`} title="Преглед на доставчика" onClick={()=>setSelected(s)}><Eye/></Button></div></td>
   </tr>)}</tbody></table></div>:<div className="delivery-empty"><Truck size={32}/><h3>{rows.length?'Няма намерени доставчици':'Все още няма доставчици'}</h3>{rows.length?<Button variant="outline" onClick={clear}><X/>Изчисти търсенето</Button>:<Button className="mt-4" onClick={()=>open(null)}><Plus/>Добави доставчик</Button>}</div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} id="suppliers-page-size" />
  </section>
  <div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни доставчици · без реално записване</div>
 </div>

 <Dialog open={editor} onOpenChange={setEditor}><DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{editing?'Редактиране на доставчик':'Добавяне на доставчик'}</DialogTitle><DialogDescription>Примерни данни · без реално записване</DialogDescription></DialogHeader>
  <form className="delivery-editor" onSubmit={save} noValidate>
   <fieldset className="supplier-section"><legend>Основни данни</legend><div className="supplier-grid">
    {f('name','Име',{req:true,wide:true})}
    <div className="field col-span-2"><label htmlFor="sup-description">Описание <span className="text-muted-foreground font-normal">({form.description.length}/500)</span></label><textarea id="sup-description" rows={2} maxLength={500} value={form.description} onChange={ev=>set('description',ev.target.value)}/></div>
    {f('eik','ЕИК',{req:true,ph:'123456789',max:13})}{f('vat','ДДС номер',{ph:'BG123456789',max:15})}
    {f('phone','Телефонен номер',{type:'tel',ph:'02 987 6543',max:20})}{f('iban','Банкова сметка (IBAN)',{ph:'BG80 BNBG 9661 1020 3456 78',max:42})}
    <label className="supplier-active col-span-2"><input type="checkbox" checked={form.active} onChange={ev=>set('active',ev.target.checked)}/>Активен доставчик</label>
   </div></fieldset>
   <fieldset className="supplier-section"><legend>Адрес</legend><div className="supplier-grid">
    <div className="field"><label htmlFor="sup-country">Държава<span className="required">*</span></label><select id="sup-country" value={form.country} onChange={ev=>set('country',ev.target.value)}>{countries.map(c=><option key={c}>{c}</option>)}</select></div>
    {f('city','Град',{req:true,max:60})}
    {f('street','бул./ул. и номер',{req:true,wide:true,ph:'бул. Витоша 15'})}
    <div className="supplier-grid-4 col-span-2">{f('block','Блок',{max:10})}{f('entrance','Вход',{max:10})}{f('floor','Етаж',{max:5})}{f('apartment','Апартамент',{max:10})}</div>
    {f('postcode','Пощенски код',{max:10})}
   </div></fieldset>
   <fieldset className="supplier-section"><legend>Лице за контакт</legend><div className="supplier-grid">
    {f('contactName','Име и фамилия',{wide:true,max:100})}{f('contactEmail','Имейл',{type:'email',max:255})}{f('contactPhone','Телефонен номер',{type:'tel',max:20})}
   </div></fieldset>
   <div className="flex justify-end gap-2 pt-2"><Button variant="outline" type="button" onClick={()=>setEditor(false)}>Отказ</Button><Button type="submit"><Check/>Запази</Button></div>
  </form></DialogContent></Dialog>

 <Dialog open={selected!==null} onOpenChange={o=>{if(!o)setSelected(null);}}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle className="article-dialog-title">{selected?.name}</DialogTitle><DialogDescription>Детайли за доставчика · примерни данни</DialogDescription></DialogHeader>{selected&&<><dl className="delivery-details">
  <div><dt>ЕИК</dt><dd>{selected.eik}</dd></div><div><dt>ДДС номер</dt><dd>{selected.vat||'—'}</dd></div>
  <div><dt>Статус</dt><dd>{badge(selected.active)}</dd></div><div><dt>Телефон</dt><dd>{selected.phone||'—'}</dd></div>
  <div className="col-span-2"><dt>Описание</dt><dd>{selected.description||'—'}</dd></div>
  <div className="col-span-2"><dt>Адрес</dt><dd>{selected.country}, {selected.postcode&&`${selected.postcode} `}{selected.city}, {addr(selected)}</dd></div>
  <div className="col-span-2"><dt>Банкова сметка</dt><dd>{selected.iban||'—'}</dd></div>
  <div className="col-span-2"><dt>Лице за контакт</dt><dd>{selected.contactName||'—'}{selected.contactEmail&&<><br/><span className="delivery-cell-sub">{selected.contactEmail}</span></>}{selected.contactPhone&&<><br/><span className="delivery-cell-sub">{selected.contactPhone}</span></>}</dd></div>
 </dl><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button onClick={()=>open(selected)}><Pencil/>Редактирай</Button></div></>}</DialogContent></Dialog>

 <Dialog open={deleting!==null} onOpenChange={o=>{if(!o)setDeleting(null);}}><DialogContent><DialogHeader><DialogTitle className="article-dialog-title">Изтриване на доставчик?</DialogTitle><DialogDescription>„{deleting?.name}“ ще бъде премахнат само от демонстрационния списък.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setDeleting(null)}>Отказ</Button><Button variant="destructive" onClick={()=>{if(!deleting)return;setRows(p=>p.filter(r=>r.id!==deleting.id));setAnnouncement(`${deleting.name} · Доставчикът е изтрит само в демонстрацията.`);setDeleting(null);}}><Trash2/>Изтрий доставчика</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
