import { WorkspaceShell } from '@/components/workspace-shell';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Building2, Check, ClipboardList, FileText, Info, Minus, Package, Plus, Search, ShieldCheck, Trash2, Truck, UserRound, UserRoundPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClientEditorDialog } from '@/components/client-editor';
import { createOrder } from '@/lib/orders-store';

export const Route = createFileRoute('/sales/new')({
 head: () => ({ meta: [
  { title: 'HyperERP · Нова поръчка' },
  { name: 'description', content: 'HyperERP — управление на продажби, клиенти и доставки на козметика.' },
  { property: 'og:title', content: 'HyperERP · Нова поръчка' },
  { property: 'og:description', content: 'Удобно работно пространство за продажби на козметика.' },
  { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
 ] }), component: Index,
});
const catalog = [
 { id: 1, name: 'Rose Élixir', sku: 'PRF-001', stock: 49 },
 { id: 2, name: 'Velvet Bloom', sku: 'PRF-002', stock: 32 },
 { id: 3, name: 'Pure Essence', sku: 'PRF-003', stock: 120 },
 { id: 4, name: 'Noir Intense', sku: 'PRF-004', stock: 58 },
 { id: 5, name: 'Aqua Fresco', sku: 'PRF-005', stock: 74 },
 { id: 6, name: 'Hydra Cream', sku: 'CRM-001', stock: 96 },
 { id: 7, name: 'Velvet Deo', sku: 'DEO-001', stock: 140 },
];
const DEMO_CLIENT = { name:'Мария Иванова', phone:'0888 123 456', city:'София', address:'ул. Витоша 15, вход Б, ап. 3', courier:'Еконт' };
type OrderItem = { id:number; quantity:number; price:number };
const INFLUENCERS = ['Виктория Григорова','Елена Петрова','Мария Иванова'];
const CITIES = ['София','Пловдив','Варна','Бургас','Русе','Стара Загора','Плевен','Ямбол'];
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
 const productSearchRef = useRef<HTMLInputElement>(null);
 const productResultsRef = useRef<HTMLDivElement>(null);
 const productsTableRef = useRef<HTMLTableElement>(null);
 const revealProductSearch = () => {
  const input = productSearchRef.current;
  if (!input) return;
  const inputBounds = input.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  const tableBounds = productsTableRef.current?.getBoundingClientRect();
  if (tableBounds) {
   // Избутваме останалата информация нагоре, така че търсенето и всички
   // добавени продукти да се виждат удобно по време на въвеждане.
   const toTop = inputBounds.top - 80;
   const overflow = tableBounds.bottom - (viewportHeight - 24);
   const scroll = Math.max(toTop, overflow, 0);
   if (scroll > 0) window.scrollBy({ top: scroll, behavior });
   return;
  }
  const resultsBounds = productResultsRef.current?.getBoundingClientRect();
  const bottom = resultsBounds?.bottom ?? inputBounds.bottom + Math.min(260, viewportHeight * 0.4);
  if (inputBounds.top < 80 || bottom > viewportHeight - 24) {
   input.scrollIntoView({ block: 'start', behavior });
  }
 };
 useEffect(() => {
  if (!productSearch || document.activeElement !== productSearchRef.current) return;
  const frame = requestAnimationFrame(revealProductSearch);
  return () => cancelAnimationFrame(frame);
 }, [productSearch]);
 const [clientSearch,setClientSearch] = useState('');
 const [client,setClient] = useState<{name:string;phone:string}|null>(null);
 const [error,setError] = useState('');
 const [resetOpen,setResetOpen] = useState(false);
 const [clientOpen,setClientOpen] = useState(false);
 const [influencer,setInfluencer] = useState('');
 const subtotal = items.reduce((sum,item) => sum + item.price*item.quantity,0);
 const count = items.reduce((sum,item)=>sum+item.quantity,0);
 const update = (key:keyof typeof form, value:string) => setForm(prev=>({...prev,[key]:value}));
 const addProduct = (id:number) => { const p=catalog.find(p=>p.id===id); if(!p)return; setItems(prev=>prev.some(i=>i.id===id)?prev.map(i=>i.id===id?{...i,quantity:i.quantity+1}:i):[...prev,{id,quantity:1,price:0}]); setProductSearch(''); };
 const quantity = (id:number,value:number) => setItems(prev=>prev.map(i=>i.id===id?{...i,quantity:Math.max(1,Math.min(999,value||1))}:i));
 const price = (id:number,value:number) => setItems(prev=>prev.map(i=>i.id===id?{...i,price:Math.max(0,value||0)}:i));
 const reset = () => {setForm({city:'',courier:'Еконт',address:'',note:''});setItems([]);setClientSearch('');setClient(null);setProductSearch('');setError('');setDelivery('address');setInfluencer('');};
 const submit = (event?:FormEvent) => {
  event?.preventDefault();
  if(!client) {setError('Първо изберете клиент от търсенето или добавете нов.');return;}
  if(!form.city||!form.address.trim()) {setError('Попълнете данните за доставка.');document.getElementById(!form.city?'city':'address')?.focus();return;}
  if(items.length===0) {setError('Добавете поне един продукт към поръчката.');return;}
  if(!influencer) {setError('Изберете инфлуенсър, към когото да се отнесе поръчката.');document.getElementById('influencer')?.focus();return;}
  const products = items.flatMap(item => {
   const product = catalog.find(product => product.id === item.id);
   return product ? [{ sku: product.sku, name: product.name, quantity: item.quantity, price: item.price }] : [];
  });
  if(products.length !== items.length) {setError('Някой от продуктите вече не е наличен. Проверете поръчката.');return;}
  createOrder({ customer: client.name, phone: client.phone, city: form.city, address: form.address.trim(), courier: form.courier, note: form.note, items: products, shipping: 0, payment: 'Наложен платеж', influencer, deliveryType: delivery });
  setError('');
  reset();
  void navigate({ to: '/orders' });
 };
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
       <div className="delivery-grid"><Field label="Куриер" id="courier" required><select id="courier" value={form.courier} onChange={e=>{update('courier',e.target.value);if(delivery==='office')update('address','');}}><option>Еконт</option><option>Спиди</option></select></Field><Field label="Град" id="city" required><div className="search-box"><Search/><input id="city" className="search-input" placeholder="Търсене на град…" value={form.city} onChange={e=>{update('city',e.target.value);if(delivery==='office')update('address','');}} list="city-list"/></div><datalist id="city-list">{CITIES.map(city=><option key={city} value={city}/>)}</datalist></Field></div>
       <div className="field mt-3"><span className="text-[11px] font-semibold">Доставка до</span><div className="segmented" aria-label="Вид доставка"><Button type="button" variant="ghost" className="segment" aria-pressed={delivery==='address'} onClick={()=>{setDelivery('address');update('address','');}}><Building2 size={14}/>Адрес{delivery==='address'&&<Check size={13}/>}</Button><Button type="button" variant="ghost" className="segment" aria-pressed={delivery==='office'} onClick={()=>{setDelivery('office');update('address','');}}><Package size={14}/>Офис{delivery==='office'&&<Check size={13}/>}</Button></div></div>
       <div className="mt-3"><Field label={delivery==='address'?'Адрес за доставка':'Офис на куриера'} id="address" required>{delivery==='address'?<input id="address" autoComplete="street-address" placeholder="Улица, номер, блок, вход, етаж, апартамент" value={form.address} onChange={e=>update('address',e.target.value)}/>:<select id="address" value={form.address} onChange={e=>update('address',e.target.value)} disabled={!form.city}><option value="">{form.city?'Изберете офис':'Първо изберете град'}</option><option>{form.courier} · {form.city} Център (примерен офис)</option><option>{form.courier} · {form.city} Север (примерен офис)</option></select>}</Field></div>
       </> : <div className="delivery-placeholder" role="status"><Truck size={15}/><span>Данните за доставка се попълват след като изберете клиент.</span></div>}
      </div></section>
      <section className="order-section"><div className="section-heading"><div className="section-title"><h2>Продукти</h2></div><span className="text-[10px] text-muted-foreground">{count} артикула</span></div>
       <div className="section-body !pb-0">
        {!influencer && <div className="delivery-notice" role="status"><Info size={16}/><span>Първо изберете инфлуенсър в „Обобщение“: търсенето показва и неговите комбота.</span></div>}
        <div className="search-box"><Search/><input ref={productSearchRef} aria-label="Търсене на продукт" className="search-input scroll-mt-24" placeholder="Добавете продукт по име или код…" value={productSearch} onFocus={()=>requestAnimationFrame(revealProductSearch)} onChange={e=>setProductSearch(e.target.value)}/></div>
        {productSearch && <div ref={productResultsRef} className="search-results mt-2 max-h-[50dvh] overflow-y-auto">{catalog.filter(p=>`${p.name} ${p.sku}`.toLowerCase().includes(productSearch.toLowerCase())).map(p=><Button key={p.id} type="button" variant="ghost" className="search-result" onClick={()=>addProduct(p.id)}><span>{p.name} · {p.sku}</span><Plus size={14}/></Button>)}{!catalog.some(p=>`${p.name} ${p.sku}`.toLowerCase().includes(productSearch.toLowerCase()))&&<p className="p-2 text-xs text-muted-foreground">Няма намерени продукти.</p>}</div>}
        {items.length===0 && <p className="text-sm text-muted-foreground py-3">Още няма добавени продукти</p>}
       </div>
       {items.length>0 && <table ref={productsTableRef} className="product-table"><thead><tr><th>Продукт</th><th>Ед. цена</th><th>Количество</th><th className="text-right">Сума</th><th><span className="sr-only">Премахване</span></th></tr></thead><tbody>{items.map(item=>{const p=catalog.find(p=>p.id===item.id);if(!p)return null;return <tr key={p.id}><td><div><div className="font-semibold">{p.name}</div><div className="text-muted-foreground text-[10px] mt-1">{p.sku} · Наличност: {p.stock}</div></div></td><td><PriceInput value={item.price} label={`Ед. цена ${p.name}`} onValue={v=>price(p.id,v)}/></td><td><div className="quantity-control"><Button type="button" variant="ghost" className="quantity-button" aria-label={`Намали ${p.name}`} onClick={()=>quantity(p.id,item.quantity-1)} disabled={item.quantity===1}><Minus size={12}/></Button><input type="number" min={1} max={999} aria-label={`Количество ${p.name}`} value={item.quantity} onChange={e=>quantity(p.id,Number(e.target.value))}/><Button type="button" variant="ghost" className="quantity-button" aria-label={`Увеличи ${p.name}`} onClick={()=>quantity(p.id,item.quantity+1)}><Plus size={12}/></Button></div></td><td className="font-bold text-right">{money(item.price*item.quantity)}</td><td><Button type="button" variant="ghost" size="icon" className="w-7 text-muted-foreground" aria-label={`Премахни ${p.name}`} title="Премахни продукта" onClick={()=>setItems(prev=>prev.filter(i=>i.id!==p.id))}><Trash2 size={14}/></Button></td></tr>;})}</tbody></table>}
       <div className="product-bottom"><ShieldCheck size={13}/>Цените са с включен ДДС</div>
      </section>
     </div>
     <aside className="summary" aria-label="Обобщение на поръчката"><div className="section-heading"><div className="section-title"><ClipboardList size={17} className="text-primary"/><h2>Обобщение</h2></div></div><div className="summary-body"><Field label="Инфлуенсър" id="influencer" required><select id="influencer" value={influencer} onChange={e=>setInfluencer(e.target.value)}><option value="">Изберете инфлуенсър</option>{INFLUENCERS.map(name=><option key={name}>{name}</option>)}</select></Field><div className="summary-line mt-3"><span>Брой артикули</span><strong>{count}</strong></div></div><div className="total-area" aria-live="polite"><div className="summary-line"><span>Общо</span><strong>{money(subtotal)}</strong></div><p>Крайна сума с включен ДДС</p></div><div className="summary-note"><Field label="Бележка към поръчката" id="note"><textarea id="note" maxLength={500} placeholder="Допълнителни уточнения…" value={form.note} onChange={e=>update('note',e.target.value)}/></Field><div className="note-counter">{form.note.length} / 500</div></div><div className="summary-status"><FileText size={13}/>Поръчката все още не е записана</div></aside>
     </div>
     <div className="order-footer"><div className="footer-buttons ml-auto"><Button type="button" variant="ghost" className="text-muted-foreground text-xs" onClick={()=>setResetOpen(true)}>Отказ</Button><Button type="submit" className="save h-10 text-xs"><Check/>Запази поръчката</Button></div></div>
     <div className="demo-caption"><ShieldCheck size={12}/>Демо режим · поръчките се добавят в „Поръчки“ до презареждане на страницата</div>
    </form>
   </div>
  <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>Отказ от поръчката?</DialogTitle><DialogDescription>Въведените данни и добавените продукти ще бъдат премахнати.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setResetOpen(false)}>Продължи редакцията</Button><Button variant="destructive" onClick={()=>{reset();setResetOpen(false);}}>Изчисти</Button></div></DialogContent></Dialog>
  <ClientEditorDialog open={clientOpen} onOpenChange={setClientOpen} editing={null} phones={[]} onSave={data=>{const a=data.addresses.find(x=>x.id===data.primary)??data.addresses[0];setClient({name:`${data.first} ${data.last}`,phone:data.phone});setClientSearch('');if(a){setDelivery('address');setForm(prev=>({...prev,city:a.city,address:a.kind==='street'?`ул. ${a.street} ${a.number}`:a.place}));}}}/>
 </WorkspaceShell>;
}
