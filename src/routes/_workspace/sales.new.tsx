import { WorkspaceShell } from '@/components/workspace-shell';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Check, ClipboardList, FileText, Info, MapPin, Minus, Package, Plus, Search, ShieldCheck, Trash2, Truck, UserRound, UserRoundPlus, Warehouse, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientEditorDialog } from '@/components/client-editor';
import { createOrder } from '@/lib/orders-store';

export const Route = createFileRoute('/_workspace/sales/new')({
 head: () => ({ meta: [
  { title: 'HyperERP · Нова поръчка' },
  { name: 'description', content: 'HyperERP — управление на продажби, клиенти и доставки на козметика.' },
  { property: 'og:title', content: 'HyperERP · Нова поръчка' },
  { property: 'og:description', content: 'Удобно работно пространство за продажби на козметика.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
 ] }), component: Index,
});
const catalog = [
 { id: 1, name: 'Rose Élixir', sku: 'PRF-001', stock: 49, batches: [{ id: 'B-101', price: 24.9, stock: 30 }, { id: 'B-118', price: 26.5, stock: 19 }] },
 { id: 2, name: 'Velvet Bloom', sku: 'PRF-002', stock: 32, batches: [{ id: 'B-102', price: 31.2, stock: 32 }] },
 { id: 3, name: 'Pure Essence', sku: 'PRF-003', stock: 120, batches: [{ id: 'B-103', price: 18.75, stock: 80 }, { id: 'B-121', price: 19.4, stock: 40 }] },
 { id: 4, name: 'Noir Intense', sku: 'PRF-004', stock: 58, batches: [{ id: 'B-104', price: 42.0, stock: 58 }] },
 { id: 5, name: 'Aqua Fresco', sku: 'PRF-005', stock: 74, batches: [{ id: 'B-105', price: 21.3, stock: 74 }] },
 { id: 6, name: 'Hydra Cream', sku: 'CRM-001', stock: 96, batches: [{ id: 'B-106', price: 14.9, stock: 60 }, { id: 'B-122', price: 15.5, stock: 36 }] },
 { id: 7, name: 'Velvet Deo', sku: 'DEO-001', stock: 140, batches: [{ id: 'B-107', price: 6.8, stock: 140 }] },
];
const WAREHOUSES = ['Склад Главен', 'Склад София', 'Склад Варна'];
const DEMO_CLIENT = { name:'Мария Иванова', phone:'0888 123 456', city:'София', address:'ул. Витоша 15, вход Б, ап. 3', courier:'Еконт' };
type OrderItem = { id:number; batch:number; quantity:number; markup:number; gift:boolean };
const INFLUENCERS = ['Виктория Григорова','Елена Петрова','Мария Иванова'];
const CITIES = ['София','Пловдив','Варна','Бургас','Русе','Стара Загора','Плевен','Ямбол'];
const OFFICE_AREAS = ['Център','Север','Юг','Изток','Запад','Автогара'];
const money = (value:number) => `${value.toLocaleString('bg-BG', {minimumFractionDigits:2, maximumFractionDigits:2})} €`;
function Field({label, id, required, children, className=''}:{label:string;id:string;required?:boolean;children:React.ReactNode;className?:string}) {
 return <div className={`field ${className}`}><label htmlFor={id}>{label}{required && <span className="required">*</span>}</label>{children}</div>;
}
function PriceInput({value, onValue, label}:{value:number;onValue:(v:number)=>void;label:string}) {
 const [text,setText] = useState(value===0?'':String(value));
 const [editing,setEditing] = useState(false);
 useEffect(() => { if(!editing) setText(value===0?'':String(value)); }, [value, editing]);
 const commit = (raw:string) => { setText(raw); onValue(raw===''||raw==='.'?0:Number(raw)); };
 return <div className="price-field"><input type="text" inputMode="decimal" placeholder="0" aria-label={label} value={text}
  onFocus={() => { setEditing(true); if(value===0) setText(''); }}
  onChange={e => { const raw = e.target.value.replace(',','.'); if(/^\d*\.?\d*$/.test(raw)) commit(raw); }}
  onKeyDown={e => { if(e.key==='ArrowUp'||e.key==='ArrowDown'){ e.preventDefault(); const step = e.shiftKey?10:1; const next = Math.max(0,(value||0)+(e.key==='ArrowUp'?step:-step)); setText(next===0?'':String(next)); onValue(next); } }}
  onBlur={() => { setEditing(false); setText(value===0?'':String(value)); }}
 /><span>€</span></div>;
}
function Index() {
 const navigate = useNavigate();
 const [items,setItems] = useState<OrderItem[]>([]);
 const [form,setForm] = useState({city:'',courier:'Еконт',address:'',note:''});
 const [delivery,setDelivery] = useState<'address'|'office'>('address');
 const [productSearch,setProductSearch] = useState('');
 const [pickerOpen,setPickerOpen] = useState(false);
 const [clientSearch,setClientSearch] = useState('');
 const [client,setClient] = useState<{name:string;phone:string}|null>(null);
 const [error,setError] = useState('');
 const [resetOpen,setResetOpen] = useState(false);
 const [clientOpen,setClientOpen] = useState(false);
 const [influencer,setInfluencer] = useState('');
 const [office,setOffice] = useState<string|null>(null);
 const [officeSearch,setOfficeSearch] = useState('');
 const subtotal = items.reduce((sum,item) => sum + item.price*item.quantity,0);
 const count = items.reduce((sum,item)=>sum+item.quantity,0);
 const update = (key:keyof typeof form, value:string) => setForm(prev=>({...prev,[key]:value}));
 const addProduct = (id:number) => { const p=catalog.find(p=>p.id===id); if(!p)return; setItems(prev=>prev.some(i=>i.id===id)?prev.map(i=>i.id===id?{...i,quantity:i.quantity+1}:i):[...prev,{id,quantity:1,price:0}]); };
 const toggleProduct = (id:number) => { if(items.some(i=>i.id===id)) setItems(prev=>prev.filter(i=>i.id!==id)); else addProduct(id); };
 const pickerList = catalog.filter(p=>{const s=productSearch.trim().toLowerCase();return !s||`${p.name} ${p.sku}`.toLowerCase().includes(s);});
 const quantity = (id:number,value:number) => setItems(prev=>prev.map(i=>i.id===id?{...i,quantity:Math.max(1,Math.min(999,value||1))}:i));
 const price = (id:number,value:number) => setItems(prev=>prev.map(i=>i.id===id?{...i,price:Math.max(0,value||0)}:i));
 const clearOffice = () => {setOffice(null);setOfficeSearch('');update('address','');};
 const officeList = !form.city ? [] : OFFICE_AREAS.map(area => `${form.courier} · ${form.city} ${area}`).filter(name => {const s = officeSearch.trim().toLowerCase();return !s || name.toLowerCase().includes(s);});
 const reset = () => {setForm({city:'',courier:'Еконт',address:'',note:''});setItems([]);setClientSearch('');setClient(null);setProductSearch('');setError('');setDelivery('address');setInfluencer('');setOffice(null);setOfficeSearch('');};
 const submit = (event?:FormEvent) => { event?.preventDefault(); setError('Записът на нови поръчки още не е свързан.'); };
 return <WorkspaceShell active="Продажби">
   <div className="page-content new-order">
    <div className="page-heading"><div className="min-w-0"><Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Всички продажби</Link><h1>Нова поръчка</h1></div></div>
    <form onSubmit={e=>submit(e)} noValidate>
     {error && <div className="form-error" role="alert">{error}</div>}
     <div className="order-layout"><div className="min-w-0">
      <section className="order-section"><div className="section-heading"><div className="section-title"><h2>Клиент и доставка</h2></div><UserRound size={16} className="text-muted-foreground"/></div><div className="section-body">
        <div className="field"><label htmlFor="client-search">Избор на клиент</label><div className="client-search-row"><div className="search-box"><Search/><input id="client-search" className="search-input" placeholder="Търсене по име или телефон…" value={clientSearch} onChange={e=>setClientSearch(e.target.value)}/></div><Button type="button" variant="outline" className="new-client h-9" onClick={()=>setClientOpen(true)}><UserRoundPlus/>Нов клиент</Button></div><p className="text-xs text-muted-foreground mt-2">Потърсете клиент по име или телефон, или създайте нов.</p></div>
        {clientSearch && <div className="search-results">{`${DEMO_CLIENT.name} ${DEMO_CLIENT.phone}`.toLowerCase().includes(clientSearch.toLowerCase())?<Button type="button" variant="ghost" className="search-result" onClick={()=>{setClient({name:DEMO_CLIENT.name,phone:DEMO_CLIENT.phone});setForm(prev=>({...prev,city:DEMO_CLIENT.city,address:DEMO_CLIENT.address,courier:DEMO_CLIENT.courier}));setDelivery('address');setClientSearch('');}}><span>{DEMO_CLIENT.name} <small className="text-muted-foreground">· примерен клиент</small></span><span>{DEMO_CLIENT.phone}</span></Button>:<p className="p-2 text-xs text-muted-foreground">Няма намерен клиент. Добавете нов.</p>}</div>}
        {client && <div className="client-chip mt-3" role="status"><UserRound size={15}/><span className="font-semibold">{client.name}</span>{client.phone && <span className="text-muted-foreground">{client.phone}</span>}<Button type="button" variant="ghost" size="icon" className="ml-auto w-7 h-7 text-muted-foreground" aria-label="Премахни клиента" onClick={()=>setClient(null)}><Trash2 size={13}/></Button></div>}
       {client ? <>
       <div className="form-divider"/><div className="delivery-heading"><Truck size={16}/>Данни за доставка</div>
       <div className="delivery-grid"><Field label="Куриер" id="courier" required><select id="courier" value={form.courier} onChange={e=>{update('courier',e.target.value);if(delivery==='office')clearOffice();}}><option>Еконт</option><option>Спиди</option></select></Field><Field label="Град" id="city" required><div className="search-box"><Search/><input id="city" className="search-input" placeholder="Търсене на град…" value={form.city} onChange={e=>{update('city',e.target.value);if(delivery==='office')clearOffice();}} list="city-list"/></div><datalist id="city-list">{CITIES.map(city=><option key={city} value={city}/>)}</datalist></Field></div>
       <div className="field mt-3"><span className="text-[11px] font-semibold">Доставка до</span><div className="segmented" aria-label="Вид доставка"><Button type="button" variant="ghost" className="segment" aria-pressed={delivery==='address'} onClick={()=>{setDelivery('address');clearOffice();}}><Building2 size={14}/>Адрес{delivery==='address'&&<Check size={13}/>}</Button><Button type="button" variant="ghost" className="segment" aria-pressed={delivery==='office'} onClick={()=>{setDelivery('office');clearOffice();}}><Package size={14}/>Офис{delivery==='office'&&<Check size={13}/>}</Button></div></div>
       <div className="mt-3"><Field label={delivery==='address'?'Адрес за доставка':'Офис на куриера'} id="address" required>{delivery==='address'?<input id="address" autoComplete="street-address" placeholder="Улица, номер, блок, вход, етаж, апартамент" value={form.address} onChange={e=>update('address',e.target.value)}/>:office&&form.address===office?<div id="address" className="client-chip office-chip" role="status" tabIndex={-1}><MapPin size={15}/><span className="font-semibold truncate">{office}</span><span className="text-muted-foreground text-[10px]">примерен офис</span><Button type="button" variant="ghost" size="icon" className="ml-auto w-7 h-7 text-muted-foreground" aria-label="Премахни офиса" onClick={clearOffice}><X size={13}/></Button></div>:<><div className="search-box"><MapPin/><input id="address" className="search-input" placeholder={form.city?'Търсене на офис на куриера…':'Първо изберете град…'} value={officeSearch} disabled={!form.city} onChange={e=>setOfficeSearch(e.target.value)}/></div><div className="search-results office-list">{form.city?officeList.length?officeList.map(name=><Button type="button" key={name} variant="ghost" className="search-result office-option" onClick={()=>{setOffice(name);setOfficeSearch('');update('address',name);}}><span>{name}</span><small className="text-muted-foreground">примерен офис</small></Button>):<p className="p-2 text-xs text-muted-foreground">Няма намерен офис.</p>:<p className="p-2 text-xs text-muted-foreground">Първо изберете град, за да видите офисите на {form.courier}.</p>}</div></>}</Field></div>
       </> : <div className="delivery-placeholder" role="status"><Truck size={15}/><span>Данните за доставка се попълват след като изберете клиент.</span></div>}
      </div></section>
      <section className="order-section"><div className="section-heading"><div className="section-title"><h2>Продукти</h2></div><span className="text-[10px] text-muted-foreground">{count} артикула</span></div>
       <div className="section-body !pb-0">
        {!influencer && <div className="delivery-notice" role="status"><Info size={16}/><span>Първо изберете инфлуенсър в „Обобщение“: търсенето показва и неговите комбота.</span></div>}
        <Button type="button" variant="outline" className="w-full justify-start text-muted-foreground" onClick={()=>{setProductSearch('');setPickerOpen(true);}}><Plus/>Добавете продукт по име или код…</Button>
        {items.length===0 && <p className="text-sm text-muted-foreground py-3">Още няма добавени продукти</p>}
       </div>
       {items.length>0 && <table className="product-table"><thead><tr><th>Продукт</th><th>Ед. цена</th><th>Количество</th><th className="text-right">Сума</th><th><span className="sr-only">Премахване</span></th></tr></thead><tbody>{items.map(item=>{const p=catalog.find(p=>p.id===item.id);if(!p)return null;return <tr key={p.id}><td><div><div className="font-semibold">{p.name}</div><div className="text-muted-foreground text-[10px] mt-1">{p.sku} · Наличност: {p.stock}</div></div></td><td><PriceInput value={item.price} label={`Ед. цена ${p.name}`} onValue={v=>price(p.id,v)}/></td><td><div className="quantity-control"><Button type="button" variant="ghost" className="quantity-button" aria-label={`Намали ${p.name}`} onClick={()=>quantity(p.id,item.quantity-1)} disabled={item.quantity===1}><Minus size={12}/></Button><input type="number" min={1} max={999} aria-label={`Количество ${p.name}`} value={item.quantity} onChange={e=>quantity(p.id,Number(e.target.value))}/><Button type="button" variant="ghost" className="quantity-button" aria-label={`Увеличи ${p.name}`} onClick={()=>quantity(p.id,item.quantity+1)}><Plus size={12}/></Button></div></td><td className="font-bold text-right">{money(item.price*item.quantity)}</td><td><Button type="button" variant="ghost" size="icon" className="w-7 text-muted-foreground" aria-label={`Премахни ${p.name}`} title="Премахни продукта" onClick={()=>setItems(prev=>prev.filter(i=>i.id!==p.id))}><Trash2 size={14}/></Button></td></tr>;})}</tbody></table>}
       <div className="product-bottom"><ShieldCheck size={13}/>Цените са с включен ДДС</div>
      </section>
     </div>
     <aside className="summary" aria-label="Обобщение на поръчката"><div className="section-heading"><div className="section-title"><ClipboardList size={17} className="text-primary"/><h2>Обобщение</h2></div></div><div className="summary-body"><Field label="Инфлуенсър" id="influencer" required><select id="influencer" value={influencer} onChange={e=>setInfluencer(e.target.value)}><option value="">Изберете инфлуенсър</option>{INFLUENCERS.map(name=><option key={name}>{name}</option>)}</select></Field><div className="summary-line mt-3"><span>Брой артикули</span><strong>{count}</strong></div></div><div className="total-area" aria-live="polite"><div className="summary-line"><span>Общо</span><strong>{money(subtotal)}</strong></div><p>Крайна сума с включен ДДС</p></div><div className="summary-note"><Field label="Бележка към поръчката" id="note"><textarea id="note" maxLength={500} placeholder="Допълнителни уточнения…" value={form.note} onChange={e=>update('note',e.target.value)}/></Field><div className="note-counter">{form.note.length} / 500</div></div><div className="summary-status"><FileText size={13}/>Поръчката все още не е записана</div></aside>
     </div>
     <div className="order-footer"><div className="footer-buttons ml-auto"><Button type="button" variant="ghost" className="text-muted-foreground text-xs" onClick={()=>setResetOpen(true)}>Отказ</Button><Button type="submit" disabled className="save h-10 text-xs"><Check/>Запази поръчката</Button></div></div>
     <div className="demo-caption"><ShieldCheck size={12}/>Записът на нови поръчки още не е свързан</div>
    </form>
   </div>
  <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>Отказ от поръчката?</DialogTitle><DialogDescription>Въведените данни и добавените продукти ще бъдат премахнати.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setResetOpen(false)}>Продължи редакцията</Button><Button variant="destructive" onClick={()=>{reset();setResetOpen(false);}}>Изчисти</Button></div></DialogContent></Dialog>
  <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent className="product-picker"><DialogHeader><DialogTitle className="article-dialog-title">Избор на продукти</DialogTitle><DialogDescription>Търсете по SKU или име на продукт</DialogDescription></DialogHeader>
   <div className="search-box"><Search/><input className="search-input" autoFocus aria-label="Търсене по SKU или име" placeholder="SKU / Име на продукт…" value={productSearch} onChange={e=>setProductSearch(e.target.value)}/></div>
   <div className="delivery-table-scroll max-h-80 overflow-y-auto">{pickerList.length?<table className="delivery-table"><thead><tr><th>SKU</th><th>Продукт</th><th>Наличност</th><th/></tr></thead><tbody>{pickerList.map(p=>{const added=items.some(i=>i.id===p.id);return <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.stock}</td><td className="text-right"><Button type="button" size="sm" variant={added?'outline':'default'} aria-label={added?`Премахни ${p.name}`:`Добави ${p.name}`} onClick={()=>toggleProduct(p.id)}>{added?<><Check/><span className="picker-label">Добавен</span></>:<><Plus/><span className="picker-label">Добави</span></>}</Button></td></tr>;})}</tbody></table>:<p className="text-sm text-muted-foreground p-4">Няма намерени продукти.</p>}</div>
   <div className="flex justify-end"><Button onClick={()=>setPickerOpen(false)}>Готово</Button></div>
  </DialogContent></Dialog>
  <ClientEditorDialog open={clientOpen} onOpenChange={setClientOpen} editing={null} phones={[]} onSave={data=>{const a=data.addresses.find(x=>x.id===data.primary)??data.addresses[0];setClient({name:data.kind==='company'?data.company:`${data.first} ${data.last}`,phone:data.phone});setClientSearch('');if(a){setDelivery('address');setForm(prev=>({...prev,city:a.city,address:a.kind==='street'?`ул. ${a.street} ${a.number}`:a.place}));}}}/>
 </WorkspaceShell>;
}
