import { Link } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { ArrowRight, Bell, Boxes, ChevronDown, ChevronRight, CircleHelp, ClipboardList, Globe2, LayoutGrid, Menu, Package, Settings2, ShieldCheck, ShoppingBag, Sparkles, Truck, Users, Warehouse, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const groups = [
 { name:'Операции', items:[{name:'Поръчки',icon:ClipboardList,to:'/orders' as const}, {name:'Продажби',icon:ShoppingBag,to:'/' as const}, {name:'Доставки',icon:Truck,to:'/deliveries' as const}] },
 { name:'Каталог', items:[{name:'Артикули',icon:Package,to:'/articles' as const}, {name:'Комбота',icon:Boxes,to:'/combos' as const}, {name:'Категории',icon:LayoutGrid,to:'/categories' as const}] },
 { name:'Контакти и логистика', items:[{name:'Клиенти',icon:Users,to:'/clients' as const}, {name:'Доставчици',icon:Truck,to:'/suppliers' as const}, {name:'Държави',icon:Globe2,to:'/countries' as const}, {name:'Населени места',icon:Warehouse,to:'/settlements' as const}, {name:'Складове',icon:Warehouse,to:'/warehouses' as const}] },
 { name:'Администрация', items:[{name:'Потребители',icon:UserCog,to:'/users' as const}] },
 { name:'Администрация', items:[{name:'Потребители',icon:ShieldCheck}] },
];

export function WorkspaceShell({ active, children }: { active:'Поръчки'|'Продажби'|'Доставки'|'Артикули'|'Комбота'|'Категории'|'Клиенти'|'Доставчици'|'Държави'|'Населени места'|'Складове'|'Потребители'; children:ReactNode }) {
 const [mobileOpen,setMobileOpen] = useState(false);
 const [notice,setNotice] = useState<string|null>(null);
 return <div className="erp-shell">
  {mobileOpen && <div className="sidebar-scrim" aria-hidden="true" onClick={()=>setMobileOpen(false)}/>}
  <aside className={`sidebar ${mobileOpen?'mobile-open':''}`} aria-label="Главна навигация">
   <div className="brand"><div className="brand-mark">h</div><div className="brand-name">hyper<span>ERP</span></div><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Затвори менюто" onClick={()=>setMobileOpen(false)}><X/></Button></div>
   <div className="workspace-switch"><div className="workspace-icon"><Sparkles size={17}/></div><div className="min-w-0 flex-1"><strong className="block text-xs">Ehype Perfumes</strong><span className="text-[10px] text-muted-foreground">Работно пространство</span></div><ChevronDown size={13} className="text-muted-foreground"/></div>
   <nav>{groups.map(group=><div key={group.name} className="nav-group"><p className="nav-label">{group.name}</p>{group.items.map(item=> 'to' in item ? <Button key={item.name} asChild variant="ghost" className={`nav-item ${item.name===active?'active':''}`}><Link to={item.to} aria-current={item.name===active?'page':undefined} onClick={()=>setMobileOpen(false)}><item.icon size={17}/><span>{item.name}</span></Link></Button> : <Button key={item.name} variant="ghost" className="nav-item" onClick={()=>{setMobileOpen(false);setNotice(`${item.name} · Този раздел не е включен в демонстрацията.`);}}><item.icon size={17}/><span>{item.name}</span></Button>)}</div>)}</nav>
   <div className="sidebar-bottom"><Button variant="ghost" className="nav-item" onClick={()=>setNotice('Помощ и поддръжка · Разглеждате примерни данни. Реална система все още не е свързана.')}><CircleHelp/>Помощ и поддръжка<ArrowRight className="ml-auto"/></Button><div className="flex items-center gap-3 mt-4"><div className="user-avatar">ВТ</div><div className="min-w-0 flex-1"><strong className="text-[11px] block">Венелин Тодоров</strong><span className="text-[10px] text-muted-foreground">Администратор</span></div><Button variant="ghost" size="icon" aria-label="Настройки на профила" title="Настройки на профила" onClick={()=>setNotice('Профил · Демонстрационен изглед на администратор. Реален вход и ролеви достъп не са свързани.')}><Settings2/></Button></div></div>
  </aside>
  <div className="page-shell"><header className="topbar"><div className="flex items-center gap-2 min-w-0"><Button variant="ghost" size="icon" className="mobile-menu" aria-label="Отвори менюто" onClick={()=>setMobileOpen(true)}><Menu/></Button><div className="crumb"><span>Работно пространство</span><ChevronRight size={12}/><span>{active}</span>{active==='Продажби'&&<><ChevronRight size={12}/><strong>Нова поръчка</strong></>}</div></div><div className="topbar-actions"><span className="topbar-date text-[10px] text-muted-foreground">14 октомври 2026</span><Button variant="ghost" size="icon" aria-label="Известия" title="Известия" onClick={()=>setNotice('Известия · Няма нови известия.')}><Bell size={17}/></Button><div className="h-5 border-l border-border"/><Button variant="ghost" className="text-[11px] px-2" onClick={()=>setNotice('Език · Българският е активният език в тази демонстрация.')}><Globe2 size={14}/>BG<ChevronDown size={12}/></Button></div></header>{children}</div>
  <Dialog open={notice!==null} onOpenChange={open=>{if(!open)setNotice(null);}}><DialogContent><DialogHeader><DialogTitle>{notice?.split(' · ')[0]}</DialogTitle><DialogDescription>{notice?.split(' · ').slice(1).join(' · ')}</DialogDescription></DialogHeader><Button variant="outline" onClick={()=>setNotice(null)}>Затвори</Button></DialogContent></Dialog>
 </div>;
}