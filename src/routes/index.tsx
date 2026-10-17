import { DateRangeFilter } from '@/components/date-range-filter';
import { todayIso } from '@/lib/demo-dates';
import { rebaseDates } from '@/lib/demo-dates';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Ban, CheckCircle2, ClipboardList, Eye, FileSpreadsheet, FileText, Info, MoreVertical, Pencil, Plus, Printer, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { WorkspaceShell } from '@/components/workspace-shell';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/pagination';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import perfume from '@/assets/perfume.jpg';

export const Route = createFileRoute('/')({
 head: () => ({ meta: [
  { title: 'HyperERP · Продажби' },
  { name: 'description', content: 'Списък с всички продажби на козметика в HyperERP.' },
  { property: 'og:title', content: 'HyperERP · Продажби' },
  { property: 'og:description', content: 'Всички продажби с клиенти, продукти, доставка и статус.' },
  { property: 'og:type', content: 'website' },
  { name: 'twitter:card', content: 'summary_large_image' },
 ] }),
 component: Sales,
});

type Status = 'Необработена'|'Обработена'|'Изпратена'|'Доставена'|'Отказана';
const statuses: Status[] = ['Необработена','Обработена','Изпратена','Доставена','Отказана'];
type Order = { id: string; status: Status; customer: string; phone: string; city: string; address: string; courier: string; created: string; product: string; quantity: number; price: number; shipping: number; processed?: string; processedBy?: string };
const ADMIN = 'Венелин Тодоров';
const initialRows: Order[] = rebaseDates([
 { id:'ORD-0024', status:'Необработена', customer:'Мария Иванова', phone:'0888 123 456', city:'София', address:'ул. „Оборище“ 12', courier:'Еконт', created:'2026-10-14', product:'Rose Élixir', quantity:2, price:49, shipping:4.9 },
 { id:'ORD-0023', status:'Обработена', customer:'Елена Петрова', phone:'0888 234 567', city:'Пловдив', address:'Офис · Център', courier:'Спиди', created:'2026-10-14', product:'Velvet Bloom', quantity:1, price:69, shipping:4.9, processed:'2026-10-14T15:10:00', processedBy:ADMIN  }, { id:'ORD-0022', status:'Изпратена', customer:'Иван Георгиев', phone:'0888 345 678', city:'Варна', address:'Офис · Център', courier:'Еконт', created:'2026-10-13', product:'Pure Essence', quantity:3, price:35, shipping:4.9, processed:'2026-10-13T16:20:00', processedBy:ADMIN  }, { id:'ORD-0021', status:'Доставена', customer:'Десислава Николова', phone:'0888 456 789', city:'София', address:'ул. „Искър“ 18', courier:'Спиди', created:'2026-10-13', product:'Rose Élixir', quantity:1, price:49, shipping:4.9, processed:'2026-10-13T17:05:00', processedBy:ADMIN  }, { id:'ORD-0020', status:'Отказана', customer:'Петър Димитров', phone:'0888 567 890', city:'Бургас', address:'Офис · Център', courier:'Еконт', created:'2026-10-12', product:'Velvet Bloom', quantity:2, price:69, shipping:4.9 },
 { id:'ORD-0019', status:'Доставена', customer:'Анна Стоянова', phone:'0888 678 901', city:'Пловдив', address:'Офис · Център', courier:'Спиди', created:'2026-10-12', product:'Pure Essence', quantity:1, price:35, shipping:4.9, processed:'2026-10-12T14:45:00', processedBy:ADMIN  }, { id:'ORD-0018', status:'Обработена', customer:'Стефан Колев', phone:'0888 789 012', city:'София', address:'Офис · Младост 4', courier:'Еконт', created:'2026-10-11', product:'Hydra Cream', quantity:2, price:29, shipping:4.9, processed:'2026-10-11T12:30:00', processedBy:ADMIN  }, { id:'ORD-0017', status:'Изпратена', customer:'Румяна Дончева', phone:'0888 890 123', city:'Варна', address:'ул. „Чаталджа“ 7', courier:'Спиди', created:'2026-10-11', product:'Rose Élixir', quantity:1, price:49, shipping:4.9, processed:'2026-10-11T15:55:00', processedBy:ADMIN  }, { id:'ORD-0016', status:'Доставена', customer:'Кирил Атанасов', phone:'0888 901 234', city:'Русе', address:'Офис · Център', courier:'Еконт', created:'2026-10-10', product:'Velvet Bloom', quantity:3, price:69, shipping:4.9, processed:'2026-10-10T13:15:00', processedBy:ADMIN  }, { id:'ORD-0015', status:'Отказана', customer:'Ирина Георгиева', phone:'0888 012 345', city:'София', address:'ул. „Христо Ботев“ 31', courier:'Спиди', created:'2026-10-10', product:'Pure Essence', quantity:2, price:35, shipping:4.9 },
], ['created','processed']);
const emptyFilters = { search:'', status:'', city:'', courier:'', from:'', to:'' };
const money = (value:number) => `${value.toLocaleString('bg-BG', { minimumFractionDigits:2, maximumFractionDigits:2 })} €`;
const date = (value:string) => new Date(`${value}T12:00:00`).toLocaleDateString('bg-BG');
const dateTime = (value:string) => { const d = new Date(value); return `${d.toLocaleDateString('bg-BG')} · ${d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})}`; };
const tone: Record<Status,string> = { 'Необработена':'pending','Обработена':'transit','Изпратена':'transit','Доставена':'received','Отказана':'cancelled' };
function OrderStatus({status}:{status:Status}) { return <span className={`delivery-status ${tone[status]}`}><span/>{status}</span>; }
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]??c));
function tableHtml(list:Order[]){
 const head=['Поръчка','Статус','Клиент','Телефон','Доставка','Общо с ДДС','Създадена','Обработена от'];
 return `<table border="1" cellpadding="4" style="border-collapse:collapse;font-family:sans-serif;font-size:11px"><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${list.map(r=>`<tr><td>${esc(r.id)}</td><td>${r.status}</td><td>${esc(r.customer)}</td><td>${esc(r.phone)}</td><td>${esc(r.city)} · ${esc(r.courier)} · ${esc(r.address)}</td><td>${money(r.quantity*r.price+r.shipping)}</td><td>${date(r.created)}</td><td>${r.processed ? dateTime(r.processed) + ' / ' + esc(r.processedBy ?? ADMIN) : '—'}</td></tr>`).join('')}</tbody></table>`;
}

function Sales() {
 const [filters, setFilters] = useState(() => ({ ...emptyFilters, from: todayIso(), to: todayIso() }));
 const [advanced, setAdvanced] = useState(false);
 const [sort, setSort] = useState('newest');
 const [page, setPage] = useState(1);
 const [pageSize,setPageSize]=useState(25);
  const [selected, setSelected] = useState<Order|null>(null);
  const navigate = useNavigate();
  const [rows, setRows] = useState(initialRows);
 const [selection, setSelection] = useState<string[]>([]);
 const filter = (key:keyof typeof filters, value:string) => { setFilters(prev => ({...prev, [key]:value})); setPage(1); };
 const clear = () => { setFilters(f => ({ ...emptyFilters, from: f.from, to: f.to })); setPage(1); };
 const filtered = rows.filter(row => (!filters.status || row.status === filters.status)
  && `${row.id} ${row.customer} ${row.phone} ${row.phone.replaceAll(' ', '')} ${row.product}`.toLowerCase().includes(filters.search.trim().toLowerCase())
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
 const activeFilters = [filters.search, (filters as Record<string,string>)['status'], filters.city, filters.courier].filter(Boolean).length;
 const exportXls=()=>{const html=`<html><head><meta charset="utf-8"></head><body>${tableHtml(filtered)}</body></html>`;const blob=new Blob(['\ufeff'+html],{type:'application/vnd.ms-excel'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='prodazhbi.xls';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);};
 const exportPdf=()=>{const w=window.open('','_blank');if(!w)return;w.document.write(`<html><head><meta charset="utf-8"><title>Продажби</title><style>@page{size:A4 landscape;margin:12mm}</style></head><body><h2 style="font-family:sans-serif">Продажби</h2>${tableHtml(filtered)}<script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();};
 const exportPrint = exportPdf;
 return <WorkspaceShell active="Продажби"><div className="page-content deliveries-content orders-content">
  <div className="page-heading"><div><h1>Продажби<TooltipProvider><Tooltip><TooltipTrigger asChild><button type="button" className="orders-info" aria-label="Списъкът показва всички продажби"><Info/></button></TooltipTrigger><TooltipContent className="max-w-60 text-center">Списъкът показва всички продажби — необработени, обработени, изпратени, доставени и отказани.</TooltipContent></Tooltip></TooltipProvider></h1></div><div className="flex gap-2 flex-wrap"><Button variant="outline" size="icon" aria-label="Печат" title="Печат" onClick={exportPrint}><Printer/></Button><Button variant="outline" size="icon" aria-label="Експорт в PDF" title="Експорт в PDF" onClick={exportPdf}><FileText className="text-destructive"/></Button><Button variant="outline" size="icon" aria-label="Експорт в XLS" title="Експорт в XLS" onClick={exportXls}><FileSpreadsheet className="text-primary"/></Button><Button asChild className="delivery-add"><Link to="/sales/new"><Plus/>Нова поръчка</Link></Button></div></div>
  <div className="delivery-filters"><div className="delivery-filter-primary">
   <DateRangeFilter id="sales-period" from={filters.from} to={filters.to} onChange={(from,to)=>{setFilters(prev=>({...prev,from,to}));setPage(1);}}/>
   <div className="search-box"><Search/><input aria-label="Търси поръчка" className="search-input" placeholder="Номер, клиент, телефон или продукт…" value={filters.search} onChange={e=>filter('search',e.target.value)}/></div>
   <div className="field"><label htmlFor="orders-status" className="sr-only">Статус</label><select id="orders-status" value={filters.status} onChange={e=>filter('status',e.target.value)}><option value="">Всички статуси</option>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
   <div className="field"><label htmlFor="orders-courier" className="sr-only">Куриер</label><select id="orders-courier" value={filters.courier} onChange={e=>filter('courier',e.target.value)}><option value="">Всички куриери</option><option>Еконт</option><option>Спиди</option></select></div>
   <Button variant={advanced?'secondary':'outline'} aria-expanded={advanced} aria-controls="orders-filters" onClick={()=>setAdvanced(!advanced)}><SlidersHorizontal/>Филтри{activeFilters>0&&<span className="filter-count">{activeFilters}</span>}</Button>
  </div>{advanced&&<div className="delivery-filter-advanced" id="orders-filters">
   <div className="field"><label htmlFor="orders-city">Населено място</label><select id="orders-city" value={filters.city} onChange={e=>filter('city',e.target.value)}><option value="">Всички населени места</option>{Array.from(new Set(rows.map(row=>row.city))).map(city=><option key={city}>{city}</option>)}</select></div>
   <div className="field"><label htmlFor="orders-from">Създадена от</label><input id="orders-from" type="date" value={filters.from} max={filters.to||undefined} onChange={e=>filter('from',e.target.value)}/></div>
   <div className="field"><label htmlFor="orders-to">Създадена до</label><input id="orders-to" type="date" value={filters.to} min={filters.from||undefined} onChange={e=>filter('to',e.target.value)}/></div>
  </div>}{activeFilters>0&&<div className="delivery-filter-state"><span>{filtered.length} намерени поръчки</span><Button variant="ghost" size="sm" onClick={clear}><X/>Изчисти филтрите</Button></div>}</div>
  <section className="delivery-list" aria-label="Списък с продажби"><div className="delivery-list-heading"><h2>Списък с продажби <span>{filtered.length}</span></h2><div className="field"><label className="sr-only" htmlFor="orders-sort">Подреждане</label><select id="orders-sort" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="newest">Най-новите първо</option><option value="oldest">Най-старите първо</option></select></div></div>
   <div className="delivery-table-scroll"><table className="delivery-table orders-table"><thead><tr><th className="row-select-cell"><Checkbox aria-label="Избери всички поръчки на страницата" checked={allSelected?true:someSelected?'indeterminate':false} onCheckedChange={()=>toggleAll()}/></th><th>Поръчка</th><th>Статус</th><th>Клиент</th><th>Доставка</th><th>Общо с ДДС</th><th>Създадена</th><th>Обработена от</th><th className="delivery-head-center">Действия</th><th className="delivery-head-center">Виж</th></tr></thead><tbody>{visible.map(row=><tr key={row.id} data-selected={selection.includes(row.id)}>
    <td className="row-select-cell"><Checkbox aria-label={`Избери поръчка ${row.id}`} checked={selection.includes(row.id)} onCheckedChange={()=>toggleRow(row.id)}/></td><td><Button variant="link" className="delivery-id" onClick={()=>setSelected(row)}>{row.id}</Button><span className="delivery-cell-sub">{row.quantity} бр. · {row.product}</span></td><td><OrderStatus status={row.status}/></td><td><strong className="delivery-supplier">{row.customer}</strong><span className="delivery-cell-sub">{row.phone}</span></td><td>{row.city}<span className="delivery-cell-sub">{row.courier} · {row.address}</span></td><td className="font-semibold">{money(row.quantity*row.price+row.shipping)}</td><td>{date(row.created)}<span className="delivery-cell-sub">{ADMIN}</span></td><td>{row.processed?<>{dateTime(row.processed)}<span className="delivery-cell-sub">{row.processedBy ?? ADMIN}</span></>:<span className="delivery-cell-sub">—</span>}</td><td><div className="delivery-row-actions"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Операции ${row.id}`} title="Операции"><MoreVertical/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>navigate({to:'/orders/$id',params:{id:row.id}})}><Pencil/>Отвори и редактирай</DropdownMenuItem><DropdownMenuItem onSelect={()=>{setRows(prev=>prev.map(r=>r.id===row.id?{...r,status:'Обработена' as Status,processed:new Date().toISOString(),processedBy:ADMIN}:r));toast.success(`${row.id} е маркирана като обработена (демо).`);}}><CheckCircle2/>Маркирай като обработена</DropdownMenuItem><DropdownMenuItem className="text-destructive" onSelect={()=>{setRows(prev=>prev.map(r=>r.id===row.id?{...r,status:'Отказана' as Status}:r));toast.success(`${row.id} е анулирана (демо).`);}}><Ban/>Анулирай</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></td><td><div className="delivery-row-actions"><Button variant="ghost" size="icon" aria-label={`Преглед ${row.id}`} title="Преглед на поръчката" onClick={()=>setSelected(row)}><Eye/></Button></div></td>
   </tr>)}</tbody></table></div>
   {visible.length===0&&<div className="delivery-empty"><ClipboardList size={32}/><h3>Няма намерени поръчки</h3><p>Няма необработени поръчки за избраните филтри.</p><Button variant="outline" onClick={clear}><X/>Изчисти филтрите</Button></div>}
   {selection.length>0&&<div className="article-selection"><span>{selection.length} {selection.length===1?'избрана поръчка':'избрани поръчки'}</span><Button variant="ghost" size="sm" onClick={()=>setSelection([])}><X/>Изчисти избора</Button></div>}
      <Pagination total={filtered.length} page={page} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} noun="поръчки" id="sales-page-size" />
  </section><div className="demo-caption mt-4"><ShieldCheck size={13}/>Примерни поръчки · без реално записване</div>
 </div><Dialog open={selected!==null} onOpenChange={open=>{if(!open)setSelected(null);}}><DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">{selected&&<><DialogHeader><DialogTitle>Поръчка {selected.id}</DialogTitle><DialogDescription>Примерна поръчка · без реално записване</DialogDescription></DialogHeader><OrderStatus status={selected.status}/><dl className="delivery-details">{[['Клиент',selected.customer],['Телефон',selected.phone],['Населено място',selected.city],['Куриер',selected.courier],['Адрес / офис',selected.address],['Създадена на',date(selected.created)],['Обработена от',selected.processed?`${dateTime(selected.processed)} / ${selected.processedBy ?? ADMIN}`:'—']].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="delivery-detail-product"><img src={perfume} alt="Примерен парфюм"/><div><strong>{selected.product}</strong><p>{selected.quantity} бр. × {money(selected.price)}</p></div><strong className="ml-auto">{money(selected.quantity*selected.price)}</strong></div><dl className="delivery-details"><div><dt>Доставка</dt><dd>{money(selected.shipping)}</dd></div><div><dt>Общо с ДДС</dt><dd>{money(selected.quantity*selected.price+selected.shipping)}</dd></div></dl><Button variant="outline" onClick={()=>setSelected(null)}>Затвори</Button></>}</DialogContent></Dialog></WorkspaceShell>;
}