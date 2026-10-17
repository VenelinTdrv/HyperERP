import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CheckCircle2, ClipboardList, Info, MoreVertical, Pencil, Ban, Eye, FileSpreadsheet, FileText, Plus, Printer, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import perfume from '@/assets/perfume.jpg';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { type Order, useOrders, setOrderStatus, total, itemCount } from '@/lib/orders-store';
import { openOrderBlank, downloadOrderBlankPdf } from '@/lib/order-blank';

export const Route = createFileRoute('/orders')({
 head: () => ({ meta: [
  { title: 'HyperERP · Необработени поръчки' },
  { name: 'description', content: 'Списък с необработени поръчки за козметика в HyperERP.' },
  { property: 'og:title', content: 'HyperERP · Необработени поръчки' },
  { property: 'og:description', content: 'Клиенти, продукти и доставка за поръчки в статус Необработена.' },
  { property: 'og:type', content: 'website' },
  { name: 'twitter:card', content: 'summary_large_image' },
 ] }),
 component: Orders,
});

const emptyFilters = { search:'', city:'', courier:'', from:'', to:'' };
const money = (value:number) => `${value.toLocaleString('bg-BG', { minimumFractionDigits:2, maximumFractionDigits:2 })} €`;
const date = (value:string) => new Date(`${value}T12:00:00`).toLocaleDateString('bg-BG');
const dateTime = (value:string) => { const d = new Date(value); return `${d.toLocaleDateString('bg-BG')} · ${d.toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}`; };
function OrderStatus({status='Необработена'}:{status?:string}) { const cls = status==='Обработена'?'received':status==='Анулирана'?'cancelled':'pending'; return <span className={`delivery-status ${cls}`}><span/>{status}</span>; }
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]??c));
function tableHtml(list:Order[]){
 const head=['Поръчка','Статус','Клиент','Телефон','Доставка','Общо с ДДС','Създадена','Редактирано от'];
 return `<table border="1" cellpadding="4" style="border-collapse:collapse;font-family:sans-serif;font-size:11px"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${list.map(r=>`<tr><td>${esc(r.id)}</td><td>${r.status}</td><td>${esc(r.customer)}</td><td>${esc(r.phone)}</td><td>${esc(r.city)} · ${esc(r.courier)} · ${esc(r.address)}</td><td>${money(total(r))}</td><td>${date(r.created)}</td><td>${r.edited ? `${dateTime(r.edited)} · Венелин Тодоров` : '—'}</td></tr>`).join('')}</tbody></table>`;
}

function Orders() {
 const rows = useOrders();
 const navigate = useNavigate();
 const [filters, setFilters] = useState(emptyFilters);
 const [statusFilter, setStatusFilter] = useState('Необработена');
 const [advanced, setAdvanced] = useState(false);
 const [sort, setSort] = useState('newest');
 const [page, setPage] = useState(1);
 const [pageSize, setPageSize] = useState(10);
 const [selected, setSelected] = useState<Order|null>(null);
 const [selection, setSelection] = useState<string[]>([]);
 const filter = (key:keyof typeof filters, value:string) => { setFilters(prev => ({...prev, [key]:value})); setPage(1); };
 const clear = () => { setFilters(emptyFilters); setPage(1); };
 const filtered = rows.filter(row => row.status === statusFilter
  && `${row.id} ${row.customer} ${row.phone} ${row.phone.replaceAll(' ', '')} ${row.items.map(i=>i.name).join(' ')}`.toLowerCase().includes(filters.search.trim().toLowerCase())
  && (!filters.city || row.city === filters.city) && (!filters.courier || row.courier === filters.courier)
  && (!filters.from || row.created >= filters.from) && (!filters.to || row.created <= filters.to))
  .sort((a,b) => sort === 'oldest' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id));
 const pages = Math.max(1, Math.ceil(filtered.length/pageSize));
 const current = Math.min(page, pages);
 const visible = filtered.slice((current-1)*pageSize, current*pageSize);
 const pageIds = visible.map(row=>row.id);
 const allSelected = pageIds.length>0 && pageIds.every(id=>selection.includes(id));
 const someSelected = !allSelected && pageIds.some(id=>selection.includes(id));
 const toggleAll = () => setSelection(prev => allSelected ? prev.filter(id=>!pageIds.includes(id)) : Array.from(new Set([...prev, ...pageIds])));
 const toggleRow = (id:string) => setSelection(prev => prev.includes(id) ? prev.filter(item=>item!==id) : [...prev, id]);
 const activeFilters = Object.values(filters).filter(Boolean).length;
 const exportXls=()=>{const html=`<html><head><meta charset="utf-8"></head><body>${tableHtml(filtered)}</body></html>`;const blob=new Blob(['\ufeff'+html],{type:'application/vnd.ms-excel'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='porachki.xls';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);};
 const selectedOrders=()=>{ const orders = selection.map(id=>rows.find(r=>r.id===id)).filter((o): o is NonNullable<typeof o> => !!o); if (orders.length) return orders; toast.error(selection.length ? 'Избраните поръчки вече не са в списъка.' : 'Изберете поръчки с чекбокса.'); return null; };
 const exportPdf=()=>{ const orders = selectedOrders(); if (orders) downloadOrderBlankPdf(orders); };
 const exportPrint=()=>{ const orders = selectedOrders(); if (orders) openOrderBlank(orders); };
  return <WorkspaceShell active="Поръчки"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Поръчки<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Списъкът показва само необработени поръчки"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Списъкът показва само поръчки в статус „Необработена" — обработените и анулираните се виждат от филтъра за статус.</TooltipContent></Tooltip></TooltipProvider></h1></div><div className="flex gap-2 flex-wrap"><Button variant="outline" size="icon" aria-label="Печат" title="Печат" onClick={exportPrint}><Printer/></Button><Button variant="outline" size="icon" aria-label="Експорт в PDF" title="Експорт в PDF" onClick={exportPdf}><FileText className="text-destructive"/></Button><Button variant="outline" size="icon" aria-label="Експорт в XLS" title="Експорт в XLS" onClick={exportXls}><FileSpreadsheet className="text-primary"/></Button><Button asChild className="delivery-add"><Link to="/sales/new"><Plus/>Нова поръчка</Link></Button></div></div>
  <div className="delivery-filters"><div className="delivery-filter-primary">
   <div className="search-box"><Search/><input aria-label="Търси поръчка" className="search-input" placeholder="Номер, клиент, телефон или продукт…" value={filters.search} onChange={e=>filter('search',e.target.value)}/></div>
   <div className="field"><label htmlFor="orders-status" className="sr-only">Статус</label><select id="orders-status" value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}}><option>Необработена</option><option>Обработена</option><option>Анулирана</option></select></div>
   <div className="field"><label htmlFor="orders-courier" className="sr-only">Куриер</label><select id="orders-courier" value={filters.courier} onChange={e=>filter('courier',e.target.value)}><option value="">Всички куриери</option><option>Еконт</option><option>Спиди</option></select></div>
   <Button variant={advanced?'secondary':'outline'} aria-expanded={advanced} aria-controls="orders-filters" onClick={()=>setAdvanced(!advanced)}><SlidersHorizontal/>Филтри{activeFilters>0&&<span className="filter-count">{activeFilters}</span>}</Button>
  </div>{advanced&&<div className="delivery-filter-advanced" id="orders-filters">
   <div className="field"><label htmlFor="orders-city">Населено място</label><select id="orders-city" value={filters.city} onChange={e=>filter('city',e.target.value)}><option value="">Всички населени места</option>{Array.from(new Set(rows.map(row=>row.city))).map(city=><option key={city}>{city}</option>)}</select></div>
   <div className="field"><label htmlFor="orders-from">Създадена от</label><input id="orders-from" type="date" value={filters.from} max={filters.to||undefined} onChange={e=>filter('from',e.target.value)}/></div>
   <div className="field"><label htmlFor="orders-to">Създадена до</label><input id="orders-to" type="date" value={filters.to} min={filters.from||undefined} onChange={e=>filter('to',e.target.value)}/></div>
  </div>}{activeFilters>0&&<div className="delivery-filter-state"><span>{filtered.length} намерени поръчки</span><Button variant="ghost" size="sm" onClick={clear}><X/>Изчисти филтрите</Button></div>}</div>
  <section className="delivery-list" aria-label="Списък с поръчки"><div className="delivery-list-heading"><h2>Списък с поръчки <span>{filtered.length}</span></h2><div className="field"><label className="sr-only" htmlFor="orders-sort">Подреждане</label><select id="orders-sort" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="newest">Най-новите първо</option><option value="oldest">Най-старите първо</option></select></div></div>
   <div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th className="row-select-cell"><Checkbox aria-label="Избери всички поръчки на страницата" checked={allSelected?true:someSelected?'indeterminate':false} onCheckedChange={()=>toggleAll()}/></th><th>Поръчка</th><th>Статус</th><th>Клиент</th><th>Доставка</th><th>Общо с ДДС</th><th>Създадена</th><th>Редактирано от</th><th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{visible.map(row=><tr key={row.id} data-selected={selection.includes(row.id)}>
    <td className="row-select-cell"><Checkbox aria-label={`Избери поръчка ${row.id}`} checked={selection.includes(row.id)} onCheckedChange={()=>toggleRow(row.id)}/></td><td><Button variant="link" className="delivery-id" onClick={()=>setSelected(row)}>{row.id}</Button><span className="delivery-cell-sub">{itemCount(row)} бр. · {row.items.map(i=>i.name).join(', ')}</span></td><td><OrderStatus status={row.status}/></td><td><strong className="delivery-supplier">{row.customer}</strong><span className="delivery-cell-sub">{row.phone}</span></td><td>{row.city}<span className="delivery-cell-sub">{row.courier} · {row.address}</span></td><td className="font-semibold">{money(total(row))}</td><td>{date(row.created)}<span className="delivery-cell-sub">Венелин Тодоров</span></td><td>{row.edited ? <>{dateTime(row.edited)}<span className="delivery-cell-sub">Венелин Тодоров</span></> : <span className="delivery-cell-sub">—</span>}</td><td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="text-primary" aria-label={`Операции ${row.id}`} title="Операции"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>navigate({to:'/orders/$id',params:{id:row.id}})}><Pencil/>Отвори и редактирай</DropdownMenuItem><DropdownMenuItem onSelect={()=>downloadOrderBlankPdf(row)}><FileText/>Експорт в PDF (бланка)</DropdownMenuItem><DropdownMenuItem onSelect={()=>{setOrderStatus(row.id,'Обработена');toast.success(`${row.id} е маркирана като обработена (демо).`);}}><CheckCircle2/>Маркирай като обработена</DropdownMenuItem><DropdownMenuItem className="text-destructive" onSelect={()=>{setOrderStatus(row.id,'Анулирана');toast.success(`${row.id} е анулирана (демо).`);}}><Ban/>Анулирай</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td><td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${row.id}`} title="Преглед на поръчката" onClick={()=>setSelected(row)}><Eye/></Button></div></td>
   </tr>)}</tbody></table></div>
   {visible.length===0&&<div className="delivery-empty"><ClipboardList size={32}/><h3>Няма намерени поръчки</h3><p>Няма поръчки със статус „{statusFilter}" за избраните филтри.</p><Button variant="outline" onClick={clear}><X/>Изчисти филтрите</Button></div>}
   {selection.length>0&&<div className="article-selection"><span>{selection.length} {selection.length===1?'избрана поръчка':'избрани поръчки'}</span><div className="field"><label className="sr-only" htmlFor="orders-bulk-status">Смени статуса на избраните</label><select id="orders-bulk-status" value="" onChange={e=>{const status=e.target.value;if(!status)return;selection.forEach(id=>setOrderStatus(id,status as Order['status']));toast.success(`Статусът на ${selection.length} ${selection.length===1?'поръчка':'поръчки'} е сменен на „${status}" (демо).`);setSelection([]);}}><option value="" disabled>Смени статуса…</option><option>Необработена</option><option>Обработена</option><option>Анулирана</option></select></div><Button variant="ghost" size="sm" onClick={()=>setSelection([])}><X/>Изчисти избора</Button></div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} noun="поръчки" id="orders-page-size" />
  </section><div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни поръчки · без реално записване</div>
 </div><Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">{selected&&<><DialogHeader><DialogTitle>Поръчка {selected.id}</DialogTitle><DialogDescription>Примерна поръчка · без реално записване</DialogDescription></DialogHeader><OrderStatus status={selected.status}/><dl className="delivery-details">{[['Клиент',selected.customer],['Телефон',selected.phone],['Населено място',selected.city],['Куриер',selected.courier],['Адрес / офис',selected.address],['Метод на плащане',selected.payment],['Създадена на',date(selected.created)],['Редактирано от',selected.edited ? `${dateTime(selected.edited)} · Венелин Тодоров` : '—']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="delivery-detail-product"><img src={perfume} alt="Примерен парфюм"/><div><strong>{selected.items.map(i=>i.name).join(', ')}</strong><p>{itemCount(selected)} бр.</p></div><strong className="ml-auto">{money(total(selected)-selected.shipping)}</strong></div><dl className="delivery-details"><div><dt>Доставка</dt><dd>{money(selected.shipping)}</dd></div><div><dt>Общо с ДДС</dt><dd>{money(total(selected))}</dd></div></dl><div className="flex gap-2 justify-end"><Button variant="outline" onClick={()=>downloadOrderBlankPdf(selected)}><FileText/>Бланка (PDF)</Button><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button><Button asChild><Link to="/orders/$id" params={{id:selected.id}}><Pencil/>Редактирай</Link></Button></div></>}</DialogContent></Dialog></WorkspaceShell>;
}