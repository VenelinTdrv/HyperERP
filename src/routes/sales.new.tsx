import { WorkspaceShell } from '@/components/workspace-shell';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Bell, Boxes, Check, CheckCheck, ChevronDown, ChevronRight, CircleHelp, ClipboardList, CreditCard, FileText, Globe2, LayoutGrid, ListFilter, LogOut, Menu, Minus, Package, Plus, RotateCcw, Search, Settings2, ShieldCheck, ShoppingBag, Sparkles, Trash2, Truck, UserRound, UserRoundPlus, Users, Warehouse, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import perfume from '@/assets/perfume.jpg';

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
 { id: 1, name: 'Rose Élixir', detail: 'Парфюмна вода · 50 ml', sku: 'PRF-001', price: 49 },
 { id: 2, name: 'Velvet Bloom', detail: 'Парфюмна вода · 100 ml', sku: 'PRF-002', price: 69 },
 { id: 3, name: 'Pure Essence', detail: 'Парфюмна вода · 30 ml', sku: 'PRF-003', price: 35 },
];
type OrderItem = { id:number; quantity:number };
const INFLUENCERS = ['Виктория Григорова','Елена Петрова','Мария Иванова'];
const DEMO_INFLUENCER = INFLUENCERS[0]!;
type CreatorRole = 'Администратор'|'Инфлуенсър';
const money = (value:number) => `${value.toLocaleString('bg-BG', {minimumFractionDigits:2, maximumFractionDigits:2})} €`;
function Field({label, id, required, children, className=''}:{label:string;id:string;required?:boolean;children:React.ReactNode;className?:string}) {
 return <div className={`field ${className}`}><label htmlFor={id}>{label}{required && <span className="required">*</span>}</label>{children}</div>;
}
function SectionTitle({number, title, children}:{number:string;title:string;children?:React.ReactNode}) {
 return <div className="section-heading"><div className="section-title"><span className="section-number">{number}</span><h2>{title}</h2></div>{children}</div>;
}
function Index() {
 const [items,setItems] = useState<OrderItem[]>([{id:1,quantity:1},{id:2,quantity:1}]);
 const [form,setForm] = useState({first:'',last:'',phone:'',city:'',courier:'Еконт',address:'',note:''});
 const [delivery,setDelivery] = useState<'address'|'office'>('address');
 const [discount,setDiscount] = useState(0);
 const [shipping,setShipping] = useState(4.9);
 const [productSearch,setProductSearch] = useState('');
 const [clientSearch,setClientSearch] = useState('');
 const [catalogOpen,setCatalogOpen] = useState(false);
 const [error,setError] = useState('');
 const [success,setSuccess] = useState(false);
 const [resetOpen,setResetOpen] = useState(false);
 const [creatorRole,setCreatorRole] = useState<CreatorRole>('Администратор');
 const [influencer,setInfluencer] = useState('');
 const [resetAction,setResetAction] = useState<'reset'|'cancel'>('reset');
 const subtotal = items.reduce((sum,item) => sum + (catalog.find(p=>p.id===item.id)?.price ?? 0)*item.quantity,0);
 const count = items.reduce((sum,item)=>sum+item.quantity,0);
 const total = Math.max(0,subtotal-discount)+shipping;
 const update = (key:keyof typeof form, value:string) => setForm(prev=>({...prev,[key]:value}));
 const addProduct = (id:number) => { setItems(prev=>prev.some(p=>p.id===id)?prev.map(p=>p.id===id?{...p,quantity:p.quantity+1}:p):[...prev,{id,quantity:1}]); setProductSearch(''); };
 const quantity = (id:number,value:number) => setItems(prev=>prev.map(p=>p.id===id?{...p,quantity:Math.max(1,Math.min(999,value||1))}:p));
 const reset = () => {setForm({first:'',last:'',phone:'',city:'',courier:'Еконт',address:'',note:''});setItems([]);setDiscount(0);setShipping(4.9);setClientSearch('');setProductSearch('');setError('');setDelivery('address');setInfluencer('');};
 const submit = (event?:FormEvent, newOrder=false) => {
  event?.preventDefault();
  if(!form.first.trim()||!form.last.trim()||!form.phone.trim()||!form.city||!form.address.trim()) {setError('Попълнете името, фамилията, телефона и данните за доставка.');document.getElementById(!form.first?'first':!form.last?'last':!form.phone?'phone':!form.city?'city':'address')?.focus();return;}
  if(!/^[+\d\s()-]{8,20}$/.test(form.phone)) {setError('Въведете валиден телефонен номер.');document.getElementById('phone')?.focus();return;}
  if(items.length===0) {setError('Добавете поне един продукт към поръчката.');return;}
  if(creatorRole==='Администратор'&&!influencer) {setError('Изберете инфлуенсър, към когото да се отнесе поръчката.');document.getElementById('influencer')?.focus();return;}
  setError('');setSuccess(true);if(newOrder)reset();
 };
 return <WorkspaceShell active="Продажби">
   <div className="page-content">
    <div className="page-heading"><div className="min-w-0"><Link to="/" className="text-sm text-muted-foreground hover:text-primary">← Всички продажби</Link><h1>Нова поръчка</h1><p>Всяка добра връзка с клиент започва с внимание към детайла.</p></div><div className="draft-badge"><span className="draft-dot"/>Чернова</div></div>
    <form onSubmit={e=>submit(e)} noValidate>
     {error && <div className="form-error" role="alert">{error}</div>}
     <div className="order-layout"><div className="min-w-0">
      <section className="order-section"><SectionTitle number="01" title="Клиент и доставка"><UserRound size={16} className="text-muted-foreground"/></SectionTitle><div className="section-body">
       <div className="field"><label htmlFor="client-search">Избор на клиент</label><div className="client-search-row"><div className="search-box"><Search/><input id="client-search" className="search-input" placeholder="Търсене по име или телефон…" value={clientSearch} onChange={e=>setClientSearch(e.target.value)}/></div><Button type="button" variant="outline" className="new-client h-[41px]" onClick={()=>{setForm(prev=>({...prev,first:'',last:'',phone:''}));setClientSearch('');document.getElementById('first')?.focus();}}><UserRoundPlus/>Нов клиент</Button></div></div>
       {clientSearch && <div className="search-results">{'Мария Иванова 0888123456'.toLowerCase().includes(clientSearch.toLowerCase())?<Button type="button" variant="ghost" className="search-result" onClick={()=>{setForm(prev=>({...prev,first:'Мария',last:'Иванова',phone:'0888123456',city:'София',address:'ул. „Оборище“ 12'}));setClientSearch('');}}><span>Мария Иванова <small className="text-muted-foreground">· примерен клиент</small></span><span>0888 123 456</span></Button>:<p className="p-2 text-xs text-muted-foreground">Няма намерен клиент. Добавете нов.</p>}</div>}
       <div className="field-grid mt-5"><Field label="Име" id="first" required><input id="first" autoComplete="given-name" placeholder="Име на клиента" value={form.first} onChange={e=>update('first',e.target.value)} required/></Field><Field label="Фамилия" id="last" required><input id="last" autoComplete="family-name" placeholder="Фамилия на клиента" value={form.last} onChange={e=>update('last',e.target.value)} required/></Field><Field label="Телефон" id="phone" required className="phone-field"><input id="phone" type="tel" autoComplete="tel" placeholder="Напр. 0888 123 456" value={form.phone} onChange={e=>update('phone',e.target.value)} required/></Field></div>
       <div className="form-divider"/><div className="delivery-heading"><Truck size={16}/>Данни за доставка</div>
       <div className="delivery-grid"><Field label="Населено място" id="city" required><select id="city" value={form.city} onChange={e=>{update('city',e.target.value);if(delivery==='office')update('address','');}} required><option value="">Изберете населено място</option>{['София','Пловдив','Варна','Бургас','Русе','Стара Загора','Плевен'].map(city=><option key={city}>{city}</option>)}</select></Field><Field label="Куриер" id="courier"><select id="courier" value={form.courier} onChange={e=>{update('courier',e.target.value);if(delivery==='office')update('address','');}}><option>Еконт</option><option>Спиди</option></select></Field></div>
       <div className="field mt-5"><span className="text-[11px] font-semibold">Доставка до</span><div className="segmented" aria-label="Вид доставка"><Button type="button" variant="ghost" className="segment" aria-pressed={delivery==='address'} onClick={()=>{setDelivery('address');update('address','');}}><Warehouse size={14}/>Адрес{delivery==='address'&&<Check size={13}/>}</Button><Button type="button" variant="ghost" className="segment" aria-pressed={delivery==='office'} onClick={()=>{setDelivery('office');update('address','');}}><Package size={14}/>Офис{delivery==='office'&&<Check size={13}/>}</Button></div></div>
       <div className="mt-4"><Field label={delivery==='address'?'Адрес за доставка':'Офис на куриера'} id="address" required>{delivery==='address'?<input id="address" autoComplete="street-address" placeholder="Улица, номер, блок, вход, етаж, апартамент" value={form.address} onChange={e=>update('address',e.target.value)} required/>:<select id="address" value={form.address} onChange={e=>update('address',e.target.value)} required disabled={!form.city}><option value="">{form.city?'Изберете офис':'Първо изберете населено място'}</option><option>{form.courier} · {form.city} Център (примерен офис)</option><option>{form.courier} · {form.city} Север (примерен офис)</option></select>}</Field></div>
      </div></section>
      <section className="order-section"><SectionTitle number="02" title="Продукти"><span className="text-[10px] text-muted-foreground">{count} артикула</span></SectionTitle>
       <div className="product-toolbar"><div className="search-box"><Search/><input aria-label="Търсене на продукт" className="search-input" placeholder="Добавете продукт по име или код…" value={productSearch} onChange={e=>setProductSearch(e.target.value)}/></div><Button type="button" variant="outline" className="catalog-button h-[41px]" onClick={()=>setCatalogOpen(true)}><LayoutGrid/>Каталог</Button></div>
       {productSearch && <div className="mx-5 mb-4 search-results">{catalog.filter(p=>`${p.name} ${p.sku}`.toLowerCase().includes(productSearch.toLowerCase())).map(p=><Button key={p.id} type="button" variant="ghost" className="search-result" onClick={()=>addProduct(p.id)}><span>{p.name} · {p.detail}</span><span className="flex items-center gap-2">{money(p.price)}<Plus size={14}/></span></Button>)}{!catalog.some(p=>`${p.name} ${p.sku}`.toLowerCase().includes(productSearch.toLowerCase()))&&<p className="p-2 text-xs text-muted-foreground">Няма намерени продукти.</p>}</div>}
       {items.length>0?<table className="product-table"><thead><tr><th>Продукт</th><th>Ед. цена</th><th>Количество</th><th className="text-right">Сума</th><th><span className="sr-only">Премахване</span></th></tr></thead><tbody>{items.map(item=>{const p=catalog.find(p=>p.id===item.id);if(!p)return null;return <tr key={p.id}><td><div className="product-cell"><img src={perfume} alt="" width={46} height={54} loading="lazy"/><div><div className="product-name">{p.name}</div><div className="product-sub">{p.detail}</div><div className="product-sub mt-1">{p.sku}</div></div></div></td><td>{money(p.price)}</td><td><div className="quantity-control"><Button type="button" variant="ghost" className="quantity-button" aria-label={`Намали ${p.name}`} onClick={()=>quantity(p.id,item.quantity-1)} disabled={item.quantity===1}><Minus size={12}/></Button><input type="number" min={1} max={999} aria-label={`Количество ${p.name}`} value={item.quantity} onChange={e=>quantity(p.id,Number(e.target.value))}/><Button type="button" variant="ghost" className="quantity-button" aria-label={`Увеличи ${p.name}`} onClick={()=>quantity(p.id,item.quantity+1)}><Plus size={12}/></Button></div></td><td className="font-bold text-right">{money(p.price*item.quantity)}</td><td><Button type="button" variant="ghost" size="icon" className="w-7 text-muted-foreground" aria-label={`Премахни ${p.name}`} title="Премахни продукта" onClick={()=>setItems(prev=>prev.filter(i=>i.id!==p.id))}><Trash2 size={14}/></Button></td></tr>;})}</tbody></table>:<div className="empty-products"><ShoppingBag size={25} className="mx-auto mb-3"/><p>Няма добавени продукти</p><Button type="button" variant="link" onClick={()=>setCatalogOpen(true)}><Plus/>Добави продукт</Button></div>}
       <div className="product-bottom"><ShieldCheck size={13}/>Цените са с включен ДДС</div>
      </section>
     </div>
     <aside className="summary" aria-label="Обобщение на поръчката"><div className="section-heading"><div className="section-title"><ClipboardList size={17} className="text-primary"/><h2>Обобщение</h2></div></div><div className="summary-body"><div className="summary-line"><span>Брой артикули</span><strong>{count}</strong></div><div className="summary-line"><span>Междинна сума</span><strong>{money(subtotal)}</strong></div><div className="summary-inputs"><Field label="Отстъпка" id="discount"><div className="money-field"><input id="discount" type="number" min="0" max={subtotal} step="0.01" value={discount} onChange={e=>setDiscount(Math.max(0,Math.min(subtotal,Number(e.target.value))))}/><span>€</span></div></Field><Field label="Доставка" id="shipping"><div className="money-field"><input id="shipping" type="number" min="0" step="0.01" value={shipping} onChange={e=>setShipping(Math.max(0,Number(e.target.value)))}/><span>€</span></div></Field></div></div><div className="total-area" aria-live="polite"><div className="summary-line"><span>Общо</span><strong>{money(total)}</strong></div><p>Крайна сума с включен ДДС</p></div><div className="summary-note"><Field label="Бележка към поръчката" id="note"><textarea id="note" maxLength={500} placeholder="Допълнителни уточнения…" value={form.note} onChange={e=>update('note',e.target.value)}/></Field><div className="note-counter">{form.note.length} / 500</div></div><div className="summary-status"><FileText size={13}/>Поръчката все още не е записана</div></aside>
     </div>
     <div className="order-footer"><Button type="button" variant="ghost" className="text-muted-foreground text-[11px]" onClick={()=>{setResetAction('reset');setResetOpen(true);}}><RotateCcw size={14}/>Изчисти формата</Button><div className="footer-buttons"><Button type="button" variant="ghost" className="text-muted-foreground text-xs" onClick={()=>{setResetAction('cancel');setResetOpen(true);}}>Отказ</Button><Button type="button" variant="outline" className="text-xs h-10" onClick={()=>submit(undefined,true)}><Plus/>Запази и нова</Button><Button type="submit" className="save h-10 text-xs"><Check/>Запази поръчката</Button></div></div>
     <div className="demo-caption"><ShieldCheck size={12}/>Демонстрационни продукти и цени · без реално записване на поръчки</div>
    </form>
   </div>
  <Dialog open={catalogOpen} onOpenChange={setCatalogOpen}><DialogContent className="max-w-2xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Продуктов каталог</DialogTitle><DialogDescription>Примерни продукти · Ehype Perfumes</DialogDescription></DialogHeader><div className="catalog-grid">{catalog.map(p=><div className="catalog-product" key={p.id}><img src={perfume} width={200} height={200} alt={`Примерен парфюм ${p.name}`} loading="lazy"/><div className="catalog-info"><p>{p.name}</p><small>{p.detail}</small><div className="flex items-center justify-between mt-4"><strong className="text-xs">{money(p.price)}</strong><Button type="button" size="icon" aria-label={`Добави ${p.name}`} onClick={()=>{addProduct(p.id);setCatalogOpen(false);}}><Plus/></Button></div></div></div>)}</div></DialogContent></Dialog>
  <Dialog open={success} onOpenChange={setSuccess}><DialogContent><DialogHeader><div className="w-12 h-12 bg-success-soft text-success grid place-items-center rounded-full mb-3"><CheckCheck size={24}/></div><DialogTitle>Поръчката е проверена успешно</DialogTitle><DialogDescription>Това е демонстрация на екрана. Данните не са изпратени и поръчката не е записана в реална система.</DialogDescription></DialogHeader><Button onClick={()=>setSuccess(false)}>Обратно към поръчката</Button></DialogContent></Dialog>
  <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>{resetAction==='cancel'?'Отказ от поръчката?':'Изчистване на формата?'}</DialogTitle><DialogDescription>Въведените данни и добавените продукти ще бъдат премахнати.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setResetOpen(false)}>Продължи редакцията</Button><Button variant="destructive" onClick={()=>{reset();setResetOpen(false);}}>Изчисти</Button></div></DialogContent></Dialog>
 </WorkspaceShell>;
}
